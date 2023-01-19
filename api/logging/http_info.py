from typing import Union

from flask import Request, Response
from api import pcm_globals


def log_request_body_and_headers(_logger, request: Request):
    details = __get_http_info(request)
    details['path'] = request.path
    if request.args:
        details['params'] = request.args
    details['type'] = 'REQUEST'
    _logger.info(details)


def log_response_body_and_headers(_logger, response: Response):
    details = __get_http_info(response)
    details['type'] = 'RESPONSE'
    _logger.info(details)


def __get_http_info(r: Union[Request,Response]) -> dict:
    headers = __filter_headers(r.headers)
    details = {'headers': headers}

    if pcm_globals.apigw_request_id:
        details['apigw-request-id'] = pcm_globals.apigw_request_id
    try:
        body = r.json
        if body:
            details['body'] = body
    except:
        pass

    return details


def __filter_headers(headers: dict):
    """ utility function to remove sensitive information from request headers """
    _headers = dict(headers)
    _headers.pop('Cookie', None)
    _headers.pop('X-CSRF-Token', None)
    return _headers
