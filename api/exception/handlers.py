import logging

from flask import jsonify

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


def boto3_exception_handler(err):
    response = err.response
    descr, status = response['Error'], response['ResponseMetadata']['HTTPStatusCode']
    logger.error(descr, extra=dict(status=status, exception=type(err)))

    return jsonify(error=descr), status

def websocket_mismatch_nop_handler(err):
    """ Handles websocket error caused by HMR in local development"""
    return {}, 200

def global_exception_handler(err):
    try:
        code = err.code
    except:
        code = 500
    descr = str(err)

    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return jsonify(error='Something went wrong'), code
