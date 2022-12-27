from api.logging.logger import DefaultLogger
import logging


def test_logger_level_prod():
  """
  Given a DefaultLogger
    When not running local
      It should set log level to INFO
  """

  logger = DefaultLogger(is_running_local=False)
  assert logger.logger.getEffectiveLevel() == logging.INFO


def test_logger_level_dev():
  """
  Given a DefaultLogger
    When is running local
      It should set log level to DEBUG
  """

  logger = DefaultLogger(is_running_local=True)
  assert logger.logger.getEffectiveLevel() == logging.DEBUG

