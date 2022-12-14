from api.security.fingerprint import CognitoFingerprintGenerator


def test_cognito_fingerprint_generator():
    """
    With fixed values
      and a CognitoFingerprintGenerator
        it should produce the same fingerprint everytime
    """
    client_id, client_secret, user_pool_id = 'client-id', 'client-secret', 'pool-id'
    expected_fingerprint = '456fe4db680c3be20d9f7d000d5d2fdc5aff08668832760caac765aa2814bdd6'

    gen = CognitoFingerprintGenerator(client_id, client_secret, user_pool_id)
    fingerprint = gen.fingerprint()

    assert fingerprint == expected_fingerprint
