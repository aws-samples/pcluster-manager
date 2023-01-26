#!/bin/bash
set -e

USAGE="$(basename "$0") [-h] [--tag YYYY.MM (defaults to current year and month)] [--revision REVISION]"

get_default_pcui_version() {
  date +%Y.%m
}

print_usage() {
  echo "$USAGE" 1>&2
}

ECR_REPO=parallelcluster-ui


while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -h)
    print_usage
    exit 1
    ;;
    --tag)
    TAG=$2
    shift
    shift
    ;;
    --revision)
    REVISION=$2
    shift
    shift
    ;;
    *)
    print_usage
    exit 1
    ;;
esac
done

ECR_ENDPOINT="public.ecr.aws/pcm"

if [ -z $TAG ]; then
  TAG=`get_default_pcui_version`
  echo "Using default versioning strategy, tag: $TAG" 1>&2
elif ! [[ $TAG =~ [0-9]{4}\.(0[1-9]|1[0-2]) ]]; then
  echo '`--tag` parameter must be a valid year and month combo of the following format `YYYY.MM`, exiting' 1>&2
  exit 1
fi

if ! [ -z $REVISION ]; then
  TAG="${TAG}.${REVISION}"
  echo "Using provided revision, tag: $TAG" 1>&2
fi

aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"

pushd frontend
if [ ! -d node_modules ]; then
  npm install
fi
docker build --build-arg PUBLIC_URL=/ -t frontend-awslambda .
popd
docker build -f Dockerfile.awslambda -t ${ECR_REPO} .

ECR_IMAGE_VERSION_TAGGED=${ECR_ENDPOINT}/${ECR_REPO}:${TAG}
ECR_IMAGE_LATEST_TAGGED=${ECR_ENDPOINT}/${ECR_REPO}:latest

docker tag ${ECR_REPO} ${ECR_IMAGE_VERSION_TAGGED}
docker push ${ECR_IMAGE_VERSION_TAGGED}

docker tag ${ECR_REPO} ${ECR_IMAGE_LATEST_TAGGED}
docker push ${ECR_IMAGE_LATEST_TAGGED}

echo "Uploaded: ${ECR_IMAGE_VERSION_TAGGED}, ${ECR_IMAGE_LATEST_TAGGED}"