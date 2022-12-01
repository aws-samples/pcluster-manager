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
import os

import dateutil
from flask import Flask, Response, request, send_from_directory
from flask_cors import CORS
import requests

from api.exception import ExceptionHandler
from api.security import SecurityHeaders


def to_utc_datetime(time_in, default_timezone=datetime.timezone.utc) -> datetime.datetime:
    """
    Convert a given string, datetime or int into utc datetime.

    :param time_in: Time in a format that may be parsed, integers are assumed to
    be timestamps in UTC timezone.
    :param default_timezone: Timezone to assum in the event that the time is
    unspecified in the input parameter. This applies only for datetime and str inputs
    :return time as a datetime in UTC timezone
    """
    if isinstance(time_in, int):
        if time_in > 1e12:
            time_in /= 1000
        time_ = datetime.datetime.utcfromtimestamp(time_in)
        time_ = time_.replace(tzinfo=datetime.timezone.utc)
    elif isinstance(time_in, str):
        time_ = dateutil.parser.parse(time_in)
    elif isinstance(time_in, datetime.date):
        time_ = time_in
    else:
        raise TypeError("to_utc_datetime object must be 'str', 'int' or 'datetime'.")
    if time_.tzinfo is None:
        time_ = time_.replace(tzinfo=default_timezone)
    return time_.astimezone(datetime.timezone.utc)


def to_iso_timestr(time_in: datetime.datetime) -> str:
    """
    Convert a given datetime ISO 8601 format with milliseconds.

    :param time_in: datetime to be converted
    :return time in ISO 8601 UTC format with ms (e.g. 2021-07-15T01:22:02.655Z)
    """
    if time_in.tzinfo is None:
        time_ = time_in.replace(tzinfo=datetime.timezone.utc)
    else:
        time_ = time_in.astimezone(datetime.timezone.utc)
    return to_utc_datetime(time_).isoformat(timespec="milliseconds")[:-6] + "Z"


def running_local():
    return os.getenv("ENV") == "dev"


def disable_auth():
    return os.getenv("ENABLE_AUTH") == "false"


def proxy_to(to_url):
    """
    Proxies Flask requests to the provided to_url
    """
    resp = requests.request(
        method=request.method,
        url=to_url,
        headers={key: value for (key, value) in request.headers if key != 'Host'},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False)
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    headers = [(name, value) for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]
    response = Response(resp.content, resp.status_code, headers)
    return response


def build_flask_app(name):
    if running_local():
        app = Flask(name)
        CORS(app)
    else:
        app = Flask(name, static_url_path="", static_folder="frontend/public")

    ExceptionHandler(app, running_local=running_local())
    SecurityHeaders(app, running_local=running_local())

    return app


def serve_frontend(app, path):
    if running_local():
        return proxy_to("http://localhost:3000/" + path)

    return send_from_directory(app.static_folder, "index.html")
