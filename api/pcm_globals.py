from contextvars import ContextVar

from flask.scaffold import Scaffold
from werkzeug.local import LocalProxy

from api.logger import DefaultLogger

_logger_ctxvar = ContextVar('pcm_logger')

logger = LocalProxy(_logger_ctxvar)


class PCMGlobals(object):
    def __init__(self, app: Scaffold = None, running_local=False):
        self.running_local = running_local
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Scaffold):
        _logger = self.__create_logger()

        def set_global_logger_before_func():
            _logger_ctxvar.set(_logger)

        app.before_request(set_global_logger_before_func)

    def __create_logger(self):
        return DefaultLogger(self.running_local)
