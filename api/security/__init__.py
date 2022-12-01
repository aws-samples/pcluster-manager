from flask.scaffold import Scaffold

from api.security.headers import add_security_headers, add_security_headers_dev


class SecurityHeaders(object):

    def __init__(self, app: Scaffold = None, running_local=False):
        self.running_local = running_local
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Scaffold):
        if self.running_local:
            app.after_request(add_security_headers_dev)
        else:
            app.after_request(add_security_headers)
