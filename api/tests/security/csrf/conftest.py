import hashlib

import pytest
from itsdangerous import URLSafeSerializer

from api.tests.security.csrf.test_csrf import MOCK_URANDOM_VALUE, SECRET_KEY, SALT


@pytest.fixture
def mock_csrf_token_value():
    _mock_csrf_token_value = hashlib.sha256(MOCK_URANDOM_VALUE).hexdigest()
    return _mock_csrf_token_value


@pytest.fixture
def mock_csrf_token_string(mock_csrf_token_value):
    return URLSafeSerializer(SECRET_KEY, SALT).dumps(mock_csrf_token_value)


@pytest.fixture(scope='function')
def mock_parse_csrf(mocker):
    return mocker.patch('api.security.csrf.csrf.parse_csrf_token')
