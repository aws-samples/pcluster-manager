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

# This script is just an internal utility script to change all the 1-click links when the bucket changes

source common.sh
trap 'error' ERR

REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ] && [ "$REGION" != "me-central-1" ];
    then
      #FIXME For other partitions we should also parametrize the partition in the URL
      while IFS= read -r -d '' file
      do
        if [[ "$file" != *"node_modules"* ]]; then
          # The commented one is for regions not yet on the new name (gov-cloud for example)
          #sed -i.bak -E "s/templateURL=.*${REGION}\.s3\.${REGION}\.amazonaws\.com\/(.*)yaml(.*)templateURL=.*${REGION}\.s3\.${REGION}\.amazonaws\.com\/(.*)yaml/templateURL=https:\/\/${REGULAR_BUCKET}\.s3\.${REGULAR_REGION_FOR_TEMPLATES}\.amazonaws\.com\/\1yaml\2templateURL=https:\/\/${ALTERNATIVE_BUCKET}\.s3\.${ALTERNATIVE_REGION_FOR_TEMPLATES}\.amazonaws\.com\/\3yaml/" "${file}" && rm "${file}.bak"
          sed -i.bak -E "s/templateURL=.*${REGULAR_BUCKET}\.s3\.${REGION}\.amazonaws\.com\/(.*)yaml(.*)templateURL=.*${REGULAR_BUCKET}\.s3\.${REGION}\.amazonaws\.com\/(.*)yaml/templateURL=https:\/\/${REGULAR_BUCKET}\.s3\.${REGULAR_REGION_FOR_TEMPLATES}\.amazonaws\.com\/\1yaml\2templateURL=https:\/\/${ALTERNATIVE_BUCKET}\.s3\.${ALTERNATIVE_REGION_FOR_TEMPLATES}\.amazonaws\.com\/\3yaml/" "${file}" && rm "${file}.bak"
        fi
      done <   <(find "$SCRIPT_DIR/.." -name "*.md" -type f -print0)
    fi
done




