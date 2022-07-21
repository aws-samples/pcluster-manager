#!/bin/bash -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )
# REGIONS=(eu-west-1)

FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ];
    then
        BUCKET=pcluster-manager-${REGION}
        echo Uploading to: ${BUCKET}
        for FILE in "${FILES[@]}"
        do
          aws --region ${REGION} s3 cp --acl public-read ${SCRIPT_DIR}/${FILE} s3://${BUCKET}/${FILE}
        done
    fi
done
