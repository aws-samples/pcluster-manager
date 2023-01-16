# Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
# with the License. A copy of the License is located at
#
# http://aws.amazon.com/apache2.0/
#
# or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
# limitations under the License.
import functools
import json
import os
import re
import time

import boto3
import botocore
import requests
import yaml
from flask import abort, redirect, request, Blueprint
from jose import jwt

from api.exception.exceptions import RefreshTokenError
from api.pcm_globals import set_auth_cookies_in_context, logger, auth_cookies
from api.security.csrf.constants import CSRF_COOKIE_NAME
from api.security.csrf.csrf import csrf_needed
from api.utils import disable_auth
from api.validation import validated
from api.validation.schemas import PCProxyArgs, PCProxyBody

USER_POOL_ID = os.getenv("USER_POOL_ID")
AUTH_PATH = os.getenv("AUTH_PATH")
API_BASE_URL = os.getenv("API_BASE_URL")
API_VERSION = os.getenv("API_VERSION", "3.1.0")
API_USER_ROLE = os.getenv("API_USER_ROLE")
OIDC_PROVIDER = os.getenv("OIDC_PROVIDER")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
SECRET_ID = os.getenv("SECRET_ID")
ENABLE_MFA = os.getenv("ENABLE_MFA")
SITE_URL = os.getenv("SITE_URL", API_BASE_URL)
SCOPES_LIST = os.getenv("SCOPES_LIST")
REGION = os.getenv("AWS_DEFAULT_REGION")
TOKEN_URL = os.getenv("TOKEN_URL", f"{AUTH_PATH}/oauth2/token")
REVOKE_REFRESH_TOKEN_URL = f"{AUTH_PATH}/oauth2/revoke"
AUTH_URL = os.getenv("AUTH_URL", f"{AUTH_PATH}/login")
JWKS_URL = os.getenv("JWKS_URL")
AUDIENCE = os.getenv("AUDIENCE")
USER_ROLES_CLAIM = os.getenv("USER_ROLES_CLAIM", "cognito:groups")

try:
    if (not USER_POOL_ID or USER_POOL_ID == "") and SECRET_ID:
        secrets = boto3.client("secretsmanager")
        secret = json.loads(secrets.get_secret_value(SecretId=SECRET_ID)["SecretString"])
        USER_POOL_ID = secret.get("userPoolId")
        CLIENT_ID = secret.get("clientId")
        CLIENT_SECRET = secret.get("clientSecret")
except Exception:
    pass

if not JWKS_URL:
    JWKS_URL = os.getenv("JWKS_URL",
                         f"https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/" ".well-known/jwks.json")

def jwt_decode(token, audience=None, access_token=None):
    return jwt.decode(token, requests.get(JWKS_URL).json(), audience=audience, access_token=access_token)


def setup_api_credentials(role_arn, credential_external_id=None):
    sts = boto3.client("sts")

    assume_role_kwargs = {
        "RoleArn": role_arn,
        "RoleSessionName": "api_session",
    }
    if credential_external_id:
        assume_role_kwargs["ExternalId"] = credential_external_id

    assumed_role_object = sts.assume_role(**assume_role_kwargs)
    return assumed_role_object["Credentials"]


def sigv4_request(method, host, path, params={}, headers={}, body=None):
    "Make a signed request to an api-gateway hosting an AWS ParallelCluster API."
    endpoint = host.replace("https://", "").replace("http://", "")
    _api_id, _service, region, _domain = endpoint.split(".", maxsplit=3)

    request_parameters = "&".join([f"{k}={v}" for k, v in (params or {}).items()])
    url = f"{host}{path}?{request_parameters}"

    if API_USER_ROLE:
        sts_credentials = setup_api_credentials(API_USER_ROLE)
        session = boto3.session.Session(
            aws_access_key_id=sts_credentials["AccessKeyId"],
            aws_secret_access_key=sts_credentials["SecretAccessKey"],
            aws_session_token=sts_credentials["SessionToken"]
        )
    else:
        session = boto3.session.Session()

    body_data = json.dumps(body) if body else None
    new_request = botocore.awsrequest.AWSRequest(method=method, url=url, data=body_data)
    botocore.auth.SigV4Auth(session.get_credentials(), "execute-api", region).add_auth(new_request)
    boto_request = new_request.prepare()

    req_call = {
        "POST": requests.post,
        "GET": requests.get,
        "PUT": requests.put,
        "PATCH": requests.patch,
        "DELETE": requests.delete,
    }.get(method)

    if body:
        boto_request.headers["content-type"] = "application/json"

    for k, val in headers.items():
        boto_request.headers[k] = val

    return req_call(boto_request.url, data=body_data, headers=boto_request.headers, timeout=30)

def refresh_tokens(refresh_token):
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)

    resp = requests.post(
        TOKEN_URL,
        data={"grant_type": 'refresh_token', "refresh_token": refresh_token, "client_id": CLIENT_ID},
        auth=auth,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if resp.status_code != 200:
        raise RefreshTokenError(resp.json().get('error'))

    values = resp.json()
    access_token = values.get("access_token")
    id_token = values.get("id_token")

    return {'accessToken': access_token, 'idToken': id_token}

def authenticate(groups):
    if disable_auth():
        return

    access_token = request.cookies.get("accessToken")
    if not access_token:
        return abort(401)

    try:
        decoded = jwt_decode(access_token)
    except jwt.ExpiredSignatureError:
        refresh_token = request.cookies.get('refreshToken', None)
        if refresh_token is None:
            return abort(401)

        tokens = refresh_tokens(refresh_token)
        decoded = jwt_decode(tokens['accessToken'])
        set_auth_cookies_in_context(tokens)
    except Exception as e:
        return abort(401)

    if (not groups):
        return abort(403)
        
    jwt_roles = set(decoded.get(USER_ROLES_CLAIM, []))
    groups_granted = groups.intersection(jwt_roles)
    if len(groups_granted) == 0:
        return abort(403)

def authenticated(groups={"admin"}):
    def _authenticated(func):
        @functools.wraps(func)
        def _wrapper_authenticated(*args, **kwargs):
            authenticate(groups)
            return func(*args, **kwargs)

        return _wrapper_authenticated

    return _authenticated

def get_scopes_list():
  if not SCOPES_LIST:
    return "openid"
  elif "openid" not in SCOPES_LIST:
    return SCOPES_LIST + " openid"
  return SCOPES_LIST

def get_redirect_uri():
  return f"{SITE_URL}/login"
  
# Local Endpoints


def get_version():
    return {"version": API_VERSION, "enable_mfa": ENABLE_MFA == "true"}

def get_app_config():
  return {
    "auth_url": AUTH_URL,
    "client_id": CLIENT_ID,
    "oidc_provider": OIDC_PROVIDER,
    "scopes": get_scopes_list(),
    "redirect_uri": get_redirect_uri()
  }

def ec2_action():
    if request.args.get("region"):
        config = botocore.config.Config(region_name=request.args.get("region"))
        ec2 = boto3.client("ec2", config=config)
    else:
        ec2 = boto3.client("ec2")

    try:
        instance_ids = request.args.get("instance_ids").split(",")
    except:
        return {"message": "You must specify instances."}, 400

    if request.args.get("action") == "stop_instances":
        resp = ec2.stop_instances(InstanceIds=instance_ids)
    elif request.args.get("action") == "start_instances":
        resp = ec2.start_instances(InstanceIds=instance_ids)
    else:
        return {"message": "You must specify an action."}, 400

    ret = {"message": "success"}
    return ret


def get_cluster_config_text(cluster_name, region=None):
    url = f"/v3/clusters/{cluster_name}"
    if region:
        info_resp = sigv4_request("GET", API_BASE_URL, url, params={"region": region})
    else:
        info_resp = sigv4_request("GET", API_BASE_URL, url)
    if info_resp.status_code != 200:
        abort(info_resp.status_code)

    cluster_info = info_resp.json()
    configuration = requests.get(cluster_info["clusterConfiguration"]["url"])
    return configuration.text


def get_cluster_config():
    return get_cluster_config_text(request.args.get("cluster_name"), request.args.get("region"))


def ssm_command(region, instance_id, user, run_command):
    # working_directory |= f"/home/{user}"
    start = time.time()

    if region:
        config = botocore.config.Config(region_name=region)
        ssm = boto3.client("ssm", config=config)
    else:
        ssm = boto3.client("ssm")

    command = f"runuser -l {user} -c '{run_command}'"

    ssm_resp = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Comment=f"Run ssm command.",
        Parameters={"commands": [command]},
    )

    command_id = ssm_resp["Command"]["CommandId"]

    # Wait for command to complete
    time.sleep(0.75)
    while time.time() - start < 60:
        status = ssm.get_command_invocation(CommandId=command_id, InstanceId=instance_id)
        if status["Status"] != "InProgress":
            break
        time.sleep(0.75)

    if time.time() - start > 60:
        raise Exception("Timed out waiting for command to complete.")

    if status["Status"] != "Success":
        raise Exception(status["StandardErrorContent"])

    output = status["StandardOutputContent"]
    return output

def _price_estimate(cluster_name, region, queue_name):
    config_text = get_cluster_config_text(cluster_name, region)
    config_data = yaml.safe_load(config_text)
    queues = {q["Name"]: q for q in config_data["Scheduling"]["SlurmQueues"]}
    queue = queues[queue_name]

    if len(queue["ComputeResources"]) == 1:
        instance_type = queue["ComputeResources"][0]["InstanceType"]
        pricing_filters = [
            {"Field": "tenancy", "Value": "shared", "Type": "TERM_MATCH"},
            {"Field": "instanceType", "Value": instance_type, "Type": "TERM_MATCH"},
            {"Field": "operatingSystem", "Value": "Linux", "Type": "TERM_MATCH"},
            {"Field": "regionCode", "Value": region, "Type": "TERM_MATCH"},
            {"Field": "preInstalledSw", "Value": "NA", "Type": "TERM_MATCH"},
            {"Field": "capacityStatus", "Value": "Used", "Type": "TERM_MATCH"},
        ]

        # Pricing endpoint only available from "us-east-1" region
        pricing = boto3.client("pricing", region_name="us-east-1")
        prices = pricing.get_products(ServiceCode="AmazonEC2", Filters=pricing_filters)["PriceList"]
        prices = list(map(json.loads, prices))
        on_demand_prices = list(prices[0]["terms"]["OnDemand"].values())
        price_guess = float(list(on_demand_prices[0]["priceDimensions"].values())[0]["pricePerUnit"]["USD"])
        price_guess = None if price_guess != price_guess else price_guess  # check for NaN
        return price_guess
    else:
        return {"message": "Cost estimate not available for queues with multiple resource types."}, 400


def price_estimate():
    price_guess = _price_estimate(
        request.args.get("cluster_name"), request.args.get("region"), request.args.get("queue_name")
    )
    return price_guess if isinstance(price_guess, tuple) else {"estimate": price_guess}


def sacct():
    user = request.args.get("user", "ec2-user")
    instance_id = request.args.get("instance_id")
    cluster_name = request.args.get("cluster_name")
    region = request.args.get("region")
    body = request.json

    price_guess = None
    sacct_args = " ".join(f"--{k} {v}" for k, v in body.items())
    sacct_args += " --allusers" if "user" not in body else ""

    if "jobs" not in body:
        accounting = ssm_command(
            region,
            instance_id,
            user,
            f"sacct {sacct_args} --json "
            + "| jq -c .jobs[0:120]\\|\\map\\({name,user,partition,state,job_id,exit_code\\}\\)",
        )
        if type(accounting) is tuple:
            return accounting
    else:

        accounting = ssm_command(region, instance_id, user, f"sacct {sacct_args} --json | jq -c .jobs")
        if isinstance(accounting, tuple):
            return accounting
        # Try to retrieve relevant cost information
        queue_name = json.loads(accounting)[0]["partition"]
        _price_guess = _price_estimate(cluster_name, region, queue_name)
        if not isinstance(_price_guess, tuple):
            price_guess = _price_guess

    if accounting == "":
        return {"jobs": []}
    accounting_ret = {"jobs": json.loads(accounting)}
    if "jobs" in sacct_args and price_guess:
        accounting_ret["jobs"][0]["price_estimate"] = price_guess
    return accounting_ret


def scontrol_job():
    user = request.args.get("user", "ec2-user")
    instance_id = request.args.get("instance_id")
    job_id = request.args.get("job_id")

    if not job_id:
        return {"message": "You must specify a job id."}, 400

    job_data = (
        ssm_command(request.args.get("region"), instance_id, user, f"scontrol show job {job_id} -o").strip().split(" ")
    )
    if isinstance(job_data, tuple):
        return job_data

    kvs = [jd.split("=", 1) for jd in job_data]
    job_info = {k: v for k, v in kvs}
    return job_info


def queue_status():
    user = request.args.get("user", "ec2-user")
    instance_id = request.args.get("instance_id")

    jobs = ssm_command(
        request.args.get("region"),
        instance_id,
        user,
        "squeue --json | jq .jobs\\|\\map\\({name,nodes,partition,job_state,job_id,time\\}\\)",
    )

    return {"jobs": []} if jobs == "" else {"jobs": json.loads(jobs)}


def cancel_job():
    user = request.args.get("user", "ec2-user")
    instance_id = request.args.get("instance_id")
    job_id = request.args.get("job_id")
    ssm_command(request.args.get("region"), instance_id, user, f"scancel {job_id}")
    return {"status": "success"}


def get_dcv_session():
    start = time.time()
    user = request.args.get("user", "ec2-user")
    instance_id = request.args.get("instance_id")
    dcv_command = "/opt/parallelcluster/scripts/pcluster_dcv_connect.sh"
    session_directory = f"/home/{user}"

    if request.args.get("region"):
        config = botocore.config.Config(region_name=request.args.get("region"))
        ssm = boto3.client("ssm", config=config)
    else:
        ssm = boto3.client("ssm")

    command = f"runuser -l {user} -c '{dcv_command} {session_directory}'"

    ssm_resp = ssm.send_command(
        InstanceIds=[instance_id],
        DocumentName="AWS-RunShellScript",
        Comment="Create DCV Session",
        Parameters={"commands": [command]},
    )

    command_id = ssm_resp["Command"]["CommandId"]

    # Wait for command to complete
    time.sleep(0.75)
    while time.time() - start < 15:
        status = ssm.get_command_invocation(CommandId=command_id, InstanceId=instance_id)
        if status["Status"] != "InProgress":
            break
        time.sleep(0.75)

    if time.time() - start > 15:
        raise Exception("Timed out waiting for dcv session to start.")

    if status["Status"] != "Success":
        raise Exception(status["StandardErrorContent"])

    output = status["StandardOutputContent"]

    dcv_parameters = re.search(
        r"PclusterDcvServerPort=([\d]+) PclusterDcvSessionId=([\w]+) PclusterDcvSessionToken=([\w-]+)", output
    )

    if not dcv_parameters:
        raise Exception("Something went wrong during DCV connection. Check logs in /var/log/parallelcluster/ .")

    ret = {
        "port": dcv_parameters.group(1),
        "session_id": dcv_parameters.group(2),
        "session_token": dcv_parameters.group(3),
    }
    return ret


def get_custom_image_config():
    image_info = sigv4_request("GET", API_BASE_URL, f"/v3/images/custom/{request.args.get('image_id')}").json()
    configuration = requests.get(image_info["imageConfiguration"]["url"])
    return configuration.text


def get_aws_config():
    if request.args.get("region"):
        config = botocore.config.Config(region_name=request.args.get("region"))
        ec2 = boto3.client("ec2", config=config)
        fsx = boto3.client("fsx", config=config)
        efs = boto3.client("efs", config=config)
    else:
        ec2 = boto3.client("ec2")
        fsx = boto3.client("fsx")
        efs = boto3.client("efs")

    keypairs = ec2.describe_key_pairs()["KeyPairs"]
    vpcs = ec2.describe_vpcs()["Vpcs"]
    subnets = ec2.describe_subnets()["Subnets"]

    security_groups = ec2.describe_security_groups()["SecurityGroups"]
    security_groups = [{k: sg[k] for k in {"GroupId", "GroupName"}} for sg in security_groups]

    efa_filters = [{"Name": "network-info.efa-supported", "Values": ["true"]}]
    instance_paginator = ec2.get_paginator("describe_instance_types")
    efa_instances_paginator = instance_paginator.paginate(Filters=efa_filters)
    efa_instance_types = []
    for efa_instances in efa_instances_paginator:
        efa_instance_types += [e["InstanceType"] for e in efa_instances["InstanceTypes"]]

    fsx_filesystems = []
    try:
        fsx_filesystems = fsx.describe_file_systems()["FileSystems"]
    except:
        pass

    fsx_volumes = []
    try:
        fsx_volumes = list(filter(lambda vol: (vol["Lifecycle"] == "CREATED" or vol["Lifecycle"] == "AVAILABLE"),
                                  fsx.describe_volumes()["Volumes"]))
    except:
        pass

    efs_filesystems = []
    try:
        efs_filesystems = efs.describe_file_systems()["FileSystems"]
    except:
        pass

    region = ""
    try:
        region = boto3.Session().region_name
    except:
        pass

    return {
        "security_groups": security_groups,
        "keypairs": keypairs,
        "vpcs": vpcs,
        "subnets": subnets,
        "region": region,
        "fsx_filesystems": fsx_filesystems,
        "fsx_volumes": fsx_volumes,
        "efs_filesystems": efs_filesystems,
        "efa_instance_types": efa_instance_types,
    }


def get_instance_types():
    if request.args.get("region"):
        config = botocore.config.Config(region_name=request.args.get("region"))
        ec2 = boto3.client("ec2", config=config)
    else:
        ec2 = boto3.client("ec2")
    filters = [
        {"Name": "current-generation", "Values": ["true"]},
        {"Name": "instance-type",
         "Values": ["c5*", "c6*", "g4*", "g5*", "hpc*", "p3*", "p4*", "t2*", "t3*", "m6*", "r*"]},
    ]
    instance_paginator = ec2.get_paginator("describe_instance_types")
    instances_paginator = instance_paginator.paginate(Filters=filters)
    instance_types = []
    for ec2_instances in instances_paginator:
        for e in ec2_instances["InstanceTypes"]:
            ret_e = {"InstanceType": e["InstanceType"]}
            ret_e["NetworkInfo"] = {"EfaSupported": e["NetworkInfo"].get("EfaSupported", False)}
            ret_e["MemoryInfo"] = e["MemoryInfo"]
            ret_e["VCpuInfo"] = {"DefaultVCpus": e["VCpuInfo"]["DefaultVCpus"]}
            ret_e["GpuInfo"] = e.get("GpuInfo", {"Gpus": [{}]})["Gpus"][0]
            instance_types.append(ret_e)
    return {"instance_types": sorted(instance_types, key=lambda x: x["InstanceType"])}


def _get_identity_from_token(decoded, claims):
    identity = {"attributes": {}}

    if USER_ROLES_CLAIM in decoded:
        identity["user_roles"] = decoded[USER_ROLES_CLAIM]
    if "username" in decoded:
        identity["username"] = decoded["username"]

    for claim in claims:
      if claim in decoded:
        identity["attributes"][claim] = decoded[claim]
    
    return identity

def get_identity():
    if disable_auth():
        return {"user_roles": ["user", "admin"], "username": "username", "attributes": {"email": "user@domain.com"}}

    access_token = request.cookies.get("accessToken")
    id_token = request.cookies.get("idToken", None)

    claims = ["email"]
    try:
        decoded_access = jwt_decode(access_token)
    except jwt.ExpiredSignatureError:
        decoded_access = jwt_decode(auth_cookies['accessToken'])

    identity = _get_identity_from_token(decoded=decoded_access, claims=claims)

    if id_token:
        decoded_id = jwt_decode(id_token, audience=AUDIENCE, access_token=access_token)
        identity_from_id_token = _get_identity_from_token(decoded=decoded_id, claims=claims)
        identity.update(identity_from_id_token)

    if "username" not in identity:
        raise Exception('No username present in access or id token.')
    if "user_roles" not in identity:
        raise Exception('No user_roles present in access or id token.')

    return identity


def _augment_user(cognito, user):
    try:
        groups_list = cognito.admin_list_groups_for_user(UserPoolId=USER_POOL_ID, Username=user["Username"])
        user["Groups"] = groups_list["Groups"]
    except Exception as e:
        user["exception"] = str(e)
    user["Attributes"] = {ua["Name"]: ua["Value"] for ua in user["Attributes"]}
    return user


def list_users():
    cognito = boto3.client("cognito-idp")
    users = cognito.list_users(UserPoolId=USER_POOL_ID)["Users"]
    return {"users": [_augment_user(cognito, user) for user in users]}


def delete_user():
    cognito = boto3.client("cognito-idp")
    username = request.args.get("username")
    cognito.admin_delete_user(UserPoolId=USER_POOL_ID, Username=username)
    return {"Username": username}

def create_user():
    cognito = boto3.client("cognito-idp")
    username = request.json.get("Username")
    phone_number = request.json.get("Phonenumber")
    user_attributes = [{"Name": "email", "Value": username}]
    if phone_number:
        user_attributes.append({"Name": "phone_number", "Value": phone_number})
    user = cognito.admin_create_user(
        UserPoolId=USER_POOL_ID, Username=username, DesiredDeliveryMediums=["EMAIL"], UserAttributes=user_attributes
    ).get("User")
    cognito.admin_add_user_to_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="admin")
    return _augment_user(cognito, user)

def login():
    code = request.args.get("code")

    # Convert the authorization code into a jwt
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    grant_type = "authorization_code"

    url = TOKEN_URL
    code_resp = requests.post(
        url,
        data={"grant_type": grant_type, "code": code, "client_id": CLIENT_ID, "redirect_uri": get_redirect_uri()},
        auth=auth,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    access_token = code_resp.json().get("access_token")
    if not access_token:
        return abort(401)

    id_token = code_resp.json().get("id_token")
    refresh_token = code_resp.json().get("refresh_token", None)

    resp = redirect("/index.html", code=302)
    resp.set_cookie("accessToken", access_token, httponly=True, secure=True, samesite="Lax")
    resp.set_cookie("idToken", id_token, httponly=True, secure=True, samesite="Lax")
    if refresh_token is not None:
        resp.set_cookie("refreshToken", refresh_token, httponly=True, secure=True, samesite="Lax")
    return resp


def logout():
    refresh_token = request.cookies.get('refreshToken', None)
    if refresh_token is not None:
        revoke_cognito_refresh_token(refresh_token)

    resp = __cognito_logout_redirect(get_app_config())
    resp.set_cookie("accessToken", "", expires=0)
    resp.set_cookie("idToken", "", expires=0)
    resp.set_cookie("refreshToken", "", expires=0)
    resp.set_cookie(CSRF_COOKIE_NAME, "", expires=0)
    return resp

def revoke_cognito_refresh_token(refresh_token):
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    revoke_resp = requests.post(
        REVOKE_REFRESH_TOKEN_URL,
        data={"token": refresh_token},
        auth=auth,
        headers={"Content-Type": "application/x-www-form-urlencoded"})

    if revoke_resp.status_code != 200:
        logger.warning('Unable to revoke cognito refresh token')



def __cognito_logout_redirect(config):
    auth_url = AUTH_PATH
    client_id = config['client_id']
    redirect_uri = config['redirect_uri']
    scope_list = config['scopes']

    target_url = f'{auth_url}/logout?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code&scope={scope_list}'
    return redirect(target_url, code=302)

def _get_params(_request):
    params = {**_request.args}
    params.pop("path")
    return params


pc = Blueprint('pc', __name__)

@pc.get('/', strict_slashes=False)
@authenticated({'admin'})
@validated(params=PCProxyArgs)
def pc_proxy_get():
    response = sigv4_request(request.method, API_BASE_URL, request.args.get("path"), _get_params(request))
    return response.json(), response.status_code

@pc.route('/', methods=['POST','PUT','PATCH','DELETE'], strict_slashes=False)
@authenticated({'admin'})
@csrf_needed
@validated(params=PCProxyArgs, body=PCProxyBody, raise_on_missing_body=False)
def pc_proxy():
    body = None
    try:
        body = request.json
    except:
        pass

    response = sigv4_request(request.method, API_BASE_URL, request.args.get("path"), _get_params(request), body=body)
    return response.json(), response.status_code