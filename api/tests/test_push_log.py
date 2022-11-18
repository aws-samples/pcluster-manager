
def test_push_log_controller_with_valid_json_no_extra(client, caplog):
    request_body = {'message': 'sample-message', 'level': 'info'}
    expected_log = "INFO     pcluster-manager:logger.py:24 {'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/push-log', json=request_body)

    assert response.status_code == 200
    assert caplog.text == expected_log


def test_push_log_controller_with_valid_json_with_extra(client, caplog):
    request_body = {'message': 'sample-message', 'level': 'error',
                    'extra': {'extra_1': 'value_1', 'extra_2': 'value_2'}}
    expected_log = "ERROR    pcluster-manager:logger.py:30 {'extra_1': 'value_1', 'extra_2': 'value_2', 'message': 'sample-message'}"

    caplog.clear()
    response = client.post('/push-log', json=request_body)

    assert response.status_code == 200
    assert caplog.text.replace('\n', '') == expected_log


def test_push_log_controller_with_invalid_message_key(client):
    request_body = {'message_wrong': 'sample-message', 'level': 'info'}

    response = client.post('/push-log', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'Request body missing on or more mandatory fields ["message", "level"]'
        }
    }


def test_push_log_controller_with_invalid_level_key(client):
    request_body = {'message': 'sample-message', 'level_wrong': 'info'}

    response = client.post('/push-log', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'request body missing on or more mandatory fields ["message", "level"]'
        }
    }


def test_push_log_controller_with_invalid_level_value(client):
    request_body = {'message': 'sample-message', 'level': 'wrong-level'}

    response = client.post('/push-log', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'request body missing on or more mandatory fields ["message", "level"]'
        }
    }


def test_push_log_controller_with_invalid_extra_value(client):
    request_body = {'message': 'sample-message', 'level': 'info', 'extra': 'wrong-value'}

    response = client.post('/push-log', json=request_body)

    assert response.status_code == 400
    assert response.json == {
        'error': {
            'Code': 400,
            'Message': 'request body missing on or more mandatory fields ["message", "level"]'
        }
    }
