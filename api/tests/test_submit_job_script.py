import json
from unittest import mock
from requests import Response
from api.PclusterApiHandler import post_job_slurm_api, translate_job


@mock.patch("api.PclusterApiHandler.requests.post")
def test_post_to_slurm_api_with_correct_request(mock_post):
    """
    Given a function that posts jobs to the Slurm API
      When a job body, user, token, and ip are inputted
        It should call request.post with the correct url, data, and headers
    """
    post_job_slurm_api(
        {'job-name': 'test'},
        'test-user', 'slurm-token123', '123.456.7.8'
    )

    mock_post.assert_called_once_with(
        url='https://123.456.7.8/slurm/v0.0.36/job/submit', 
        data=json.dumps({
            "job": {
                "environment": {
                    "PATH": "/bin:/usr/bin/:/usr/local/bin/:/opt/slurm/bin/"
                },
                "name": "test", 
                "current_working_directory": "/home/test-user"
            }
         }),
        headers={
            'Content-Type': 'application/json', 
            'X-SLURM-USER-NAME': 'test-user', 
            'X-SLURM-USER-TOKEN': 'slurm-token123'
        }, 
        verify=False
    )


@mock.patch("api.PclusterApiHandler.requests.post")
def test_post_to_slurm_api_returns_errors(mock_post):
    """
    Given a function that posts jobs to the Slurm API
      When the response contains errors
        It should return the error messages separated by new lines
    """
    resp = Response()
    resp.status_code = 400
    resp.reason = 'BAD REQUEST'
    resp._content = b'{"errors": [ \
        {"error": "test", "error_code": -1}, \
        {"error": "testing", "error_code": 9001}]}'

    mock_post.return_value = resp

    ret = post_job_slurm_api(
        {'job-name': 'test'}, 
        'test-user', 'slurm-token123', '123.456.7.8'
    )

    assert ret.get('errors') == 'test\ntesting'
    assert ret.get('status_code') == 400
    assert ret.get('reason') == 'BAD REQUEST'


def test_translate_job():
    """
    Given a function that translates a job
      When a dict of job data is inputted
        It should format the job to be accepted by the Slurm API
    """
    request_body = {'job-name': 'test', 'nodes': 1, 'command': 'test command'}

    translation = translate_job(request_body, 'test-user')

    assert translation == {
        "job": {
            "name": "test", 
            "current_working_directory": "/home/test-user",
            "nodes": 1,
            "environment": {
                    "PATH": "/bin:/usr/bin/:/usr/local/bin/:/opt/slurm/bin/"
                }
            },
        "script": 'test command'
     } 
