from api.security.fingerprint import CognitoFingerprintGenerator


def test_cognito_fingerprint_generator():
    """
    With fixed values
      and a CognitoFingerprintGenerator
        it should produce the same fingerprint everytime
    """
    client_id, client_secret, user_pool_id = 'client-id', 'client-secret', 'pool-id'
    expected_fingerprint = '88056a6f3236e82b05de9bbb01a979b2877563c0c971148bc20aaa9aad8b3b85'

    gen = CognitoFingerprintGenerator(client_id, client_secret, user_pool_id)
    fingerprint = gen.fingerprint()

    assert fingerprint == expected_fingerprint
