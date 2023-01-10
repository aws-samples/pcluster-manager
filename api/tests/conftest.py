import os

import pytest

import api.security
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
def runner(app):
    return app.test_cli_runner()

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


@pytest.fixture(scope='function')
def mock_csrf_needed(mocker, app):
    mock_csrf_enabled = mocker.patch.object(api.security.csrf.csrf, 'is_csrf_enabled')
    mock_csrf_enabled.return_value = False

@pytest.fixture(scope='function')
def mock_enable_auth(mocker):
    return mocker.patch.dict(os.environ, {'ENABLE_AUTH': 'false'})