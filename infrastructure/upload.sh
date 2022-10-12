#!/bin/bash
set -e
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

SCRIPT_DIR=$1

source ${SCRIPT_DIR}/common.sh
source ${SCRIPT_DIR}/bucket_configuration.sh
trap 'error' ERR


if [ -z "$SCRIPT_DIR" ];
then
  echo "SCRIPT_DIR=$SCRIPT_DIR must be initialized and not empty"
  exit 1;
fi

FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)

for INDEX in "${!BUCKETS[@]}"
do
  echo Uploading to: "${BUCKETS[INDEX]}"
  #FIXME For other partitions we should also parametrize the partition in the URL
  TEMPLATE_URL="https:\/\/${BUCKETS[INDEX]}\.s3\.${REGIONS[INDEX]}\.amazonaws\.com"
  sed -i "s/PLACEHOLDER/${TEMPLATE_URL}/g" "${SCRIPT_DIR}/pcluster-manager.yaml"
  for FILE in "${FILES[@]}"
  do
      aws --region "${REGIONS[INDEX]}" s3 cp --acl public-read "${SCRIPT_DIR}/${FILE}" "s3://${BUCKETS[INDEX]}/${FILE}"
  done
done

