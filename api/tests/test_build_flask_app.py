from api.utils import build_flask_app
from flask_restful import Api

def test_build_flask_app_dev(monkeypatch):
    """
    Given the package name
      When a Flask app is initialized
      When in the development environment
        Then it should enable CORS
    """
    monkeypatch.setenv("ENV", "dev")
    app = build_flask_app('any-name')

    with app.app_context():
        with app.test_client() as client:
            response = client.get('/')
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            assert cors_header == '*'


def test_build_flask_app_prod(monkeypatch):
    """
    Given the package name
      When a Flask app is initialized
      When in the production environment
        Then it should not enable CORS
    """
    monkeypatch.setenv("ENV", "")
    app = build_flask_app('any-name')

    with app.app_context():
        with app.test_client() as client:
            response = client.get('/')
            cors_header = response.headers.get('Access-Control-Allow-Origin')
            assert cors_header == None

