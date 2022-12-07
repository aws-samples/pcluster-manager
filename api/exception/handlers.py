from boto3.exceptions import Boto3Error
from botocore.exceptions import ClientError
from flask import jsonify
from werkzeug.routing import WebsocketMismatch

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


class ExceptionHandler(object):

    def __init__(self, app=None, running_local=False):
        self.running_local = running_local
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.register_error_handler(Boto3Error, boto3_exception_handler)
        app.register_error_handler(ClientError, boto3_exception_handler)

        app.register_error_handler(ValueError, value_error_handler)
        app.register_error_handler(Exception, global_exception_handler)

        # in local dev, handle specific Exception caused by HMR requests from FE
        if self.running_local:
            app.register_error_handler(WebsocketMismatch, websocket_mismatch_nop_handler)
