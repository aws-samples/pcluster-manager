#!/bin/bash -e
# Copyright 2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
# with the License. A copy of the License is located at http://aws.amazon.com/apache2.0/
# or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
# OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
# limitations under the License.

random-string()
{
#    cat /dev/urandom | tr -d -c 'a-zA-Z0-9' | fold -w ${1:-32} | head -n 1
    uuidgen | sed 's/-//g' | fold -w ${1:-32} | head -n 1
}

STACK_NAME=$(echo "PclusterManager"-`random-string 7`)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# deploy just the cognito portion of the stack
cognito_infrastructure_file=${SCRIPT_DIR}/pcluster-manager-cognito.yaml
echo "Deploying: " ${cognito_infrastructure_file} "->" ${STACK_NAME}

#aws cloudformation create-stack \
#    --stack-name ${STACK_NAME} \
#    --parameters ParameterKey=AdminUserEmail,ParameterValue=cgruenwa@amazon.com \
#    --disable-rollback \
#    --template-body file:///${cognito_infrastructure_file} \
#    --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
#
#
#exit 0
#
# deploy the full stack
infrastructure_file=${SCRIPT_DIR}/pcluster-manager.yaml
echo "Deploying: " ${infrastructure_file} "->" ${STACK_NAME}
#
#aws cloudformation deploy \
#    --stack-name ${STACK_NAME} \
#    --parameter-overrides AdminUserEmail=user@amazon.com \
#    --template-file ${infrastructure_file} \
#    --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
#
aws cloudformation create-stack \
    --stack-name ${STACK_NAME} \
    --parameters ParameterKey=AdminUserEmail,ParameterValue=user@amazon.com \
    --template-body file:///${infrastructure_file} \
    --disable-rollback \
    --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND
