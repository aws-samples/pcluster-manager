#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )
#REGIONS=(us-east-1)

FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ];
    then
        AWS_DEFAULT_REGION=${REGION}
        BUCKET=pcluster-manager-${REGION}
        echo Uploading to: ${BUCKET}
        for FILE in "${FILES[@]}"
        do
          aws s3 cp --acl public-read ${SCRIPT_DIR}/${FILE} s3://${BUCKET}/${FILE}
        done
    fi
done
