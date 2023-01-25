#!/bin/bash
set -e

get_current_pcm_version() {
  npm --prefix ./frontend pkg get version | tr -d '"'
}

ECR_REPO=parallelcluster-ui
USAGE="$(basename "$0") [-h] [--release] [--tag TAG]"
GIT_SHA=$(git rev-parse --short HEAD)
TAG=${GIT_SHA}
RELEASE_SET=false

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
    RELEASE_SET=true
    shift # past argument
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

pushd frontend
if [ ! -d node_modules ]; then
  npm install
fi
docker build --build-arg PUBLIC_URL=/ -t frontend-awslambda .
popd
docker build -f Dockerfile.awslambda -t ${ECR_REPO} .

# These upload the container to the public repo
ECR_ENDPOINT="public.ecr.aws/pcm"
ECR_IMAGE=${ECR_ENDPOINT}/${ECR_REPO}:${TAG}
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${ECR_ENDPOINT}"
docker tag ${ECR_REPO} ${ECR_IMAGE}
docker push ${ECR_IMAGE}
echo "Uploaded: " ${ECR_IMAGE}

if [ "$RELEASE_SET" == "true" ]; then
    VERSION_TAG=`get_current_pcm_version`
    ECR_IMAGE_VERSION_TAGGED=${ECR_ENDPOINT}/${ECR_REPO}:${VERSION_TAG}

    docker tag ${ECR_REPO} ${ECR_IMAGE_VERSION_TAGGED}
    docker push ${ECR_IMAGE_VERSION_TAGGED}

    echo "Uploaded: " ${ECR_IMAGE_VERSION_TAGGED}
fi
