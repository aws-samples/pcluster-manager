import pytest
from marshmallow import Schema, fields, validate, ValidationError

from api.validation import __valid_request, valid
from api.validation.validators import aws_region_validator


class MockRequest:
    cookies = {'int_value': 100}
    args = {'region': 'eu-west-1'}
    json = {'username': 'user@email.com'}


class MockRequestCookiesSchema(Schema):
    int_value = fields.Integer(required=True, validate=validate.Range(min=99, max=101))


class MockRequestArgsSchema(Schema):
    region = fields.String(required=True, validate=aws_region_validator)


class MockRequestJsonSchema(Schema):
    username = fields.Email(required=True)


def test_valid_request_successful(mock_csrf_needed, mock_enable_auth):
    request = MockRequest()
    errors = __valid_request(request, json_schema=MockRequestJsonSchema(), args_schema=MockRequestArgsSchema(),
                             cookies_schema=MockRequestCookiesSchema())

    assert errors == {}


def test_valid_request_failure(mock_csrf_needed, mock_enable_auth):
    request = MockRequest()
    request.cookies['int_value'] = 50
    errors = __valid_request(request, json_schema=MockRequestJsonSchema(), args_schema=MockRequestArgsSchema(),
                             cookies_schema=MockRequestCookiesSchema())

    assert errors == {'int_value': ['Must be greater than or equal to 99 and less than or equal to 101.']}


def test_valid_decorator_success(app, mock_csrf_needed, mock_enable_auth):
    def func(): pass
    func = valid(json=MockRequestJsonSchema())(func)

    with app.test_request_context('/manager/ec2_action', json={'username': 'this-is-an@email.com'}):
        func()


def test_valid_decorator_failure(app, mock_csrf_needed, mock_enable_auth):
    def func(): pass
    func = valid(json=MockRequestJsonSchema())(func)

    with app.test_request_context('/manager/ec2_action', json={'username': 'not-an-email'}):
        with pytest.raises(ValidationError):
            func()
