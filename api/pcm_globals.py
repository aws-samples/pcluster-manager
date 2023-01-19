from contextvars import ContextVar

from flask import g, Response
from flask.scaffold import Scaffold
from werkzeug.local import LocalProxy

from api.logging.logger import DefaultLogger

_logger_ctxvar = ContextVar('pcm_logger')

logger = LocalProxy(_logger_ctxvar)

global_apigw_request_id = None
def set_apigw_request_id_global(_apigw_request_id):
    global global_apigw_request_id
    global_apigw_request_id = _apigw_request_id
def set_apigw_request_id_in_context(_apigw_request_id):
    global global_apigw_request_id
    global_apigw_request_id = None
    g.apigw_request_id = _apigw_request_id

def get_request_ids():
    if 'apigw_request_id' not in g:
        g.apigw_request_id = None
    return g.apigw_request_id

apigw_request_id = LocalProxy(get_request_ids)

def set_auth_cookies_in_context(cookies: dict):
    g.auth_cookies = cookies

def get_auth_cookies():
    if 'auth_cookies' not in g:
        g.auth_cookies = {}

    return g.auth_cookies

auth_cookies = LocalProxy(get_auth_cookies)

def add_auth_cookies(response: Response):
    for name, value in auth_cookies.items():
        response.set_cookie(name, value, httponly=True, secure=True, samesite='Lax')
    return response

class PCMGlobals(object):
    def __init__(self, app: Scaffold = None, running_local=False):
        self.running_local = running_local
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Scaffold):
        _logger = self.__create_logger()

        def set_global_logger_before_func():
            _logger_ctxvar.set(_logger)

        def set_global_apigw_request_id_in_context():
            set_apigw_request_id_in_context(global_apigw_request_id)

        app.before_request(set_global_logger_before_func)
        app.before_request(set_global_apigw_request_id_in_context)

        # required for setting auth cookies in case of a token refresh
        app.after_request(add_auth_cookies)


    def __create_logger(self):
        return DefaultLogger(self.running_local)
