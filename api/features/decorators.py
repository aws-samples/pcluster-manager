from functools import update_wrapper

from api.features.flags import features_config, experimental_config


def _make_feature_flag_wrapper(func, flag_id, enabled, config):
    def _wrapper(*args, **kwargs):
        if not enabled:
            return func(*args, **kwargs)

        config.update_config()

        if config.is_flag_enabled(flag_id):
            return func(*args, **kwargs)
        else:
            return {"error": "Method not allowed"}, 405

    return _wrapper


def feature_flag(flag_id, enabled=True):
    def _feature_flag(func):
        _feature_flag_wrapper = _make_feature_flag_wrapper(func, flag_id, enabled, features_config)
        return update_wrapper(_feature_flag_wrapper, func)

    return _feature_flag


def experimental_flag(flag_id, enabled=True):
    def _experimental_flag(func):
        _feature_flag_wrapper = _make_feature_flag_wrapper(func, flag_id, enabled, experimental_config)
        return update_wrapper(_feature_flag_wrapper, func)

    return _experimental_flag
