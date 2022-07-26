from api.PclusterApiHandler import get_app_config

def test_get_app_config(monkeypatch):
    """
    Given an handler for the /get-app-config endpoint
      When authentication variables are set
        Then it should return a the application config
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_PATH', 'some-path')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', 'some-scope')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        "auth_path": 'some-path',
        "client_id": 'some-id',
        "scopes": 'some-scope openid',
        "redirect_url": 'some-url/login'
    }

def test_get_app_config_with_empty_scopes_list(monkeypatch):
    """
    Given an handler for the /get-app-config endpoint
      When the scopes list is empty
        Then it should return openid as scope
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_PATH', 'some-path')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', '')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        "auth_path": 'some-path',
        "client_id": 'some-id',
        "scopes": 'openid',
        "redirect_url": 'some-url/login'
    }

def test_get_app_config_with_openid_as_scope(monkeypatch):
    """
    Given an handler for the /get-app-config endpoint
      When the scopes list contains openid
        Then it should return thes scopes list as is
    """
    monkeypatch.setattr('api.PclusterApiHandler.AUTH_PATH', 'some-path')
    monkeypatch.setattr('api.PclusterApiHandler.CLIENT_ID', 'some-id')
    monkeypatch.setattr('api.PclusterApiHandler.SCOPES_LIST', 'some-scope openid')
    monkeypatch.setattr('api.PclusterApiHandler.SITE_URL', 'some-url')
    assert get_app_config() == {
        "auth_path": 'some-path',
        "client_id": 'some-id',
        "scopes": 'some-scope openid',
        "redirect_url": 'some-url/login'
    }