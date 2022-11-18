from contextvars import ContextVar

from werkzeug.local import LocalProxy

_logger_ctxvar = ContextVar('pcm_logger')

logger = LocalProxy(_logger_ctxvar)

def set_global_logger(_logger):
    _logger_ctxvar.set(_logger)
