import json
from unittest.mock import MagicMock

from api.logging import RequestResponseLogging, log_request_body_and_headers, log_response_body_and_headers
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


def test_request_response_logging_extension(app):
    """
    Given a Flask app
      when using the RequestResponseLogging extension
        it should present a log_request before func and a log_response after_func
    """
    RequestResponseLogging(app)

    before_func_names = __get_function_name_list(app.before_request_funcs)
    after_func_names = __get_function_name_list(app.after_request_funcs)

    assert 'log_request' in before_func_names
    assert 'log_response' in after_func_names


def __get_function_name_list(functions):
    return list(fun.__name__ for app_name, funcs in functions.items() for fun in funcs)


class MockRequest:
    headers = {'int_value': 100}
    args = {'region': 'eu-west-1'}
    json = {'username': 'user@email.com'}


def test_log_request_body_and_headers(mocker):
    mock_logger = MagicMock(wraps=DefaultLogger(True))

    log_request_body_and_headers(mock_logger, MockRequest())

    expected_details = {
        'headers': {'int_value': 100},
        'body': {'username': 'user@email.com'},
        'params': {'region': 'eu-west-1'}
    }

    mock_logger.info.assert_called_once_with(f'Request info: {json.dumps(expected_details)}')


def test_log_response_body_and_headers(mocker):
    mock_logger = MagicMock(wraps=DefaultLogger(True))

    log_response_body_and_headers(mock_logger, MockRequest())

    expected_details = {
        'headers': {'int_value': 100},
        'body': {'username': 'user@email.com'}
    }

    mock_logger.info.assert_called_once_with(f'Response info: {json.dumps(expected_details)}')
