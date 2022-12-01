from api.security.headers import SECURITY_HEADERS, CORS_HEADERS


def test_response_security_headers_dev(dev_app, dev_client):
    """
    Given a PCM app in local development
      When a request is performed
        Then it should have security headers correctly set for local development
    """
    response = dev_client.get('/manager/get_app_config')

    for header in SECURITY_HEADERS:
        assert header['key'] in response.headers


def test_response_security_headers_prod(app, client):
    """
    Given a PCM app
      When a request is performed
        Then it should have security headers correctly set
    """
    response = client.get('/manager/get_app_config')

    for header in [*CORS_HEADERS, *SECURITY_HEADERS]:
        assert header['key'] in response.headers
