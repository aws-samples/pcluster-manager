import os
from unittest import mock
from api.PclusterApiHandler import authenticate


@mock.patch.dict(os.environ,{"ENABLE_AUTH": "false"})
def test_authenticate():
    """
    Given an authentication middleware
      When authentication is disabled
        Then it should do nothing
    """
    assert authenticate('any-group') is None