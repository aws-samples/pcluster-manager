import pytest

def trim_log(caplog):
    return caplog.text.replace('\n', '')


def test_push_log_controller_with_valid_json_no_extra(client, caplog, mock_disable_auth, mock_csrf_needed):
    request_body = { 'logs': [{'message': 'sample-message', 'level': 'info'}] }
    expected_log = "INFO     pcluster-manager:logger.py:24 {'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert expected_log in trim_log(caplog)


def test_push_log_controller_with_valid_json_with_extra(client, caplog, mock_disable_auth, mock_csrf_needed):
    request_body = { 'logs': [{'message': 'sample-message', 'level': 'error',
                    'extra': {'extra_1': 'value_1', 'extra_2': 'value_2'}}]}
    expected_log = "ERROR    pcluster-manager:logger.py:30 {'extra_1': 'value_1', 'extra_2': 'value_2', 'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/logs', json=request_body)

    assert response.status_code == 200
    assert expected_log in trim_log(caplog)
