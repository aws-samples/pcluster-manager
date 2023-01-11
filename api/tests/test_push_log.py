from os import environ

import pytest


def trim_log(caplog):
    return caplog.text.replace('\n', '')


@pytest.fixture(scope='function')
def disable_auth(monkeypatch):
    monkeypatch.setitem(environ, 'ENABLE_AUTH', 'false')


def test_push_log_controller_with_valid_json_no_extra(client, caplog, disable_auth, mock_csrf_needed):
    request_body = { 'logs': [{'message': 'sample-message', 'level': 'info'}] }
    expected_log = "INFO     pcluster-manager:logger.py:24 {'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert trim_log(caplog) == expected_log


def test_push_log_controller_with_valid_json_with_extra(client, caplog, disable_auth, mock_csrf_needed):
    request_body = { 'logs': [{'message': 'sample-message', 'level': 'error',
                    'extra': {'extra_1': 'value_1', 'extra_2': 'value_2'}}]}
    expected_log = "ERROR    pcluster-manager:logger.py:30 {'extra_1': 'value_1', 'extra_2': 'value_2', 'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert trim_log(caplog) == expected_log
