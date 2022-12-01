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
