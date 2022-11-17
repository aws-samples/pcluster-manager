import pytest
from botocore.exceptions import ClientError

import app

@pytest.fixture()
def client_error_response():
    error_response = dict(Error={'Code': 400, 'Message': 'Operation failed'})
    error_response['ResponseMetadata'] = dict(HTTPStatusCode=400)
    return ClientError(error_response, 'failed_operation')

def test_boto3_exception_handler(client, client_error_response, monkeypatch):
    def set_user_role_raising_clienterror():
        raise client_error_response

    monkeypatch.setattr(app, 'set_user_role', set_user_role_raising_clienterror)
    monkeypatch.setenv('ENABLE_AUTH', 'false')

    response = client.put('/manager/set_user_role', json={'username': 'some-user', 'role': 'some-role'})

    assert response.status_code == 400
    assert response.json == {'error': {'Code': 400, 'Message': 'Operation failed'}}


def test_global_exception_handler_with_app_logic(client, monkeypatch):
    def set_user_role_raising_generic_exception():
        raise Exception('generic exception')

    monkeypatch.setattr(app, 'get_app_config', set_user_role_raising_generic_exception)

    response = client.get('/manager/get_app_config')

    assert response.status_code == 500
    assert response.json == {'error': {'Code': 500, 'Message': 'Something went wrong'}}
