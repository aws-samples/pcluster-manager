from functools import wraps

from flask import request, Request
from marshmallow import Schema, ValidationError

from api.validation.schemas import EC2Action


def __valid_request(_request: Request, *, json_schema: Schema = None, args_schema: Schema = None, cookies_schema: Schema = None):
    errors = {}
    if json_schema:
        try:
            errors.update(json_schema.validate(_request.json))
        except:
            raise ValueError('Expected json body')

    if args_schema:
        errors.update(args_schema.validate(_request.args))

    if cookies_schema:
        errors.update(cookies_schema.validate(_request.cookies))

    return errors


def valid(*, json: Schema = None, args: Schema = None, cookies: Schema = None):
    def wrapper(func):
        @wraps(func)
        def decorated(*pargs, **kwargs):
            errors = __valid_request(request, json_schema=json, args_schema=args, cookies_schema=cookies)
            if errors:
                raise ValidationError(f'Input validation failed for {request.path}', data=errors)
            return func(*pargs, **kwargs)

        return decorated

    return wrapper
