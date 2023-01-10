from api.exception.exceptions import RefreshTokenError


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

def test_unauthenticated_error_handler(client, app, monkeypatch):

    def push_log_raising():
        raise RefreshTokenError('refresh-token-error')

    monkeypatch.setitem(app.view_functions, 'push_log', push_log_raising)
    response = client.post('/logs')

    assert response.status_code == 401
    assert response.json == {'code': 401, 'message': 'Refresh token error: refresh-token-error'}

def test_validation_error_handler(client, mock_enable_auth, mock_csrf_needed):

    response = client.post('/manager/ec2_action', query_string={'region': 'eu-west-1', 'instance_ids': 'i-1,i-2', 'action': 'invalid-action'})

    assert response.status_code == 400
    assert response.json == {
        'code': 400, 'message': 'Input validation failed for /manager/ec2_action',
        'validation_errors': {'action': ['Must be one of: stop_instances, start_instances.']}
    }

def test_global_exception_handler_with_app_logic(client, app, monkeypatch):
    def get_app_config_raising_generic_exception():
        raise Exception('generic exception')

    monkeypatch.setitem(app.view_functions, 'get_app_config_', get_app_config_raising_generic_exception)
    response = client.get('/manager/get_app_config')

    assert response.status_code == 400
    assert response.json == {'code': 400, 'message': 'An error occurred while trying to complete your request. Please try again later. If the problem persists, please contact support for further assistance.'}
