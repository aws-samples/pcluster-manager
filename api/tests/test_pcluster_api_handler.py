import pytest
from unittest import mock
from api.PclusterApiHandler import _get_user_roles


@mock.patch("api.PclusterApiHandler.USER_ROLES_CLAIM", "user_roles")
def test_user_roles():
    user_roles = ["user", "admin"]

    _test_decoded_with_user_roles_claim(decoded={"user_roles": user_roles}, user_roles=user_roles)
    _test_decoded_without_user_roles_claim(decoded={})


def _test_decoded_with_user_roles_claim(decoded, user_roles):
    assert _get_user_roles(decoded) == user_roles


def _test_decoded_without_user_roles_claim(decoded):
    assert _get_user_roles(decoded) == ["user"]
