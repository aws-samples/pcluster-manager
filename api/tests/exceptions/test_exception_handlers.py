from marshmallow import ValidationError

from api.exception.exceptions import RefreshTokenError, CSRFError
from api.exception.handlers import csrf_error_handler
from api.security.csrf import CSRF_COOKIE_NAME


def test_boto3_exception_handler(client, client_error_response, app, monkeypatch):
    def delete_user_raising_clienterror():
        raise client_error_response

    monkeypatch.setitem(app.view_functions, 'delete_user_', delete_user_raising_clienterror)
    response = client.delete('/manager/delete_user', json={'username': 'some-user'})

    assert response.status_code == 400
    assert response.json == {'code': 400, 'message': 'Something went wrong while invoking other AWS services'}

def test_value_error_exception_handler(client, app, monkeypatch):
    def push_log_raising():
        raise ValueError('Validation error')

    monkeypatch.setitem(app.view_functions, 'push_log', push_log_raising)
    response = client.post('/logs')

    assert response.status_code == 400
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

    def push_log_raising():
        raise RefreshTokenError('refresh-token-error')

    monkeypatch.setitem(app.view_functions, 'push_log', push_log_raising)
    response = client.post('/logs')

    assert response.status_code == 401
    assert response.json == {'code': 401, 'message': 'Refresh token error: refresh-token-error'}

def test_validation_error_handler(client, app, monkeypatch):

    def ec2_action_raising():
        raise ValidationError('Input validation failed for /manager/ec2_action', data={'field': ['validation-error']})

    monkeypatch.setitem(app.view_functions, 'ec2_action_', ec2_action_raising)
    response = client.post('/manager/ec2_action')

    assert response.status_code == 400
    assert response.json == {
        'code': 400, 'message': 'Input validation failed for /manager/ec2_action',
        'validation_errors': {'field': ['validation-error']}
    }

def test_global_exception_handler_with_app_logic(client, app, monkeypatch):
    def get_app_config_raising_generic_exception():
        raise Exception('generic exception')

    monkeypatch.setitem(app.view_functions, 'get_app_config_', get_app_config_raising_generic_exception)
    response = client.get('/manager/get_app_config')

    assert response.status_code == 400
    assert response.json == {'code': 400, 'message': 'An error occurred while trying to complete your request. Please try again later. If the problem persists, please contact support for further assistance.'}
