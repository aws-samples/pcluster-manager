from os import environ

import pytest


def trim_log(caplog):
    return caplog.text.replace('\n', '')

@pytest.fixture(scope='function')
def disable_auth(monkeypatch):
    monkeypatch.setitem(environ, 'ENABLE_AUTH', 'false')
    monkeypatch.setitem(environ, 'ENABLE_CSRF', 'false')


def test_push_log_controller_with_valid_json_no_extra(client, caplog, disable_auth):
    request_body = {'message': 'sample-message', 'level': 'info'}
    expected_log = "INFO     pcluster-manager:logger.py:24 {'source': 'frontend', 'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert trim_log(caplog) == expected_log


def test_push_log_controller_with_valid_json_with_extra(client, caplog, disable_auth):
    request_body = {'message': 'sample-message', 'level': 'error',
                    'extra': {'extra_1': 'value_1', 'extra_2': 'value_2'}}
    expected_log = "ERROR    pcluster-manager:logger.py:30 {'extra_1': 'value_1', 'extra_2': 'value_2', 'source': 'frontend', 'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert trim_log(caplog) == expected_log


def test_push_log_controller_with_invalid_message_key(client, disable_auth):
    request_body = {'message_wrong': 'sample-message', 'level': 'info'}

    response = client.post('/logs', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'Request body missing one or more mandatory fields ["message", "level"]'
        }
    }


def test_push_log_controller_with_invalid_level_key(client, disable_auth):
    request_body = {'message': 'sample-message', 'level_wrong': 'info'}

    response = client.post('/logs', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'Request body missing one or more mandatory fields ["message", "level"]'
        }
    }


def test_push_log_controller_with_invalid_level_value(client, disable_auth):
    request_body = {'message': 'sample-message', 'level': 'wrong-level'}

    response = client.post('/logs', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'Invalid logging level requested'
        }
    }


def test_push_log_controller_with_invalid_extra_value(client, disable_auth):
    request_body = {'message': 'sample-message', 'level': 'info', 'extra': 'wrong-value'}

    response = client.post('/logs', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'Extra param must be a valid json object'
        }
    }
