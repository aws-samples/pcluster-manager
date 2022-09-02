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
ACCOUNTING_SCRIPT_DIR="$3/slurm-accounting"

if [ -z "$BUCKET" ] || [ -z "$REGION" ] || [ -z "$ACCOUNTING_SCRIPT_DIR" ];
then
  echo "BUCKET=$BUCKET, REGION=$REGION and ACCOUNTING_SCRIPT_DIR=$ACCOUNTING_SCRIPT_DIR must be initialized and not empty"
  exit 1;
fi

FILES=(accounting-cluster-template.yaml)

echo Uploading to: "${BUCKET}"
for FILE in "${FILES[@]}"
do
  aws --region "${REGION}" s3 cp --acl public-read "${ACCOUNTING_SCRIPT_DIR}/${FILE}" "s3://${BUCKET}/slurm-accounting/${FILE}"
done
