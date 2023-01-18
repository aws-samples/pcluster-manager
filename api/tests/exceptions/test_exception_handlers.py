from marshmallow import ValidationError

from api.exception.exceptions import RefreshTokenError, CSRFError
from api.exception.handlers import csrf_error_handler, boto3_exception_handler, value_error_handler, unauthenticated_error_handler, validation_error_handler, global_exception_handler
from api.security.csrf import CSRF_COOKIE_NAME


def test_boto3_exception_handler(client, client_error_response, app, monkeypatch):
    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = boto3_exception_handler(client_error_response)

    assert status_code == 400
    assert response.json == {'code': 400, 'message': 'Something went wrong while invoking other AWS services'}

def test_value_error_exception_handler(client, app, monkeypatch):
    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = value_error_handler(ValueError('Validation error'))

    assert status_code == 400
    assert response.json == {'code': 400, 'message': 'Validation error'}

def test_csrf_error_exception_handler(client, app, monkeypatch):

    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = csrf_error_handler(CSRFError('CSRF Error'))

    csrf_cookies = list(cookie_value for cookie_header, cookie_value in response.headers if
                        'Set-Cookie' in cookie_header and CSRF_COOKIE_NAME in cookie_value)

    assert status_code == 403
    assert response.json == {'code': 403, 'message': '403 Forbidden: CSRF Error'}
    assert len(csrf_cookies) > 0
    assert 'Expires=Thu, 01 Jan 1970 00:00:00 GMT' in csrf_cookies[0]


def test_unauthenticated_error_handler(client, app, monkeypatch):
    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = unauthenticated_error_handler(RefreshTokenError('refresh-token-error'))

    assert status_code == 401
    assert response.json == {'code': 401, 'message': 'Refresh token error: refresh-token-error'}

def test_validation_error_handler(client, app, monkeypatch):
    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = validation_error_handler(ValidationError('Input validation failed for /manager/ec2_action', data={'field': ['validation-error']}))

    assert status_code == 400
    assert response.json == {
        'code': 400, 'message': 'Input validation failed for /manager/ec2_action',
        'validation_errors': {'field': ['validation-error']}
    }

def test_global_exception_handler_with_app_logic(client, app, monkeypatch):
    with app.test_request_context('/'):
        app.preprocess_request()
        response, status_code = global_exception_handler(Exception('generic exception'))

    assert status_code == 400
    assert response.json == {'code': 400, 'message': 'An error occurred while trying to complete your request. Please try again later. If the problem persists, please contact support for further assistance.'}
