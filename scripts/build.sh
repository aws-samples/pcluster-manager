#!/bin/bash

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
ECR_REPO=pcluster-manager
PUBLIC_REPO=public.ecr.aws/pcm

pushd frontend
docker build -t frontend /
popd
docker build -t ${ECR_REPO} .

docker tag ${ECR_REPO} ${ECR_ENDPOINT}/${ECR_REPO}:latest
docker push ${ECR_ENDPOINT}/${ECR_REPO}:latest

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${PUBLIC_REPO}
docker tag ${ECR_REPO}:latest ${PUBLIC_REPO}/${ECR_REPO}:latest
docker push ${PUBLIC_REPO}/${ECR_REPO}
