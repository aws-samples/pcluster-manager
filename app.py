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
import datetime

from flask import Flask, Response, request, send_from_directory
from flask.json import JSONEncoder
from flask_cors import CORS  # comment this on deployment
from flask_restful import Api
from werkzeug.routing import BaseConverter

import api.utils as utils
from api.PclusterApiHandler import (
    PclusterApiHandler,
    authenticated,
    cancel_job,
    create_user,
    delete_user,
    ec2_action,
    get_app_config,
    get_aws_config,
    get_cluster_config,
    get_custom_image_config,
    get_dcv_session,
    get_identity,
    get_version,
    get_instance_types,
    list_users,
    login,
    logout,
    price_estimate,
    queue_status,
    sacct,
    scontrol_job,
    set_user_role,
    submit_job,
)

ADMINS_USERS_GROUP = { "user", "admin" }
ADMINS_GROUP = { "admin" }

class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


class PClusterJSONEncoder(JSONEncoder):
    """Make the model objects JSON serializable."""

    include_nulls = False

    def default(self, obj):
        if isinstance(obj, datetime.date):
            return utils.to_iso_timestr(obj)
        return JSONEncoder.default(self, obj)


def run():
    app = utils.build_flask_app(__name__)
    app.json_encoder = PClusterJSONEncoder
    app.url_map.converters["regex"] = RegexConverter
    CORS(app)  # comment this on deployment
    api = Api(app)

    @app.errorhandler(401)
    def custom_401(_error):
        return Response(
            "You are not authorized to perform this action.", 401
        )

    @app.route("/", defaults={"path": ""})
    @app.route('/<path:path>')
    def serve(path):
        return utils.serve_frontend(app, path)

    @app.route("/manager/ec2_action", methods=["POST"])
    @authenticated(ADMINS_USERS_GROUP)
    def ec2_action_():
        return ec2_action()

    @app.route("/manager/get_cluster_configuration")
    @authenticated(ADMINS_USERS_GROUP)
    def get_cluster_config_():
        return get_cluster_config()

    @app.route("/manager/get_custom_image_configuration")
    @authenticated(ADMINS_USERS_GROUP)
    def get_custom_image_config_():
        return get_custom_image_config()

    @app.route("/manager/get_aws_configuration")
    @authenticated(ADMINS_USERS_GROUP)
    def get_aws_config_():
        return get_aws_config()

    @app.route("/manager/get_instance_types")
    @authenticated(ADMINS_USERS_GROUP)
    def get_instance_types_():
        return get_instance_types()

    @app.route("/manager/get_dcv_session")
    @authenticated(ADMINS_USERS_GROUP)
    def get_dcv_session_():
        return get_dcv_session()

    @app.route("/manager/get_identity")
    @authenticated({"guest"})
    def get_identity_():
        return get_identity()

    @app.route("/manager/get_version")
    def get_version_():
        return get_version()

    @app.route("/manager/get_app_config")
    def get_app_config_():
        return get_app_config()

    @app.route("/manager/list_users")
    @authenticated(ADMINS_GROUP)
    def list_users_():
        return list_users()

    @app.route("/manager/create_user", methods=["POST"])
    @authenticated(ADMINS_GROUP)
    def create_user_():
        return create_user()

    @app.route("/manager/delete_user", methods=["DELETE"])
    @authenticated(ADMINS_GROUP)
    def delete_user_():
        return delete_user()

    @app.route("/manager/set_user_role", methods=["PUT"])
    @authenticated(ADMINS_GROUP)
    def set_user_role_():
        return set_user_role()

    @app.route("/manager/queue_status")
    @authenticated(ADMINS_USERS_GROUP)
    def queue_status_():
        return queue_status()

    @app.route("/manager/cancel_job")
    @authenticated(ADMINS_USERS_GROUP)
    def cancel_job_():
        return cancel_job()

    @app.route("/manager/price_estimate")
    @authenticated(ADMINS_USERS_GROUP)
    def price_estimate_():
        return price_estimate()

    @app.route("/manager/submit_job", methods=["POST"])
    @authenticated(ADMINS_USERS_GROUP)
    def submit_job_():
        return submit_job()

    @app.route("/manager/sacct", methods=["POST"])
    @authenticated(ADMINS_USERS_GROUP)
    def sacct_():
        return sacct()

    @app.route("/manager/scontrol_job")
    @authenticated(ADMINS_USERS_GROUP)
    def scontrol_job_():
        return scontrol_job()

    @app.route("/login")
    def login_():
        return login()

    @app.route("/logout")
    def logout_():
        return logout()

    @app.route('/<regex("(home|clusters|users|configure|custom-images|official-images).*"):base>', defaults={"base": ""})
    def catch_all(base):
        return utils.serve_frontend(app, base)

    @app.route('/<regex("(home|clusters|users|configure|custom-images|official-images).*"):base>/<path:u_path>', defaults={"base": "", "u_path": ""})
    def catch_all2(base, u_path):
        return utils.serve_frontend(app, base)

    api.add_resource(PclusterApiHandler, "/api")
    return app


if __name__ == "__main__":
    run()
