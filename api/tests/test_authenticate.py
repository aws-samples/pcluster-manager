import os
from unittest import mock

import pytest
from flask import g
from api.PclusterApiHandler import authenticate, USER_ROLES_CLAIM
from jose import jwt

def test_authenticate(mock_disable_auth):
    """
    Given an authentication middleware
      When authentication is disabled
        Then it should do nothing
    """
    assert authenticate({'any-group'}) is None

def test_authenticate_with_no_access_token_returns_401(mocker, app):
    with app.test_request_context():
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(401)

def test_authenticate_with_access_token_no_id_token_returns_401(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(401)

def test_authenticate_with_id_token_no_access_token_returns_401(mocker, app):
    with app.test_request_context(headers={'Cookie': 'idToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(401)

def test_authenticate_with_expired_signature_returns_401(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     side_effect=jwt.ExpiredSignatureError())

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(401)


def test_authenticate_with_signature_exception_returns_401(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     side_effect=Exception())

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(401)

def test_authenticate_with_expired_access_token(mocker, app):
    refresh_tokens = {'accessToken': 'access-token', 'idToken': 'id-token'}
    mock_decoded = {USER_ROLES_CLAIM: ['any-group']}

    with app.test_request_context(headers={'Cookie': 'accessToken=access-token;refreshToken=refresh-token'}):
        mock_refresh_tokens = mocker.patch('api.PclusterApiHandler.refresh_tokens', return_value=refresh_tokens)
        mocker.patch('api.PclusterApiHandler.jwt_decode', side_effect=[jwt.ExpiredSignatureError(), mock_decoded])

        authenticate({'any-group'})

        mock_refresh_tokens.assert_called_with('refresh-token')
        assert g.auth_cookies == refresh_tokens

def test_authenticate_with_non_guest_group_not_in_user_roles_claim_returns_403(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     return_value={'cognito:groups': ['other-group']})

        authenticate({'any-group'})

        mock_abort.assert_called_once_with(403)

def test_authenticate_when_no_groups_are_given_it_should_return_403(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     return_value={'cognito:groups': ['other-group']})

        authenticate(None)

        mock_abort.assert_called_once_with(403)

def test_authenticate_with_group_in_user_role_claim_succeeds(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     return_value={'cognito:groups': ['my-group']})

        authenticate({'my-group'})

        mock_abort.assert_not_called()

def test_authenticate_with_admin_not_in_the_user_group_succeds(mocker, app):
    with app.test_request_context(headers={'Cookie': 'accessToken=access-token'}):
        mock_abort = mocker.patch('api.PclusterApiHandler.abort')
        mocker.patch('api.PclusterApiHandler.jwt_decode',
                     return_value={'cognito:groups': ['admin']})

        authenticate({'some-group', 'admin'})

        mock_abort.assert_not_called()