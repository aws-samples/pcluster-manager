from abc import abstractmethod, ABC

class OIDCProviderFactory(ABC):
    pass


class EnvVarOIDCProviderFactory(OIDCProviderFactory):
    pass