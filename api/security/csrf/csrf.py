import functools
import hashlib
import os

from flask import request, current_app
from itsdangerous import URLSafeSerializer, BadSignature

from api.exception import CSRFError
from api.security.csrf import CSRF_SECRET_KEY
from api.security.csrf.constants import CSRF_COOKIE_NAME, SALT, CSRF_TOKEN_HEADER


def generate_csrf_token(secret_key, salt):
    serializer = URLSafeSerializer(secret_key, salt)
    csrf_token_value = hashlib.sha256(os.urandom(64)).hexdigest()
    csrf_token = serializer.dumps(csrf_token_value)
    return csrf_token


def parse_csrf_token(secret_key, salt, token):
    serializer = URLSafeSerializer(secret_key, salt)
    return serializer.loads(token)


def validate_csrf(secret_key, csrf_cookie, csrf_header):
    try:
        csrf_cookie = parse_csrf_token(secret_key, SALT, csrf_cookie)
        csrf_header = parse_csrf_token(secret_key, SALT, csrf_header)
    except BadSignature:
        return False

    return csrf_cookie == csrf_header


def set_csrf_cookie(resp, csrf_token):
    resp.set_cookie(CSRF_COOKIE_NAME, value=csrf_token)


def csrf_needed(func):
    @functools.wraps(func)
    def csrf_cookie_protect(*args, **kwargs):
        csrf_cookie = request.cookies.get(CSRF_COOKIE_NAME)
        csrf_header = request.headers.get(CSRF_TOKEN_HEADER)
        secret_key = current_app.config[CSRF_SECRET_KEY]

        if not csrf_cookie:
            raise ValueError('Missing CSRF cookie')

        if not csrf_header:
            raise ValueError('Missing CSRF header in request')

        if validate_csrf(secret_key, csrf_cookie, csrf_header):
            return func(*args, **kwargs)
        else:
            raise CSRFError("provided CSRF are not valid or values do not match")

    return csrf_cookie_protect
