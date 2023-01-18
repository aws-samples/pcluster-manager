from flask import Flask, request

from api.logging.http_info import log_request_body_and_headers, log_response_body_and_headers

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


class RequestResponseLogging:
    def __init__(self, logger, app: Flask = None):
        self.logger = logger
        if app:
            self.init_app(app)

    def init_app(self, app):

        def log_request():
            log_request_body_and_headers(self.logger, request)

        def log_response(response = None):
            log_response_body_and_headers(self.logger, response)
            return response

        app.before_request(log_request)
        app.after_request(log_response)
