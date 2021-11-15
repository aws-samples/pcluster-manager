#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ ! -d ${SCRIPT_DIR}/cognitolambda/node_modules ]; then
    pushd ${SCRIPT_DIR}/cognitolambda
    npm install
    popd
fi

REGIONS=(us-east-1 us-east-2 us-west-1 us-west-2 eu-west-1 eu-west-2 eu-central-1)
#REGIONS=(us-east-1)

for REGION in "${REGIONS[@]}"
do
    AWS_DEFAULT_REGION=${REGION}
    BUCKET=pcluster-manager-${REGION}
    echo Uploading to: ${BUCKET}
    sam package --s3-bucket ${BUCKET} \
                --template-file ${SCRIPT_DIR}/pcluster-manager-cognito.yaml \
                --output-template-file ${SCRIPT_DIR}/pcluster-manager-cognito-packaged.yaml
    aws s3 cp --acl public-read ${SCRIPT_DIR}/SSMSessionProfile-cfn.yaml s3://${BUCKET}/SSMSessionProfile-cfn.yaml
    aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager-cognito-packaged.yaml s3://${BUCKET}/pcluster-manager-cognito.yaml
    aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager.yaml s3://${BUCKET}/pcluster-manager.yaml
done
