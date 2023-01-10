from functools import wraps

from flask import request, Request
from marshmallow import Schema, ValidationError

from api.validation.schemas import EC2Action


def __validate_request(_request: Request, *, body_schema: Schema = None, params_schema: Schema = None, cookies_schema: Schema = None):
    errors = {}
    if body_schema:
        try:
            errors.update(body_schema.validate(_request.json))
        except:
            raise ValueError('Expected json body')

    if params_schema:
        errors.update(params_schema.validate(_request.args))

    if cookies_schema:
        errors.update(cookies_schema.validate(_request.cookies))

    return errors


def validated(*, body: Schema = None, params: Schema = None, cookies: Schema = None):
    def wrapper(func):
        @wraps(func)
        def decorated(*pargs, **kwargs):
            errors = __validate_request(request, body_schema=body, params_schema=params, cookies_schema=cookies)
            if errors:
                raise ValidationError(f'Input validation failed for {request.path}', data=errors)
            return func(*pargs, **kwargs)

        return decorated

    return wrapper
