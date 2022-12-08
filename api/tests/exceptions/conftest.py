import pytest
from botocore.exceptions import ClientError


@pytest.fixture()
def client_error_response():
    error_response = dict(Error={'Code': 400, 'Message': 'Operation failed'})
    error_response['ResponseMetadata'] = dict(HTTPStatusCode=400)
    return ClientError(error_response, 'failed_operation')
