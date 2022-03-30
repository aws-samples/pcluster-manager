#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ ! -d ${SCRIPT_DIR}/cognitolambda/node_modules ]; then
    pushd ${SCRIPT_DIR}/cognitolambda
    npm install
    popd
fi

REGIONS=(us-gov-west-1)
FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml parallelcluster-api.yaml)

for REGION in "${REGIONS[@]}"
do
    AWS_DEFAULT_REGION=${REGION}
    BUCKET=pcluster-manager-${REGION}
    echo Uploading to: ${BUCKET}
    for FILE in "${FILES[@]}"
    do
      aws s3 cp --acl public-read ${SCRIPT_DIR}/${FILE} s3://${BUCKET}/${FILE}
    done
done
