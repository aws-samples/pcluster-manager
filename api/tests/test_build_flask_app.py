import pytest

from app import run


@pytest.fixture()
def dev_app(monkeypatch):
    monkeypatch.setenv("ENV", "dev")
    app = run()
    app.config.update({
        "TESTING": True,
    })

    yield app


@pytest.fixture()
def dev_client(dev_app):
    return dev_app.test_client()


def test_build_flask_app_dev(dev_app, dev_client):
    """
    Given the package name
      When a Flask app is initialized
      When in the development environment
        Then it should enable CORS
    """
    response = dev_client.get('/manager/get_app_config')
    cors_header = response.headers.get('Access-Control-Allow-Origin')
    assert cors_header == '*'


def test_build_flask_app_prod(app, client):
    """
    Given the package name
      When a Flask app is initialized
      When in the production environment
        Then it should not enable CORS
    """
    response = client.get('/manager/get_app_config')
    cors_header = response.headers.get('Access-Control-Allow-Origin')
    assert cors_header is None
