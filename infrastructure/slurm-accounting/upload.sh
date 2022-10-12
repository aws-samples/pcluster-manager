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

source $1/common.sh
source $1/bucket_configuration.sh
trap 'error' ERR

ACCOUNTING_SCRIPT_DIR="$1/slurm-accounting"

if [ ! -d "$ACCOUNTING_SCRIPT_DIR" ] || [ ! -r "$ACCOUNTING_SCRIPT_DIR" ];
then
  echo "ACCOUNTING_SCRIPT_DIR=$ACCOUNTING_SCRIPT_DIR must be a readable directory"
  exit 1;
fi

FILES=(accounting-cluster-template.yaml)

for INDEX in "${!BUCKETS[@]}"
do
  echo Uploading to: "${BUCKETS[INDEX]}"
  for FILE in "${FILES[@]}"
  do
    aws --region "${REGIONS[INDEX]}" s3 cp --acl public-read "${ACCOUNTING_SCRIPT_DIR}/${FILE}" "s3://${BUCKETS[INDEX]}/slurm-accounting/${FILE}"
  done
done
