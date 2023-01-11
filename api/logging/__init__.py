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
    level, message, extra = entry.get('level'), entry.get('message'), entry.get('extra')

    lowercase_level = level.lower()
    if lowercase_level not in VALID_LOG_LEVELS:
        raise ValueError('Level param must be a valid log level')

    return lowercase_level, message, extra

def push_log_entry(_logger, level, message, extra):
    """ Logs a single log entry at the specified level """
    logging_fun = getattr(_logger, level, None)
    logging_fun(message, extra=extra)