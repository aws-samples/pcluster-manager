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
from flask import abort, redirect, request
from flask_restful import Resource, reqparse
from jose import jwt

USER_POOL_ID = os.getenv("USER_POOL_ID")
AUTH_PATH = os.getenv("AUTH_PATH")
API_BASE_URL = os.getenv("API_BASE_URL")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
SECRET_ID = os.getenv("SECRET_ID")
SITE_URL = os.getenv("SITE_URL", API_BASE_URL)

try:
    if (not USER_POOL_ID or USER_POOL_ID == "") and SECRET_ID:
        secrets = boto3.client("secretsmanager")
        secret = json.loads(secrets.get_secret_value(SecretId=SECRET_ID)["SecretString"])
        USER_POOL_ID = secret.get("userPoolId")
        CLIENT_ID = secret.get("clientId")
        CLIENT_SECRET = secret.get("clientSecret")
except Exception:
    pass

# Helpers


def running_local():
    return not os.getenv("AWS_LAMBDA_FUNCTION_NAME")


def disable_auth():
    return os.getenv("ENABLE_AUTH") == "false"


def jwt_decode(token, user_pool_id):
    region = user_pool_id.split("_")[0]
    jwks_url = "https://cognito-idp.{}.amazonaws.com/{}/" ".well-known/jwks.json".format(region, user_pool_id)
    return jwt.decode(token, requests.get(jwks_url).json())


def sigv4_request(method, host, path, params={}, headers={}, body=None):
    "Make a signed request to an api-gateway hosting an AWS ParallelCluster API."
    endpoint = host.replace("https://", "").replace("http://", "")
    _api_id, _service, region, _domain = endpoint.split(".", maxsplit=3)

    request_parameters = "&".join([f"{k}={v}" for k, v in (params or {}).items()])
    url = f"{host}{path}?{request_parameters}"

    session = botocore.session.Session()
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


# Wrappers


def auth_redirect():
    redirect_uri = f"{SITE_URL}/login"
    auth_redirect_path = f"{AUTH_PATH}/login?response_type=code&client_id={CLIENT_ID}&redirect_uri={redirect_uri}"
    return redirect(auth_redirect_path, code=302)


def authenticate(group):
    if running_local():
        return

    access_token = request.cookies.get("accessToken")
    if not access_token:
        return auth_redirect()
    try:
        decoded = jwt_decode(access_token, USER_POOL_ID)
    except jwt.ExpiredSignatureError:
        return auth_redirect()
    if not disable_auth() and (group != "guest") and (group not in set(decoded.get("cognito:groups", []))):
        return auth_redirect()


def authenticated(group="user", redirect=True):
    def _authenticated(func):
        @functools.wraps(func)
        def _wrapper_authenticated(*args, **kwargs):
            auth_response = authenticate(group)
            if auth_response:
                return auth_response if redirect else abort(401)
            return func(*args, **kwargs)

        return _wrapper_authenticated

    return _authenticated


# Local Endpoints


def get_cluster_config():
    parser = reqparse.RequestParser()
    parser.add_argument("cluster_name", type=str)
    parser.add_argument("region", type=str)
    args = parser.parse_args()
    url = f"/v3/clusters/{args['cluster_name']}"
    if args.get("region"):
        info_resp = sigv4_request("GET", API_BASE_URL, url, params={"region": args.get("region")})
    else:
        info_resp = sigv4_request("GET", API_BASE_URL, url)
    if info_resp.status_code != 200:
        print(info_resp.json())
        return info_resp.json(), info_resp.status_code
    cluster_info = info_resp.json()
    configuration = requests.get(cluster_info["clusterConfiguration"]["url"])
    return configuration.text


def get_dcv_session():
    parser = reqparse.RequestParser()
    parser.add_argument("instance_id", type=str)
    parser.add_argument("user", type=str)
    parser.add_argument("region", type=str)
    args = parser.parse_args()
    start = time.time()
    user = args.get("user", "ec2-user")
    instance_id = args.get("instance_id")
    dcv_command = "/opt/parallelcluster/scripts/pcluster_dcv_connect.sh"
    session_directory = f"/home/{user}"

    if args.get("region"):
        config = botocore.config.Config(region_name=args.get("region"))
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
        abort(500, description="Timed out waiting for dcv session to start.")

    if status["Status"] != "Success":
        abort(500, description=status["StandardErrorContent"])

    output = status["StandardOutputContent"]

    dcv_parameters = re.search(
        r"PclusterDcvServerPort=([\d]+) PclusterDcvSessionId=([\w]+) PclusterDcvSessionToken=([\w-]+)", output
    )

    if not dcv_parameters:
        abort(500, description="Something went wrong during DCV connection. Check logs in /var/log/parallelcluster/ .")

    ret = {
        "port": dcv_parameters.group(1),
        "session_id": dcv_parameters.group(2),
        "session_token": dcv_parameters.group(3),
    }
    return ret


def get_custom_image_config():
    parser = reqparse.RequestParser()
    parser.add_argument("image_id", type=str)
    args = parser.parse_args()
    image_info = sigv4_request("GET", API_BASE_URL, f"/v3/images/custom/{args['image_id']}").json()
    configuration = requests.get(image_info["imageConfiguration"]["url"])
    return configuration.text


def get_aws_config():
    parser = reqparse.RequestParser()
    parser.add_argument("region", type=str)
    args = parser.parse_args()
    if args.get("region"):
        config = botocore.config.Config(region_name=args.get("region"))
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

    fsx_filesystems = []
    try:
        fsx_filesystems = fsx.describe_file_systems()["FileSystems"]
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
        "keypairs": keypairs,
        "vpcs": vpcs,
        "subnets": subnets,
        "region": region,
        "fsx_filesystems": fsx_filesystems,
        "efs_filesystems": efs_filesystems,
    }


def get_identity():
    if running_local():
        return {"cognito:groups": ["user", "admin"], "username": "username", "attributes": {"email": "user@domain.com"}}

    access_token = request.cookies.get("accessToken")
    if not access_token:
        abort(401)
    try:
        decoded = jwt_decode(access_token, USER_POOL_ID)
        username = decoded.get("username")
        if username:
            cognito = boto3.client("cognito-idp")
            filter_ = f'username = "{username}"'
            user = cognito.list_users(UserPoolId=USER_POOL_ID, Filter=filter_)["Users"][0]
            decoded["attributes"] = {ua["Name"]: ua["Value"] for ua in user["Attributes"]}
    except jwt.ExpiredSignatureError:
        abort(401)

    if disable_auth():
        decoded["cognito:groups"] = ["user", "admin"]

    return decoded


def _augment_user(cognito, user):
    try:
        groups_list = cognito.admin_list_groups_for_user(UserPoolId=USER_POOL_ID, Username=user["Username"])
        user["Groups"] = groups_list["Groups"]
    except Exception as e:
        user["exception"] = str(e)
    user["Attributes"] = {ua["Name"]: ua["Value"] for ua in user["Attributes"]}
    return user


def list_users():
    try:
        cognito = boto3.client("cognito-idp")
        users = cognito.list_users(UserPoolId=USER_POOL_ID)["Users"]
        return {"users": [_augment_user(cognito, user) for user in users]}
    except Exception as e:
        return {"exceptoion": str(e)}


def set_user_role():
    cognito = boto3.client("cognito-idp")
    username = request.json["username"]
    role = request.json["role"]
    print(f"setting {username} => {role}")

    if role == "guest":
        cognito.admin_remove_user_from_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="user")
        cognito.admin_remove_user_from_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="admin")
    elif role == "user":
        cognito.admin_add_user_to_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="user")
        cognito.admin_remove_user_from_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="admin")
    elif role == "admin":
        cognito.admin_add_user_to_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="user")
        cognito.admin_add_user_to_group(UserPoolId=USER_POOL_ID, Username=username, GroupName="admin")

    users = cognito.list_users(UserPoolId=USER_POOL_ID, Filter=f'username = "{username}"')["Users"]
    user = _augment_user(cognito, users[0]) if len(users) else {}
    return user


def login():
    redirect_uri = f"{SITE_URL}/login"
    auth_redirect_path = f"{AUTH_PATH}/login?response_type=code&client_id={CLIENT_ID}&redirect_uri={redirect_uri}"
    parser = reqparse.RequestParser()
    parser.add_argument("code", type=str)
    args = parser.parse_args()
    code = args.get("code")
    if not code:
        return redirect(auth_redirect_path, code=302)

    # Convert the authorization code into a jwt
    auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
    grant_type = "authorization_code"

    url = f"{AUTH_PATH}/oauth2/token"
    code_resp = requests.post(
        url,
        data={"grant_type": grant_type, "code": code, "client_id": CLIENT_ID, "redirect_uri": redirect_uri},
        auth=auth,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    # give the jwt to the client for future requests
    resp = redirect("/index.html", code=302)
    resp.set_cookie("accessToken", code_resp.json()["access_token"])
    return resp


def logout():
    resp = redirect("/login", code=302)
    resp.set_cookie("accessToken", "", expires=0)
    return resp


def _get_params(_request):
    params = {**_request.args}
    params.pop("path")
    return params


# Proxy


class PclusterApiHandler(Resource):
    method_decorators = [authenticated("user", redirect=False)]

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("path", type=str)
        parser.add_argument("params", type=dict)
        args = parser.parse_args()
        # if re.match(r".*images.*logstreams/+", args["path"]):
        #    left, right = args["path"].split("logstreams")
        #    args["path"] = "{}logstreams/{}".format(left, right[1:].replace("/", "%2F"))
        response = sigv4_request("GET", API_BASE_URL, args["path"], _get_params(request))
        return response.json(), response.status_code

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument("path", type=str)
        args = parser.parse_args()
        resp = sigv4_request("POST", API_BASE_URL, args["path"], _get_params(request), body=request.json)
        return resp.json(), resp.status_code

    def put(self):
        parser = reqparse.RequestParser()
        parser.add_argument("path", type=str)
        args = parser.parse_args()
        resp = sigv4_request("PUT", API_BASE_URL, args["path"], _get_params(request), body=request.json)
        return resp.json(), resp.status_code

    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument("path", type=str)
        args = parser.parse_args()
        resp = sigv4_request("DELETE", API_BASE_URL, args["path"], _get_params(request), body=request.json)
        return resp.json(), resp.status_code

    def patch(self):
        parser = reqparse.RequestParser()
        parser.add_argument("path", type=str)
        args = parser.parse_args()
        resp = sigv4_request("PATCH", API_BASE_URL, args["path"], _get_params(request), body=request.json)
        return resp.json(), resp.status_code
