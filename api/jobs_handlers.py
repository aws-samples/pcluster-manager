# Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
# with the License. A copy of the License is located at
#
# http://aws.amazon.com/apache2.0/
#
# or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
# limitations under the License.

from io import BytesIO
import json
import logging
import os
import uuid
import boto3
from botocore.exceptions import ClientError
from flask import request

BUCKET_NAME = os.getenv("S3_JOB_DEFINITIONS_BUCKET", 'pcm-job-definitions-poc')

def compute_file_name():
  id = uuid.uuid4()
  return f"job_definition_{id}"

def jobs_handler():
  if request.method == 'GET':
    s3_client = boto3.client('s3')
    try:
      objects = s3_client.list_objects_v2(Bucket=BUCKET_NAME).get("Contents")
      return json.dumps(list(objects), default=str)
    except ClientError as e:
      logging.error(e)
      return e

  if request.method == 'POST':
    s3_resource = boto3.resource('s3')
    object_name = compute_file_name()
    content = bytes(request.get_data(as_text=True).encode('utf-8'))
    try:
      s3_resource.Object(BUCKET_NAME, object_name).put(Body=content)
      return {"message": "Ok"}, 200
    except ClientError as e:
      logging.error(e)
      return e

def jobs_by_id_handler(job_id):
  if request.method == 'GET':
    s3_resource = boto3.resource('s3')
    try:
      object = s3_resource.Object(BUCKET_NAME, job_id)
      json_content = json.loads(object.get()['Body'].read())
      return json_content
    except ClientError as e:
      logging.error(e)
      return e

  if request.method == 'PUT':
    s3_resource = boto3.resource('s3')
    content = bytes(request.get_data(as_text=True).encode('utf-8'))
    try:
      s3_resource.Object(BUCKET_NAME, job_id).put(Body=content)
      return {"message": "Ok"}, 200
    except ClientError as e:
      logging.error(e)
      return e

  if request.method == 'DELETE':
    s3_resource = boto3.resource('s3')
    try:
      s3_resource.Object(BUCKET_NAME, job_id).delete()
      return {"message": "Ok"}, 200
    except ClientError as e:
      logging.error(e)
      return e
  

