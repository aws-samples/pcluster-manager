import os
from unittest import mock
from api.PclusterApiHandler import logout


def test_logout_redirect():
    """
    Given an handler for the /logout endpoint
      When user logs out
        Then it should redirect to index.html
    """
    res = logout()

    assert res.status_code == 302
    assert res.location == '/index.html'

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