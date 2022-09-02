#!/bin/bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
# with the License. A copy of the License is located at
#
# http://aws.amazon.com/apache2.0/
#
# or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
# limitations under the License.

source common.sh
trap 'error' ERR

BUCKET=$1
REGION=$2
SCRIPT_DIR=$3

if [ -z "$BUCKET" ] || [ -z "$REGION" ] || [ -z "$SCRIPT_DIR" ];
then
  echo "BUCKET=$BUCKET, REGION=$REGION and SCRIPT_DIR=$SCRIPT_DIR must be initialized and not empty"
  exit 1;
fi

#FIXME For China and ISO partitions we should also parametrize the partition in the URL
TEMPLATE_URL="https:\/\/${BUCKET}\.s3\.amazonaws\.com"

FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)

echo Uploading to: "${BUCKET}"
sed -i.bak "s/PLACEHOLDER/${TEMPLATE_URL}/g" "${SCRIPT_DIR}/pcluster-manager.yaml" && rm pcluster-manager.yaml.bak
for FILE in "${FILES[@]}"
do
  aws --region "${REGION}" s3 cp --acl public-read "${SCRIPT_DIR}/${FILE}" "s3://${BUCKET}/${FILE}"
done
sed -i.bak "s/${TEMPLATE_URL}/PLACEHOLDER/g" pcluster-manager.yaml && rm pcluster-manager.yaml.bak

