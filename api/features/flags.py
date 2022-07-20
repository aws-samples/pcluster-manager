from functools import wraps
from appconfig_helper import AppConfigHelper


class FeatureFlags:
    def __init__(self, appconfig):
        _config = appconfig

    def is_flag_enabled(self, flag):
        _flag = self.get_feature_flag(flag)
        return _flag is not None and _flag['enabled']

    def get_feature_flag(self, flag, default_value=None):
        if flag not in appconfig.config:
            return default_value

        return appconfig.config.get(flag)

    def update_config(self, force=False):
        appconfig.update_config(force_update=force)


appconfig = AppConfigHelper("pcm-feature-flag-poc", "dev", "pcm-api", 15)
appconfig.update_config()
config = FeatureFlags(appconfig)


def feature_flag(flag_id, enabled=True):
    def _feature_flag(func):
        @wraps(func)
        def _feature_flag_wrapper(*args, **kwargs):
            if not enabled:
                return func(*args, **kwargs)

            config.update_config()

            if config.is_flag_enabled(flag_id):
                return func(*args, **kwargs)
            else:
                return {"error": "Method not allowed"}, 405

        return _feature_flag_wrapper

    return _feature_flag
