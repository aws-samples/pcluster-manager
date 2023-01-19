from unittest.mock import MagicMock

from flask import Response

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

def test_request_response_logging_execution_urls_deny_list(app, mocker):
    """
        Given a Flask app
          when using the RequestResponseLogging extension
          when invoking a path from the specified no_logs_path
            it should not call the log_request_body_and_headers and log_response_body_and_headers functions
        """

    mock_log_request = mocker.patch('api.logging.http_info.log_request_body_and_headers')
    mock_log_response = mocker.patch('api.logging.http_info.log_response_body_and_headers')

    RequestResponseLogging(app)

    with app.test_request_context('/logs'):
        app.preprocess_request()
        app.process_response(Response('fake-response'))

    mock_log_request.assert_not_called()
    mock_log_response.assert_not_called()

def test_request_response_logging_execution(app, mocker):
    """
        Given a Flask app
          when using the RequestResponseLogging extension
          when invoking a path
            it should call the log_request_body_and_headers and log_response_body_and_headers functions
        """
    mock_log_request = mocker.patch('api.logging.log_request_body_and_headers')
    mock_log_response = mocker.patch('api.logging.log_response_body_and_headers')

    RequestResponseLogging(app)

    with app.test_request_context('/'):
        app.preprocess_request()
        app.process_response(Response('fake-response'))

    mock_log_request.assert_called_once()
    mock_log_response.assert_called_once()

def __get_function_name_list(functions):
    return list(fun.__name__ for app_name, funcs in functions.items() for fun in funcs)


class MockRequest:
    headers = {'int_value': 100}
    args = {'region': 'eu-west-1'}
    json = {'username': 'user@email.com'}
    path = '/fake-path'
    environ = {
        'serverless.event': {
            'requestContext': {
                'requestId': 'apigw-request-id'
            }
        }
    }


def test_log_request_body_and_headers():
    mock_logger = MagicMock(wraps=DefaultLogger(True))
    log_request_body_and_headers(mock_logger, MockRequest())

    expected_details = {
        'headers': {'int_value': 100},
        'body': {'username': 'user@email.com'},
        'path': '/fake-path',
        'params': {'region': 'eu-west-1'},
        'apigw-request-id': 'apigw-request-id'
    }

    mock_logger.info.assert_called_once_with(expected_details)


def test_log_response_body_and_headers():
    mock_logger = MagicMock(wraps=DefaultLogger(True))
    log_response_body_and_headers(mock_logger, MockRequest())

    expected_details = {
        'headers': {'int_value': 100},
        'body': {'username': 'user@email.com'}
    }

    mock_logger.info.assert_called_once_with(expected_details)
