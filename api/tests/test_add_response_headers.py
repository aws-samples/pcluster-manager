def test_response_security_headers_dev(dev_app, dev_client):
    """
    Given a PCM app in local development
      When a request is performed
        Then it should have security headers correctly set for local development
    """
    response = dev_client.get('/manager/get_app_config')
    expected_security_headers = [
        'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy',
        'Strict-Transport-Security', 'Permissions-Policy', 'X-XSS-Protection'
    ]
    for header in expected_security_headers:
        assert header in response.headers


def test_response_security_headers_prod(app, client):
    """
    Given a PCM app
      When a request is performed
        Then it should have security headers correctly set
    """
    response = client.get('/manager/get_app_config')
    expected_security_headers = [
        'Cross-Origin-Resource-Policy', 'Cross-Origin-Embedder-Policy',
        'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy',
        'Strict-Transport-Security', 'Permissions-Policy', 'X-XSS-Protection'
    ]
    for header in expected_security_headers:
        assert header in response.headers
