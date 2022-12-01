from flask import request, make_response, current_app, abort
from itsdangerous import URLSafeSerializer
from werkzeug.exceptions import BadRequest
import os
import hashlib


def generate_csrf_token():
    serializer = URLSafeSerializer(
        current_app.config.get("CSRF_SECRET_KEY"),
        salt="pcm-csrf-token"
      )
    csrf_token_ = hashlib.sha256(os.urandom(64)).hexdigest()
    csrf_token = serializer.dumps(csrf_token_)
    resp = make_response(csrf_token)
    resp.set_cookie("csrf", value=csrf_token)
    return resp


def load_csrf_token(csrf_token_):  
    serializer = URLSafeSerializer(
        current_app.config.get("CSRF_SECRET_KEY"),
        salt="pcm-csrf-token"
      )
    # TODO handle SignatureExpired and BadData exceptions
    csrf_token = serializer.loads(csrf_token_)
    return csrf_token


class CSRF(object):
    def __init__(self, app=None):
        self._exempt_views = set()

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        app.extensions["csrf"] = self

        app.config.setdefault("CSRF_ENABLED", True)
        app.config.setdefault("CSRF_SECRET_KEY", hashlib.sha256(os.urandom(64)).hexdigest())
        app.config["CSRF_METHODS"] = set(
            app.config.get("CSRF_METHODS", ["POST", "PUT", "PATCH", "DELETE"])
        )

        @app.before_request
        def csrf_protect():
            if not app.config["CSRF_ENABLED"]:
                return
            if request.method not in app.config["CSRF_METHODS"]:
                return
            
            view = app.view_functions.get(request.endpoint)
            dest = f"{view.__module__}.{view.__name__}"

            if dest in self._exempt_views:
                return
            
            self.protect()
    
    def protect(self):
      csrf_cookie_ = request.cookies.get("csrf")
      csrf_header_ = request.headers.get("X-CSRF-Token")

      print("CSRF_COOKIE:", csrf_cookie_)
      print("CSRF_HEADER:", csrf_header_)

      if not csrf_cookie_ or not csrf_header_:
          raise CSRFError("Missing CSRF token")

      try:
          csrf_cookie = load_csrf_token(csrf_cookie_)
      except Exception:
          raise CSRFError("CSRF token cookie is invalid")
      try:
          csrf_header = load_csrf_token(csrf_header_)
      except Exception:
          raise CSRFError("CSRF token header is invalid")

      if csrf_cookie != csrf_header:
          raise CSRFError("CSRF token cookie and header do not match")
      
    def exempt(self, view):
      if isinstance(view, str):
          view_location = view
      else:
          view_location = ".".join((view.__module__, view.__name__))

      self._exempt_views.add(view_location)
      return view

    
class CSRFError(BadRequest):
    """Raise if the client sends invalid CSRF data with the request.

    Generates a 400 Bad Request response with the failure reason by default.
    Customize the response by registering a handler with
    :meth:`flask.Flask.errorhandler`.
    """

    description = "CSRF validation failed."