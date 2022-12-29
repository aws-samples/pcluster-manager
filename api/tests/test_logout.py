import os
from unittest import mock

import pytest
from werkzeug.utils import redirect

from api.PclusterApiHandler import logout

@pytest.fixture
def mock_cognito_redirect(mocker):
    mocked_cognito_redirect_url = 'some-url/logout?client_id=client_id&redirect_uri=redirect_uri&response_type=code&scope=scope_list'
    mocked_redirect = redirect(mocked_cognito_redirect_url, code=302)
    mocker.patch('api.PclusterApiHandler.__cognito_logout_redirect', return_value=mocked_redirect)

    return mocked_cognito_redirect_url

def test_logout_redirect(mock_cognito_redirect):
    """
    Given a handler for the /logout endpoint
      When user logs out
        Then it should redirect to index.html
    """
    res = logout()

    assert res.status_code == 302
    assert res.location == mock_cognito_redirect

def test_logout_clear_cookies(mocker, app):
    """
    Given an handler for the /logout endpoint
      When user logs out
        Then it should clear the authentication cookies
    """
    res = logout()
    
    cookie_list = res.headers.getlist('Set-Cookie')
    assert "accessToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/" in cookie_list
    assert "idToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/" in cookie_list
    assert "refreshToken=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/" in cookie_list
    assert "csrf=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/" in cookie_list