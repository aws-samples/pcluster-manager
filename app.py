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

import api.utils as utils
from api.PclusterApiHandler import (
    PclusterApiHandler,
    authenticate,
    authenticated,
    cancel_job,
    ec2_action,
    get_aws_config,
    get_cluster_config,
    get_custom_image_config,
    get_dcv_session,
    get_identity,
    get_version,
    list_users,
    create_user,
    delete_user,
    login,
    logout,
    queue_status,
    set_user_role,
    submit_job,
)


class PClusterJSONEncoder(JSONEncoder):
    """Make the model objects JSON serializable."""

    include_nulls = False

    def default(self, obj):
        if isinstance(obj, datetime.date):
            return utils.to_iso_timestr(obj)
        return JSONEncoder.default(self, obj)


def run():
    app = Flask(__name__, static_url_path="", static_folder="frontend/public")
    app.json_encoder = PClusterJSONEncoder
    CORS(app)  # comment this on deployment
    api = Api(app)

    @app.before_request
    def authenticate_static():
        # Ensure we redirect to login on loading of index.html
        return authenticate("guest") if "index.html" in request.path else None

    @app.errorhandler(401)
    def custom_401(_error):
        return Response(
            "You are not authorized to perform this action.", 401, {"WWW-Authenticate": 'Basic realm="Login Required"'}
        )

    @app.route("/", defaults={"path": ""})
    @authenticated()
    def serve(path):
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/manager/ec2_action", methods=["POST"])
    @authenticated()
    def ec2_action_():
        return ec2_action()

    @app.route("/manager/get_cluster_configuration")
    @authenticated()
    def get_cluster_config_():
        return get_cluster_config()

    @app.route("/manager/get_custom_image_configuration")
    @authenticated()
    def get_custom_image_config_():
        return get_custom_image_config()

    @app.route("/manager/get_aws_configuration")
    @authenticated()
    def get_aws_config_():
        return get_aws_config()

    @app.route("/manager/get_dcv_session")
    @authenticated()
    def get_dcv_session_():
        return get_dcv_session()

    @app.route("/manager/get_identity")
    @authenticated("guest")
    def get_identity_():
        return get_identity()

    @app.route("/manager/get_version")
    def get_version_():
        return get_version()

    @app.route("/manager/list_users")
    @authenticated("admin")
    def list_users_():
        return list_users()

    @app.route("/manager/create_user",  methods=["PUT"])
    @authenticated("admin")
    def create_user_():
        return create_user()

    @app.route("/manager/delete_user",  methods=["POST"])
    @authenticated("admin")
    def delete_user_():
        return delete_user()

    @app.route("/manager/set_user_role", methods=["PUT"])
    @authenticated("admin")
    def set_user_role_():
        return set_user_role()

    @app.route("/manager/queue_status")
    @authenticated()
    def queue_status_():
        return queue_status()

    @app.route("/manager/cancel_job")
    @authenticated()
    def cancel_job_():
        return cancel_job()

    @app.route("/manager/submit_job", methods=["POST"])
    def submit_job_():
        return submit_job()

    @app.route("/login")
    def login_():
        return login()

    @app.route("/logout")
    def logout_():
        return logout()

    api.add_resource(PclusterApiHandler, "/api")
    return app


if __name__ == "__main__":
    run()
