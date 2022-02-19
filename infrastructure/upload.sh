#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )
#REGIONS=(us-east-1)

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ];
    then
        AWS_DEFAULT_REGION=${REGION}
        BUCKET=pcluster-manager-${REGION}
        echo Uploading to: ${BUCKET}
        aws s3 cp --acl public-read ${SCRIPT_DIR}/SSMSessionProfile-cfn.yaml s3://${BUCKET}/SSMSessionProfile-cfn.yaml
        aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager-cognito.yaml s3://${BUCKET}/pcluster-manager-cognito.yaml
        aws s3 cp --acl public-read ${SCRIPT_DIR}/pcluster-manager.yaml s3://${BUCKET}/pcluster-manager.yaml
    fi
done
