import hashlib
from abc import ABC


class IFingerprintGenerator(ABC):

    def fingerprint(self):
        pass


class CognitoFingerprintGenerator(IFingerprintGenerator):

    def __init__(self, client_id, client_secret, user_pool_id):
        self.client_id = client_id
        self.client_secret = client_secret
        self.user_pool_id = user_pool_id

    def fingerprint(self):
        hash = self.__hash('', self.client_id)
        hash = self.__hash(hash, self.client_secret)
        return self.__hash(hash, self.user_pool_id)

    def __hash(self, a, b):
        return hashlib.sha256(f'{a}:{b}'.encode('utf-8')).hexdigest()
