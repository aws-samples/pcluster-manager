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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ ! -d ${SCRIPT_DIR}/cognitolambda/node_modules ]; then
    pushd ${SCRIPT_DIR}/cognitolambda
    npm install
    popd
fi

REGIONS=(us-gov-west-1)
FILES=(SSMSessionProfile-cfn.yaml pcluster-manager-cognito.yaml pcluster-manager.yaml)

for REGION in "${REGIONS[@]}"
do
    BUCKET=pcluster-manager-${REGION}
    echo Uploading to: ${BUCKET}
    for FILE in "${FILES[@]}"
    do
      aws --region ${REGION} s3 cp --acl public-read ${SCRIPT_DIR}/${FILE} s3://${BUCKET}/${FILE}
    done
done
