from boto3.exceptions import Boto3Error
from botocore.exceptions import ClientError
from werkzeug.routing import WebsocketMismatch

from .handlers import global_exception_handler, boto3_exception_handler, websocket_mismatch_nop_handler, \
    value_error_handler


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
