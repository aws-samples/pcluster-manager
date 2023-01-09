from werkzeug.exceptions import Forbidden


class CSRFError(Forbidden):
    """Raise if the client sends invalid CSRF data with the request.
    Generates a 403 Forbidden response with the failure reason by default.
    Customize the response by registering a handler with
    :meth:`flask.Flask.errorhandler`.
    """

    description = "CSRF validation failed."

    def __init__(self, description):
        self.description = description

class RefreshTokenError(Exception):
    ERROR_FMT = 'Refresh token error: {description}'
    description = 'Refresh token flow failed'

    def __init__(self, description=None):
        if description:
            self.description = self.ERROR_FMT.format(description=description)

    def __str__(self):
        return self.description