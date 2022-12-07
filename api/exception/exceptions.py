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
