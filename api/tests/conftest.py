import pytest
from app import run


@pytest.fixture()
def app():
    app = run()
    app.config.update({
        "TESTING": True,
    })

    # other setup can go here

    yield app

    # clean up / reset resources here


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
