
from flask import jsonify

from api.pcm_globals import logger


def boto3_exception_handler(err):
    response = err.response
    descr, status = response['Error'], response['ResponseMetadata']['HTTPStatusCode']
    logger.error(descr, extra=dict(status=status, exception=type(err)))

    return jsonify(error=descr), status

def websocket_mismatch_nop_handler(err):
    """ Handles websocket error caused by HMR in local development"""
    return {}, 200

def value_error_handler(err):
    descr, code = str(err), 400
    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return __handler_response(code, descr)

def csrf_error_handler(err):
    descr, code = str(err), 403
    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return __handler_response(code, descr)

def global_exception_handler(err):
    try:
        code = err.code
    except:
        code = 500
    descr = str(err)

    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return __handler_response(code)


def __handler_response(code, description='Something went wrong'):
    response = {'Code': code, 'Message': description}
    return jsonify(error=response), code
