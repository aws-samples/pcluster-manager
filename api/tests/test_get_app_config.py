from api.PclusterApiHandler import get_app_config

def test_get_app_config(monkeypatch):
    """
    Given a handler for the /get-app-config endpoint
      When authentication variables are set
        Then it should return the application config
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_URL', 'some-url')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.OIDC_PROVIDER', 'some-oidc-provider')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', 'some-scope')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        'auth_url': 'some-url',
        'client_id': 'some-id',
        'oidc_provider': 'some-oidc-provider',
        'scopes': 'some-scope openid',
        'redirect_uri': 'some-url/login'
    }

def test_get_app_config_with_empty_scopes_list(monkeypatch):
    """
    Given a handler for the /get-app-config endpoint
      When the scopes list is empty
        Then it should return openid as scope
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_URL', 'some-url')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.OIDC_PROVIDER', 'some-oidc-provider')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', '')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        'auth_url': 'some-url',
        'client_id': 'some-id',
        'oidc_provider': 'some-oidc-provider',
        'scopes': 'openid',
        'redirect_uri': 'some-url/login'
    }

def test_get_app_config_with_openid_as_scope(monkeypatch):
    """
    Given a handler for the /get-app-config endpoint
      When the scopes list contains openid
        Then it should return the scopes list as is
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_URL', 'some-url')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.OIDC_PROVIDER', 'some-oidc-provider')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', 'some-scope openid')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        'auth_url': 'some-url',
        'client_id': 'some-id',
        'oidc_provider': 'some-oidc-provider',
        'scopes': 'some-scope openid',
        'redirect_uri': 'some-url/login'
    }