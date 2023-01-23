#!/bin/bash -e

TAG=latest

USAGE="$(basename "$0") [-h] [--stack-name STACKNAME] [--region REGION] [--tag TAG]"

while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    echo "$USAGE" >&2
    exit 1
    ;;
    --stack-name)
    STACKNAME="$2"
    shift # past argument
    shift # past value
    ;;
    --region)
    REGION=$2
    shift # past argument
    shift # past value
    ;;
    --tag)
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

if [ -z $REGION ]; then
    echo "Error: no region was specified, please provide one using --region REGION, exiting."
    exit 1
fi

if [ -z $STACKNAME ]; then
    echo "Error: no stack name parameter defined, exiting."
    exit 1
fi


function resource_id_from_cf_output {
  echo "$1" | grep "$2" | cut -d " " -f 2
}

CF_QUERY="StackResources[?LogicalResourceId == 'PrivateEcrRepository' || LogicalResourceId == 'ParallelClusterUIFunction'].{ LogicalResourceId: LogicalResourceId, PhysicalResourceId: PhysicalResourceId }"
CF_OUTPUT=`aws cloudformation describe-stack-resources --stack-name "$STACKNAME" --region "$REGION" --query "$CF_QUERY" --output text | tr '\t' ' '`

LAMBDA_NAME="$(resource_id_from_cf_output "$CF_OUTPUT" "ParallelClusterUIFunction")"
LAMBDA_ARN=$(aws lambda --region ${REGION} list-functions --query "Functions[?contains(FunctionName, '$LAMBDA_NAME')] | [0].FunctionArn" | xargs echo)

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
ECR_ENDPOINT="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
PRIVATE_ECR_REPO="$(resource_id_from_cf_output "$CF_OUTPUT" "PrivateEcrRepository")"
IMAGE=${ECR_ENDPOINT}/${PRIVATE_ECR_REPO}:latest

pushd frontend
if [ ! -d node_modules ]; then
  npm install
fi
docker build --build-arg PUBLIC_URL=/ -t frontend-awslambda .
popd
docker build -f Dockerfile.awslambda -t ${IMAGE} .

echo "Logging in to private repo..."
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
echo "Pushing private docker container..."
docker push ${IMAGE}
echo "Updating lambda..."
aws lambda --region ${REGION} update-function-code --function-name ${LAMBDA_ARN} --image-uri ${IMAGE} --publish >/dev/null
