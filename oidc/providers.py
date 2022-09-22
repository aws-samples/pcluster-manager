from abc import abstractmethod, ABC


class OIDCConfig(ABC):
    """Interface for OIDC config info provider
    """
    PROVIDER_ID = 'BaseConfig'
    DEFAULT_USER_ROLES_CLAIM = ''

    def __init__(self, client_id, client_secret, scopes=None, user_roles_claim=None):
        self.__scopes = None
        self.__client_id = client_id
        self.__client_secret = client_secret
        self.__handle_scopes(scopes)
        self.__user_roles_claim = self.DEFAULT_USER_ROLES_CLAIM if user_roles_claim is None else user_roles_claim
        self.base_url = None

    def __handle_scopes(self, scopes):
        openid = 'openid'
        if scopes is None:
            return openid

        if openid not in self.__scopes:
            self.__scopes = self.__scopes + ' openid'

    @classmethod
    def oidc_provider(cls):
        return cls.PROVIDER_ID

    @abstractmethod
    def auth_url(self):
        pass

    @abstractmethod
    def token_url(self):
        pass

    @abstractmethod
    def logout_url(self):
        pass

    def wellknown_oidc_config_url(self):
        return None

    @abstractmethod
    def jwks_url(self):
        pass

    def client_id(self):
        return self.__client_id

    def client_secret(self):
        return self.__client_secret

    def audience(self):
        return self.client_id()

    def user_roles_claim(self):
        return self.__user_roles_claim

    def scopes(self):
        return self.__scopes


class OktaConfig(OIDCConfig):
    PROVIDER_ID = 'Okta'
    DEFAULT_USER_ROLES_CLAIM = 'groups'

    def __init__(self, domain, authorization_server_id, client_id, client_secret, scopes=None, user_roles_claim=None):
        super().__init__(client_id, client_secret, scopes, user_roles_claim)
        self.domain = domain
        self.resource_server_id = authorization_server_id
        self.base_url = f'https://${domain}/oauth2/${authorization_server_id}'

    def auth_url(self):
        return f'${self.base_url}/v1/authorize'

    def token_url(self):
        return f'${self.base_url}/v1/token'

    def logout_url(self):
        return f'${self.base_url}/v1/logout'

    def jwks_url(self):
        return f'${self.base_url}/keys'


class CognitoConfig(OIDCConfig):
    PROVIDER_ID = 'Cognito'
    DEFAULT_USER_ROLES_CLAIM = 'cognito:groups'

    def __init__(self, domain, user_pool_id, client_id, client_secret, scopes=None, user_roles_claim=None):
        super().__init__(client_id, client_secret, scopes, user_roles_claim)
        self.__user_pool_id = user_pool_id
        self.__region = user_pool_id.split('_')[1]
        self.__domain = domain

        self.base_url = f'https://{self.__domain}.auth.{self.__region}.amazoncognito.com'

    def auth_url(self):
        return f'{self.base_url}/login'

    def token_url(self):
        return f'{self.base_url}/oauth2/token'

    def logout_url(self):
        return f'{self.base_url}/logout'

    def jwks_url(self):
        return f'https://cognito-idp.{self.__region}.amazonaws.com/{self.__user_pool_id}/.well-known/jwks.json'

    def wellknown_oidc_config_url(self):
        return f'https://cognito-idp.{self.__region}.amazonaws.com/{self.__user_pool_id}/.well-known/openid-configuration'
