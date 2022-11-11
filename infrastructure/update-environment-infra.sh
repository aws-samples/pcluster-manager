#!/bin/bash -e
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

# This script is used to update the infrastructure of a given PCM environment.
# An environment is composed of a list of variables with the entrypoints of the environment
# and a CloudFormation request file where the stack update can be customized,
# for example by changing the parameters provided to the previous version of the stack
#
# Usage: ./infrastructure/update-environment-infra.sh [ENVIRONMENT]
# Example: ./infrastructure/update-environment-infra.sh demo

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)
ENVIRONMENT=$1
. ${SCRIPT_DIR}/environments/${ENVIRONMENT}-variables.sh

# The yaml files describing the infrastructure are uploaded to a private S3 bucket
# and then used to update the CloudFormation stack, where the same bucket is passed as parameters.
# This is done to make sure that we deploy all the changes to the infrastructure, and not only the changes
# made to pcluster-manager.yaml (the parent stack)
echo Uploading to: ${BUCKET}
for FILE in "${FILES[@]}"
do
  aws s3 cp ${SCRIPT_DIR}/${FILE} s3://${BUCKET}/${FILE}
done

# Launches a new CFN update: the script hangs until the stack is updated
AWS_PAGER="cat" aws cloudformation update-stack --cli-input-yaml file://${SCRIPT_DIR}/environments/${ENVIRONMENT}-cfn.yaml --stack-name ${STACK_NAME} --region ${REGION}
aws cloudformation wait stack-update-complete --stack-name ${STACK_NAME} --region ${REGION}
