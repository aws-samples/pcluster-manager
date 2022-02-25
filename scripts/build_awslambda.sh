#!/bin/bash
set -e

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
ECR_REPO=pcluster-manager-awslambda

USAGE="$(basename "$0") [-h] [--release] [--tag TAG]"
GIT_SHA=$(git rev-parse --short HEAD)
TAG=${GIT_SHA}

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    echo "$USAGE" >&2
    exit 1
    ;;
    --release)
    TAG=latest
    shift # past argument
    ;;
    --tag)
    TAG=latest
    TAG=$2
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    echo "$usage" >&2
    exit 1
    ;;
esac
done

pushd frontend
if [ ! -d node_modules ]; then
  npm install
fi
docker build --build-arg PUBLIC_URL=. -t frontend-awslambda .
popd
docker build -f Dockerfile.awslambda -t ${ECR_REPO} .

# These upload the container to the public repo
ECR_ENDPOINT="public.ecr.aws/n0x0o5k1"
ECR_IMAGE=${ECR_ENDPOINT}/${ECR_REPO}:${TAG}
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
docker tag ${ECR_REPO} ${ECR_IMAGE}
docker push ${ECR_IMAGE}
echo "Uploaded: " ${ECR_IMAGE}
