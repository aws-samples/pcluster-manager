from unittest.mock import Mock, PropertyMock

import pytest
from marshmallow import Schema, fields, validate, ValidationError

from api.validation import __validate_request, validated
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


def test_valid_request_successful(mock_csrf_needed, mock_disable_auth):
    request = MockRequest()
    errors = __validate_request(request, body_schema=MockRequestJsonSchema(), params_schema=MockRequestArgsSchema(),
                                cookies_schema=MockRequestCookiesSchema())

    assert errors == {}

def test_invalid_request_successful_with_raise_on_missing_body_enabled(mock_csrf_needed, mock_disable_auth):
    request = MockRequest()
    mock_json_property = PropertyMock(side_effect=Exception)
    original_json_property = MockRequest.json
    MockRequest.json = mock_json_property

    with pytest.raises(ValueError):
        __validate_request(request, body_schema=MockRequestJsonSchema(), params_schema=MockRequestArgsSchema(),
                                    cookies_schema=MockRequestCookiesSchema())

    mock_json_property.assert_called_once()
    MockRequest.json = original_json_property

def test_invalid_request_successful_with_raise_on_missing_body_disabled(mock_csrf_needed, mock_disable_auth):
    request = MockRequest()
    mock_json_property = PropertyMock(side_effect=Exception)
    original_json_property = MockRequest.json
    MockRequest.json = mock_json_property

    errors = __validate_request(request, body_schema=MockRequestJsonSchema(), params_schema=MockRequestArgsSchema(),
                                cookies_schema=MockRequestCookiesSchema(), raise_on_missing_body=False)

    mock_json_property.assert_called_once()
    assert errors == {}

    MockRequest.json = original_json_property


def test_valid_request_failure(mock_csrf_needed, mock_disable_auth):
    request = MockRequest()
    request.cookies['int_value'] = 50
    errors = __validate_request(request, body_schema=MockRequestJsonSchema(), params_schema=MockRequestArgsSchema(),
                                cookies_schema=MockRequestCookiesSchema())

    assert errors == {'int_value': ['Must be greater than or equal to 99 and less than or equal to 101.']}


def test_valid_decorator_success(app, mock_csrf_needed, mock_disable_auth):
    def func(): pass
    func = validated(body=MockRequestJsonSchema())(func)

    with app.test_request_context('/manager/ec2_action', json={'username': 'this-is-an@email.com'}):
        func()


def test_valid_decorator_failure(app, mock_csrf_needed, mock_disable_auth):
    def func(): pass
    func = validated(body=MockRequestJsonSchema())(func)

    with app.test_request_context('/manager/ec2_action', json={'username': 'not-an-email'}):
        with pytest.raises(ValidationError):
            func()
