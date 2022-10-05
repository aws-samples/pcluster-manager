#!/bin/bash

docker run --rm=true -ti \
  -e AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION} \
  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
  -e API_BASE_URL=${API_BASE_URL} \
  -p 8080:80 \
  pcluster-manager

docker run --rm=true -ti \
  -e AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION} \
  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \
  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \
  -e API_BASE_URL=${API_BASE_URL} \
  -p 8080:80 \
  public.ecr.aws/pcm/pcluster-manager:latest
