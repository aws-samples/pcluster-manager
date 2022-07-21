from appconfig_helper import AppConfigHelper
import boto3


class TopicsRetriever:
    def retrieve_topics(self):
        pass


class ParameterStoreTopicsRetriever(TopicsRetriever):
    def __init__(self):
        self.ssm = boto3.client('ssm')

    def retrieve_topics(self):
        parameter = self.ssm.get_parameter(Name='pcm-experimental-features-topics', WithDecryption=False)
        topics_string = parameter['Parameter']['Value']
        if len(topics_string) < 1:
            return []

        return list(map(lambda topic: topic.strip(), topics_string.split(',')))


class FeatureFlags:
    def __init__(self, appconfig):
        self._config = appconfig

    def is_flag_enabled(self, flag):
        _flag = self.get_feature_flag(flag)
        return _flag is not None and _flag['enabled']

    def get_feature_flag(self, flag, default_value=None):
        if flag not in self._config.config:
            return default_value

        return self._config.config.get(flag)

    def update_config(self, force=False):
        return self._config.update_config(force_update=force)

    def get_flags(self):
        return self._config.config


class ExperimentalFeatureFlags(FeatureFlags):
    def __init__(self, appconfig, retriever: TopicsRetriever):
        super().__init__(appconfig)
        self.retriever = retriever
        self._topics = []

    def get_feature_flag(self, flag, default_value=None):
        feature = super().get_feature_flag(flag)
        if feature is None or not self._is_topic_related(feature):
            return default_value

        return feature

    def update_config(self, force=False):
        if super().update_config(force):
            self._topics = self.retriever.retrieve_topics()

    def _is_topic_related(self, feature):
        _flag_topic = feature.get('topic')
        if _flag_topic is None:
            return None

        return any(_topic == _flag_topic for _topic in self._topics)


features_appconfig = AppConfigHelper(
    "pcm-feature-flag-poc",
    "dev",
    "pcm-api",
    15,
    fetch_on_init=True
)
experimental_appconfig = AppConfigHelper(
    "pcm-feature-flag-poc",
    "dev",
    "pcm-experimental-features",
    15,
    fetch_on_init=True
)

features_config = FeatureFlags(features_appconfig)
experimental_config = ExperimentalFeatureFlags(experimental_appconfig, ParameterStoreTopicsRetriever())

def get_flags():
    features_config.update_config()
    experimental_config.update_config()
    return {
        "feature_flags": features_config.get_flags(),
        "experimental_flags": experimental_config.get_flags()
    }