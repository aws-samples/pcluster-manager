from .logger import DefaultLogger

VALID_LOG_LEVELS = {'debug', 'info', 'warning', 'error', 'critical'}

def parse_log_entry(_logger, entry):
    """
    Parse a log entry expected from PCM frontend and logs
    every single entry with the correct log level
    returns
        log level,
        message,
        extra dict (if present)
    """
    if 'level' not in entry or 'message' not in entry:
        raise ValueError('Request body missing one or more mandatory fields ["message", "level"]')

    level, message, extra = entry.get('level'), entry.get('message'), entry.get('extra')
    if not (extra is None or type(extra) is dict):
        raise ValueError('Extra param must be a valid json object')

    lowercase_level = level.lower()
    if lowercase_level not in VALID_LOG_LEVELS:
        raise ValueError('Level param must be a valid log level')

    return lowercase_level, message, extra

def push_log_entry(_logger, level, message, extra, source):
    """ Logs a single log entry coming from the fronted """
    logging_fun = getattr(_logger, level, None)
    extra = {} if extra is None else extra
    extra['source'] = source
    logging_fun(message, extra=extra)