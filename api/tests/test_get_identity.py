from unittest.mock import call, ANY

import pytest
from jose import ExpiredSignatureError

import api
from api.PclusterApiHandler import get_identity


MOCK_IDENTITY_OBJECT = {"user_roles": ["user", "admin"], "username": "username", "attributes": {"email": "user@domain.com"}}

def test_get_identity_auth_disabled(monkeypatch):
    """
    Given an handler for the /get-identity endpoint
      When authentication is disabled
        Then it should return a static identity object
    """
    monkeypatch.setenv("ENABLE_AUTH", "false")
    assert get_identity() == MOCK_IDENTITY_OBJECT

def test_get_identity_auth_enabled_both_tokens_provide_attributes(monkeypatch, mocker, app):
    """
    Given an handler for the /get-identity endpoint
      When authentication is enabled
      When both access token and identity token contain the same user attributes
        Then it should return the attributes contained in the identity token
    """
    monkeypatch.setenv("ENABLE_AUTH", "true")
    monkeypatch.setattr('api.PclusterApiHandler.USER_ROLES_CLAIM', 'user_roles_claim')
    accessTokenDecoded = {
      'user_roles_claim': ['access-token-group'],
      'username': 'access-token-username',
      'email': 'access-token-email'
    }
    identityTokenDecoded = {
      'user_roles_claim': ['id-token-group'],
      'username': 'id-token-username',
      'email': 'id-token-email'
    }
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token; idToken=identity-token'}):
      mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[accessTokenDecoded, identityTokenDecoded])

      assert get_identity() == {
          'attributes': {'email': 'id-token-email'},
          'user_roles': ['id-token-group'],
          'username': 'id-token-username'
      }

def test_get_identity_auth_enabled_access_tokens_used_as_fallback(monkeypatch, mocker, app):
    """
    Given an handler for the /get-identity endpoint
      When authentication is enabled
      When identity token is missing some user attributes
        Then it should fallback to the attributes contained in the access token
    """
    monkeypatch.setenv("ENABLE_AUTH", "true")
    monkeypatch.setattr('api.PclusterApiHandler.USER_ROLES_CLAIM', 'user_roles_claim')
    accessTokenDecoded = {
      'user_roles_claim': ['access-token-group'],
      'username': 'access-token-username',
      'email': 'access-token-email'
    }
    identityTokenDecoded = {
      'email': 'id-token-email'
    }
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token; idToken=identity-token'}):
      mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[accessTokenDecoded, identityTokenDecoded])

      assert get_identity() == {
          'attributes': {'email': 'id-token-email'},
          'user_roles': ['access-token-group'],
          'username': 'access-token-username'
      }

def test_get_identity_auth_enabled_no_username_provided(monkeypatch, mocker, app):
    """
    Given an handler for the /get-identity endpoint
      When authentication is enabled
      When username could not be retrieved
        Then it should raise Exception
    """
    monkeypatch.setenv("ENABLE_AUTH", "true")
    monkeypatch.setattr('api.PclusterApiHandler.USER_ROLES_CLAIM', 'user_roles_claim')
    accessTokenDecoded = {}
    identityTokenDecoded = {
      'user_roles': ['id-token-group'],
      'email': 'id-token-email'
    }
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token; idToken=identity-token'}):
      mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[accessTokenDecoded, identityTokenDecoded])
      with pytest.raises(Exception):
          get_identity()

def test_get_identity_auth_enabled_no_user_roles_provided(monkeypatch, mocker, app):
    """
    Given an handler for the /get-identity endpoint
      When authentication is enabled
      When user roles could not be retrieved
        Then it should raise Exception
    """
    monkeypatch.setenv("ENABLE_AUTH", "true")
    monkeypatch.setattr('api.PclusterApiHandler.USER_ROLES_CLAIM', 'user_roles_claim')
    accessTokenDecoded = {}
    identityTokenDecoded = {
      'username': 'id-token-username',
      'email': 'id-token-email'
    }
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token; idToken=identity-token'}):
      mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[accessTokenDecoded, identityTokenDecoded])

      with pytest.raises(Exception):
          get_identity()

def test_get_identity_auht_enabled_expired_access_token_with_correctly_refreshed_tokens(app, mocker):
    """
    Given a controller method for the get_identity endpoint
      when auth is enabled
      when access token is expired
        and the refresh token is performed successfully
          it should return the identity built from the refreshed tokens
    """
    mock_decoded_access_token = {'user_roles_claim': ['access-token-group'],'username': 'access-token-username','email': 'access-token-email'}

    mock_jwt_decode = mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[ExpiredSignatureError(), mock_decoded_access_token])
    mocker.patch.object(api.PclusterApiHandler, 'auth_cookies', {'accessToken': 'refreshed-access-token'})
    mocker.patch('api.PclusterApiHandler.USER_ROLES_CLAIM', 'user_roles_claim')

    with app.test_request_context('/manager/get_identity', headers={'Cookie': 'accessToken=access-token'}):
        identity = get_identity()

    mock_jwt_decode.assert_has_calls([call(ANY), call('refreshed-access-token')])
    assert identity == {'attributes': {'email': 'access-token-email'}, 'user_roles': ['access-token-group'], 'username': 'access-token-username'}