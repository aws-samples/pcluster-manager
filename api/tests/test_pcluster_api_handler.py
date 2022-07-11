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


@mock.patch("api.PclusterApiHandler.requests.post")
def test_on_successful_login_auth_cookies_are_set(mock_post, client):
    with client as flaskClient:
        response_dict = {
            "access_token": "testAccessToken",
            "id_token": "testIdToken",
            "refresh_token": "testRefreshToken"
        }
        mock_post.return_value.json.return_value = response_dict
        resp = flaskClient.get("/login", query_string="code=testCode")
        cookie_list = resp.headers.getlist('Set-Cookie')
        assert "accessToken=testAccessToken; Secure; HttpOnly; Path=/; SameSite=Lax" in cookie_list
        assert "idToken=testIdToken; Secure; HttpOnly; Path=/; SameSite=Lax" in cookie_list
        assert "refreshToken=testRefreshToken; Secure; HttpOnly; Path=/; SameSite=Lax" in cookie_list
