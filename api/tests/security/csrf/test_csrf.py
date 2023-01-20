import datetime
import time
from unittest.mock import ANY, call

import pytest
from flask import request
from itsdangerous import BadSignature

from api.exception import CSRFError
from api.security.csrf import CSRF, generate_csrf_token
from api.security.csrf.constants import CSRF_COOKIE_NAME
from api.security.csrf.csrf import parse_csrf_token, validate_csrf, csrf_needed

SECRET_KEY, SALT = 'aaaaaa', 'bbbbb'
MOCK_URANDOM_VALUE = b'random-value'


@pytest.fixture(scope='function')
def mock_urandom(mocker):
    return mocker.patch('os.urandom', return_value=MOCK_URANDOM_VALUE)


def test_crsf_extension_get_new_csrf(app):
    """
    When an app is built
        and CSRF ext is applied
            it should expose a new endpoint /csrf
            when a csrf cookie is not set in the incoming request
              it should set a new csrf cookie
              it should return the csrf_token in a json
    """
    CSRF(app)
    now = datetime.datetime.utcnow()
    expected_expiration = (now + datetime.timedelta(seconds=30)).strftime('%a, %d %b %Y %H:%M:%S')
    resp = app.test_client().get('/csrf')
    csrf_cookies = list(cookie_value for cookie_header, cookie_value in resp.headers if
                        'Set-Cookie' in cookie_header and CSRF_COOKIE_NAME in cookie_value)

    assert resp.status_code != 405
    assert 'csrf_token' in resp.json
    assert len(csrf_cookies) > 0
    assert 'Secure; HttpOnly; Path=/; SameSite=Lax' in csrf_cookies[0]
    assert f'Expires={expected_expiration}' in csrf_cookies[0]


def test_csrf_needed_decorator(mocker, capsys, mock_csrf_token_string, app, mock_parse_csrf):
    """
    When decorating a function with `csrf_needed`
      when request is provided with a csrf header
         and when csrf header is set
            when their values match
                it should successfully invoke the decorated function
    """

    def test_func():
        print('Success')

    with app.test_request_context('/manager/get_app_config', headers={'X-CSRF-Token': mock_csrf_token_string}):
        mocker.patch.object(request.cookies, 'get', return_value=mock_csrf_token_string)
        mock_parse_csrf.return_value = 'aaaa'

        decorated_test_func = csrf_needed(test_func)
        decorated_test_func()

    captured = capsys.readouterr()

    assert 'Success' in captured.out


def test_csrf_needed_decorator_failing(mocker, mock_parse_csrf, app):
    """
    When decorating a function with `csrf_needed`
      when request is provided with a csrf header
         and when csrf header is set
            when their values don't match
                it should raise a CSRFError
    """

    def test_func(): pass

    with app.test_request_context('/manager/get_app_config', headers={'X-CSRF-Token': 'aaaa'}):
        mocker.patch.object(request.cookies, 'get', return_value='bbbb')
        mock_parse_csrf.side_effect = ['aaaa', 'bbbb']

        decorated_test_func = csrf_needed(test_func)

        with pytest.raises(CSRFError):
            decorated_test_func()


def test_generate_csrf_token(mock_urandom, mock_csrf_token_value, mock_csrf_token_string):
    expected_csrf_token = mock_csrf_token_string
    actual_csrf_token = generate_csrf_token(SECRET_KEY, SALT)

    assert expected_csrf_token == actual_csrf_token


def test_parse_csrf_token(mock_urandom, mock_csrf_token_value):
    csrf_token = generate_csrf_token(SECRET_KEY, SALT)
    actual_token_value = parse_csrf_token(SECRET_KEY, SALT, csrf_token)

    assert actual_token_value == mock_csrf_token_value

def test_parse_csrf_token_expired(mock_urandom):
    csrf_token = generate_csrf_token(SECRET_KEY,SALT)
    time.sleep(1)

    with pytest.raises(BadSignature):
        parse_csrf_token(SECRET_KEY, SALT, csrf_token, max_age=0)

def test_validate_csrf(mock_parse_csrf):
    """
    When a csrf token is provided
      and a csrf header is provided
        it should succeed if they match
    """
    mock_parse_csrf.return_value = 'aaaa'
    valid = validate_csrf(SECRET_KEY, 'csrf-cookie-value', 'csrf-header-value')

    calls = [
        call(SECRET_KEY, ANY, 'csrf-cookie-value'),
        call(SECRET_KEY, ANY, 'csrf-header-value')
    ]

    assert valid
    mock_parse_csrf.assert_has_calls(calls)


def test_fail_validate_csrf(mock_parse_csrf):
    """
    When a csrf token is provided
      and a csrf header is provided
        it should fail if they don't match
    """
    mock_parse_csrf.side_effect = ['aaaa', 'bbbb']
    valid = validate_csrf(SECRET_KEY, 'csrf-cookie-value', 'csrf-header-value')

    calls = [
        call(SECRET_KEY, ANY, 'csrf-cookie-value'),
        call(SECRET_KEY, ANY, 'csrf-header-value')
    ]

    assert not valid
    mock_parse_csrf.assert_has_calls(calls)
