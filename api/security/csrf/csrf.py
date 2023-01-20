import functools
import hashlib
import os

from flask import request, current_app
from itsdangerous import BadSignature, URLSafeTimedSerializer

from api.exception import CSRFError
from api.security.csrf import CSRF_SECRET_KEY
from api.security.csrf.constants import CSRF_COOKIE_NAME, SALT, CSRF_TOKEN_HEADER

CSRF_DEFAULT_MAX_AGE = 30

digest_method = hashlib.sha256
signer_kwargs = {'signer_kwargs': {'digest_method': digest_method}}

def generate_csrf_token(secret_key, salt):
    serializer = URLSafeTimedSerializer(secret_key, salt, **signer_kwargs)
    csrf_token_value = hashlib.sha256(os.urandom(64)).hexdigest()
    csrf_token = serializer.dumps(csrf_token_value)
    return csrf_token


def parse_csrf_token(secret_key, salt, token, max_age=CSRF_DEFAULT_MAX_AGE):
    serializer = URLSafeTimedSerializer(secret_key, salt, **signer_kwargs)
    return serializer.loads(token, max_age=max_age)


def validate_csrf(secret_key, csrf_cookie, csrf_header):
    try:
        csrf_cookie = parse_csrf_token(secret_key, SALT, csrf_cookie)
        csrf_header = parse_csrf_token(secret_key, SALT, csrf_header)
    except BadSignature:
        return False

    return csrf_cookie == csrf_header

# needed to only allow tests to disable csrf
def is_csrf_enabled():
    return True


def set_csrf_cookie(resp, csrf_token, max_age=CSRF_DEFAULT_MAX_AGE):
    resp.set_cookie(CSRF_COOKIE_NAME, max_age=max_age, value=csrf_token, httponly=True, secure=True, samesite="Lax")

def remove_csrf_cookie(resp):
    resp.delete_cookie(CSRF_COOKIE_NAME)

def csrf_needed(func):
    @functools.wraps(func)
    def csrf_cookie_protect(*args, **kwargs):
        if not is_csrf_enabled():
            return func(*args, **kwargs)

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
