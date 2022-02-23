#!/bin/bash -e

#REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )
REGIONS=(us-east-1)
PREFIX=slurm-accounting

FILES=(accounting-cluster-template.yaml slurmdb-template.yaml vpc-template.yaml)

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ];
    then
        AWS_DEFAULT_REGION=${REGION}
        BUCKET=pcluster-manager-${REGION}
        echo Uploading to: ${BUCKET}
        for FILE in "${FILES[@]}"
        do
          aws s3 cp --acl public-read ${FILE} s3://${BUCKET}/slurm-accounting/${FILE}
        done
    fi
done
