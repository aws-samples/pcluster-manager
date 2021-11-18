#!/bin/bash -e

if [ -z "$1" ]; then
    REGION=$(python -c 'import boto3; print(boto3.Session().region_name)')
    echo "Warning: Using default region $REGION from your environment. Please ensure this is where pcluster manager is deployed.";
else
    REGION=$1
fi
LAMBDA_ARN=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'PclusterManagerFunction')] | [0].FunctionArn" --output text)
ECR_REPO=pcluster-manager-awslambda

PUBLIC_ECR_ENDPOINT="public.ecr.aws/n0x0o5k1"
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
PRIVATE_ECR_REPO=$(aws ecr describe-repositories --query "repositories[?contains(repositoryName, 'pcluster-manager')] | [0].repositoryName" --output text)
IMAGE=${ECR_ENDPOINT}/${PRIVATE_ECR_REPO}:latest
echo "Logging in to docker..."
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${PUBLIC_ECR_ENDPOINT}"
echo "Getting public version of Pcluster Manager docker container..."
docker pull ${PUBLIC_ECR_ENDPOINT}/${ECR_REPO}
docker tag ${PUBLIC_ECR_ENDPOINT}/${ECR_REPO} ${IMAGE}
echo "Logging in to private repo..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
echo "Pushing private docker container..."
docker push ${IMAGE}
echo "Updating lambda..."
aws lambda update-function-code --function-name ${LAMBDA_ARN} --image-uri ${IMAGE} --publish
