from boto3.exceptions import Boto3Error
from botocore.exceptions import ClientError
from flask import jsonify
from marshmallow import ValidationError
from werkzeug.routing import WebsocketMismatch

from api.exception import CSRFError
from api.exception.exceptions import RefreshTokenError
from api.pcm_globals import logger
from api.security.csrf.csrf import remove_csrf_cookie


def boto3_exception_handler(err):
    response = err.response
    error, status = response['Error'], response['ResponseMetadata']['HTTPStatusCode']
    description = error['Message']

    logger.error(description, extra=dict(status=status, exception=type(err)))
    return __handler_response(status, 'Something went wrong while invoking other AWS services')

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
    response, status_code = __handler_response(code, descr)
    remove_csrf_cookie(response)
    return response, status_code

def unauthenticated_error_handler(err):
    descr, code = str(err), 401
    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return __handler_response(code, descr)


def validation_error_handler(err: ValidationError):
    descr, code = str(err), 400
    logger.error(descr, extra=dict(status=code, exception=type(err), validation_errors=err.data))
    return __handler_response(code, descr, validation_errors=err.data)

def global_exception_handler(err):
    try:
        code = err.code
    except:
        code = 400
    descr = str(err)

    logger.error(descr, extra=dict(status=code, exception=type(err)))
    return __handler_response(code, 'An error occurred while trying to complete your request. Please try again later. If the problem persists, please contact support for further assistance.')


def __handler_response(code, description='Something went wrong', **kwargs):
    response = {'code': code, 'message': description, **kwargs}
    return jsonify(response), code


class ExceptionHandler(object):

    def __init__(self, app=None, running_local=False):
        self.running_local = running_local
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.register_error_handler(Boto3Error, boto3_exception_handler)
        app.register_error_handler(ClientError, boto3_exception_handler)

        app.register_error_handler(CSRFError, csrf_error_handler)
        app.register_error_handler(ValidationError, validation_error_handler)
        app.register_error_handler(ValueError, value_error_handler)
        app.register_error_handler(RefreshTokenError, unauthenticated_error_handler)
        app.register_error_handler(Exception, global_exception_handler)

        # in local dev, handle specific Exception caused by HMR requests from FE
        if self.running_local:
            app.register_error_handler(WebsocketMismatch, websocket_mismatch_nop_handler)
