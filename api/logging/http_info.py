import json

from flask import Request, Response

def log_request_body_and_headers(_logger, request: Request):
    details = __get_http_info(request)
    if request.args:
        details['params'] = request.args
    _logger.info(f'Request info: {json.dumps(details)}')


def log_response_body_and_headers(_logger, response: Response):
    details = __get_http_info(response)
    _logger.info(f'Response info: {json.dumps(details)}')


def __get_http_info(r: Request | Response) -> dict:
    headers = __filter_headers(r.headers)
    details = {'headers': headers}

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
