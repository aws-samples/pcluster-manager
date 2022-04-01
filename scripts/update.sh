#!/bin/bash -e

REGION=$(python -c 'import boto3; print(boto3.Session().region_name)')
REGION_SET=false
LOCAL=false
TAG=latest

USAGE="$(basename "$0") [-h] [--region REGION] [--tag TAG]"

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    echo "$USAGE" >&2
    exit 1
    ;;
    --region)
    REGION=$2
    REGION_SET=true
    shift # past argument
    shift # past value
    ;;
    --tag)
    TAG=$2
    shift # past argument
    shift # past value
    ;;
    --tag)
    LOCAL=true
    shift # past argument
    ;;
    *)    # unknown option
    echo "$usage" >&2
    exit 1
    ;;
esac
done

if [ "$REGION_SET" == "false" ]; then
    echo "Warning: Using default region $REGION from your environment. Please ensure this is where pcluster manager is deployed.";
fi

LAMBDA_ARN=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'PclusterManagerFunction')] | [0].FunctionArn" | xargs echo)
ECR_REPO=pcluster-manager-awslambda

PUBLIC_ECR_ENDPOINT="public.ecr.aws/n0x0o5k1"
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
PRIVATE_ECR_REPO=$(aws ecr describe-repositories --query "repositories[?contains(repositoryName, 'pcluster-manager')] | [0].repositoryName" --output text)
IMAGE=${ECR_ENDPOINT}/${PRIVATE_ECR_REPO}:latest

if [ "$LOCAL" == "true" ]; then
else
    echo "Logging in to docker..."
    AWS_SESSION_TOKEN= AWS_ACCESS_KEY_ID= AWS_SECRET_ACCESS_KEY= aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${PUBLIC_ECR_ENDPOINT}"
    docker pull ${PUBLIC_ECR_ENDPOINT}/${ECR_REPO}:${TAG}
    docker tag ${PUBLIC_ECR_ENDPOINT}/${ECR_REPO}:${TAG} ${IMAGE}
fi

echo "Logging in to private repo..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
echo "Pushing private docker container..."
docker push ${IMAGE}
echo "Updating lambda..."
aws lambda update-function-code --function-name ${LAMBDA_ARN} --image-uri ${IMAGE} --publish
