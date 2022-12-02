from flask import Response

from api.security import add_security_headers, add_security_headers_dev

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
    Given a PCM app
      When a response is processed
        Then it should have security headers correctly set for local development
    """
    expected_security_headers = COMMON_SECURITY_HEADERS

    response = Response()
    response = add_security_headers_dev(response)

    for header, value in expected_security_headers.items():
        assert header in response.headers
        assert value == response.headers[header]


def test_response_security_headers_prod(app, client):
    """
    Given a PCM app
      When a response is processed
        Then it should have security headers correctly set
    """
    expected_security_headers = {
        'Cross-Origin-Resource-Policy': 'same-site',
        'Cross-Origin-Embedder-Policy': 'require-corp',
        **COMMON_SECURITY_HEADERS
    }

    response = Response()
    response = add_security_headers(response)

    for header, value in expected_security_headers.items():
        assert header in response.headers
        assert value == response.headers[header]
