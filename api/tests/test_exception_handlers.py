import pytest
from botocore.exceptions import ClientError


@pytest.fixture()
def client_error_response():
    error_response = dict(Error={'Code': 400, 'Message': 'Operation failed'})
    error_response['ResponseMetadata'] = dict(HTTPStatusCode=400)
    return ClientError(error_response, 'failed_operation')


def test_boto3_exception_handler(client, client_error_response, app, monkeypatch):
    def set_user_role_raising_clienterror():
        raise client_error_response

    monkeypatch.setitem(app.view_functions, 'set_user_role_', set_user_role_raising_clienterror)
    response = client.put('/manager/set_user_role', json={'username': 'some-user', 'role': 'some-role'})

    assert response.status_code == 400
    assert response.json == {'error': {'Code': 400, 'Message': 'Operation failed'}}

def test_value_error_exception_handler(client, app, monkeypatch):
    def push_log_raising():
        raise ValueError('Validation error')

    monkeypatch.setitem(app.view_functions, 'push_log', push_log_raising)
    response = client.post('/push-log')

    assert response.status_code == 400
    assert response.json == {'error': {'Code': 400, 'Message': 'Validation error'}}

def test_global_exception_handler_with_app_logic(client, app, monkeypatch):
    def get_app_config_raising_generic_exception():
        raise Exception('generic exception')

    monkeypatch.setitem(app.view_functions, 'get_app_config_', get_app_config_raising_generic_exception)
    response = client.get('/manager/get_app_config')

    assert response.status_code == 500
    assert response.json == {'error': {'Code': 500, 'Message': 'Something went wrong'}}
