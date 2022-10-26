import json

from boto3.exceptions import Boto3Error
from flask import Blueprint, request, jsonify, redirect
from datetime import datetime, timedelta
from .cw_client import CloudWatchClient

DEFAULT_LOG_BUCKET_NAME = 'pcm-logs-bucket'
LAMBDA_FUNCTION_NAME = 'PclusterManagerFunction-3263d7f0-4ba3-11ed-9037-0aa48804ae92'

cw_log = Blueprint('cw_log', __name__, url_prefix='/cw-log')

cw = CloudWatchClient('eu-west-2')


@cw_log.errorhandler(Exception)
def client_error_handler(err):
    if not isinstance(err, Boto3Error):
        return jsonify(error=str(err)), 400

    response = err.response
    descr, status = response['Error'], response['ResponseMetadata']['HTTPStatusCode']
    return jsonify(error=descr), status


@cw_log.route('/running')
def __get_running_exports():
    previous_task = request.cookies.get('cw_export_task_id', None)
    if previous_task is None:
        return jsonify(error='No task ID cookie present'), 404
    return jsonify(json.loads(previous_task)), 200


@cw_log.route('/status')
def __get_export_status():
    task_id = request.args.get('task_id', None)
    if not task_id:
        return jsonify(error='No task ID provided'), 400

    status, location = cw.export_task_status(task_id)
    if location:
        resp = redirect(location=location)
        __set_cookie(resp, delete=True)
        return resp

    return jsonify(status=status), 202


@cw_log.route('/s3-export', methods=['POST'])
def __s3_export():
    ts_to = request.args.get('to')
    if not ts_to:
        ts_to = __datetime_ms(datetime.today())

    ts_from = request.args.get('from')
    if not ts_from:
        ts_from = __datetime_ms(datetime.today() - timedelta(20))

    json_values = cw.export_logs_task(
        __lambda_log_group(LAMBDA_FUNCTION_NAME),
        DEFAULT_LOG_BUCKET_NAME,
        ts_to=ts_to,
        ts_from=ts_from
    )

    resp = jsonify(**json_values)
    __set_cookie(resp, json_values)
    return resp


def __lambda_log_group(lambda_function_name):
    return f'/aws/lambda/{lambda_function_name}'


def __datetime_ms(from_date):
    return int((from_date - datetime.utcfromtimestamp(0)).total_seconds()) * 1000

def __set_cookie(response, value={}, delete=False):
    response.set_cookie(
        'cw_export_task_id',
        json.dumps(value),
        expires=(0 if delete else None), secure=True,
        httponly=True, samesite='Lax'
    )
