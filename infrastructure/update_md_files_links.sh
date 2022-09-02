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
while IFS= read -r -d '' file
do
  if [[ "$file" != *"node_modules"* ]]; then
    # The commented one is for regions not yet converted to the anti-squatting name (gov-cloud for example)
    #sed -i.bak -E "s/templateURL=.*${REGION}\.s3\.amazonaws\.com\/(.*)yaml/templateURL=https:\/\/${BUCKET}\.s3\.amazonaws\.com\/\1yaml/" "${file}" && rm "${file}.bak"
    sed -i.bak -E "s/templateURL=.*${BUCKET}\.s3\.amazonaws\.com\/(.*)yaml/templateURL=https:\/\/${BUCKET}\.s3\.amazonaws\.com\/\1yaml/" "${file}" && rm "${file}.bak"
  fi
done <   <(find "$SCRIPT_DIR/.." -name "*.md" -type f -print0)

