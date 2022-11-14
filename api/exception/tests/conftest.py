import pytest
from botocore.exceptions import ClientError

from app import run


@pytest.fixture()
def app():
    app = run()
    app.config.update({
        "TESTING": True,
    })

    yield app


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def client_error_response():
    error_response = dict(Error={'Code': 400, 'Message': 'Operation failed'})
    error_response['ResponseMetadata'] = dict(HTTPStatusCode=400)
    return ClientError(error_response, 'failed_operation')
