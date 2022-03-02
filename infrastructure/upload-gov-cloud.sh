#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ ! -d ${SCRIPT_DIR}/cognitolambda/node_modules ]; then
    pushd ${SCRIPT_DIR}/cognitolambda
    npm install
    popd
fi

REGIONS=(us-gov-west-1)

for REGION in "${REGIONS[@]}"
do
    AWS_DEFAULT_REGION=${REGION}
    BUCKET=pcluster-manager-${REGION}
    echo Uploading to: ${BUCKET}
    aws s3 cp --acl public-read ${SCRIPT_DIR}/SSMSessionProfile-cfn.yaml s3://${BUCKET}/SSMSessionProfile-cfn.yaml
    aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager-cognito.yaml s3://${BUCKET}/pcluster-manager-cognito.yaml
    aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager.yaml s3://${BUCKET}/pcluster-manager.yaml
done
