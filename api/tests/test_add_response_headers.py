COMMON_SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Permissions-Policy': 'interest-cohort=()',
    'X-XSS-Protection': '1; mode=block'
}


def test_response_security_headers_dev(dev_app, dev_client):
    """
    Given a PCM app in local development
      When a request is performed
        Then it should have security headers correctly set for local development
    """
    response = dev_client.get('/manager/get_app_config')
    expected_security_headers = COMMON_SECURITY_HEADERS
    for header, value in expected_security_headers.items():
        assert header in response.headers
        assert value == response.headers[header]


def test_response_security_headers_prod(app, client):
    """
    Given a PCM app
      When a request is performed
        Then it should have security headers correctly set
    """
    response = client.get('/manager/get_app_config')
    expected_security_headers = {
        'Cross-Origin-Resource-Policy': 'same-site',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        **COMMON_SECURITY_HEADERS
    }
    for header, value in expected_security_headers.items():
        assert header in response.headers
        assert value == response.headers[header]
