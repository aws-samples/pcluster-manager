from flask import Flask, Blueprint, current_app, jsonify, request

from api.security.csrf.constants import CSRF_SECRET_KEY, SALT, CSRF_COOKIE_NAME
from api.security.csrf.csrf import generate_csrf_token, set_csrf_cookie

from api.security.fingerprint import IFingerprintGenerator

csrf_blueprint = Blueprint('csrf', __name__)


@csrf_blueprint.get('/csrf')
def get_and_set_csrf_token():
    csrf_token = request.cookies.get(CSRF_COOKIE_NAME)
    if not csrf_token:
        csrf_secret_key = current_app.config.get(CSRF_SECRET_KEY)
        csrf_token = generate_csrf_token(csrf_secret_key, SALT)

    resp = jsonify(csrf_token=csrf_token)
    set_csrf_cookie(resp, csrf_token)
    return resp


class CSRF(object):

    def __init__(self, app: Flask = None, fingerprint_generator=None):
        if app is not None and fingerprint_generator is not None:
            self.init_app(app, fingerprint_generator)

    def init_app(self, app, fingerprint_generator: IFingerprintGenerator):
        csrf_secret_key = fingerprint_generator.fingerprint()

        app.config['CSRF_SECRET_KEY'] = csrf_secret_key
        app.register_blueprint(csrf_blueprint)
