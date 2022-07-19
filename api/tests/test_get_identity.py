import os
from unittest import mock
from api.PclusterApiHandler import get_identity


MOCK_IDENTITY_OBJECT = {"user_roles": ["user", "admin"], "username": "username", "attributes": {"email": "user@domain.com"}}

@mock.patch.dict(os.environ,{"ENABLE_AUTH": "false"})
def test_get_identity():
    """
    Given an handler for the /get-identity endpoint
      When authentication is disabled
        Then it should return a static identity object
    """
    assert get_identity() == MOCK_IDENTITY_OBJECT