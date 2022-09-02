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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

source "${SCRIPT_DIR}/region_bucket_dictionary.sh"

REGIONS=( $(aws ec2 describe-regions --query "Regions[*].RegionName" --output text) )

for REGION in "${REGIONS[@]}"
do
    if [ "$REGION" != "ap-southeast-3" ] && [ "$REGION" != "me-central-1" ];
    then
      BUCKET=${REGULAR_OPT_IN_REGIONS_BUCKET_DICT["${REGION}"]}
      echo "Uploading the templates in region ${REGION}"
      "${SCRIPT_DIR}"/upload.sh "$BUCKET" "$REGION" "$SCRIPT_DIR"
      # The steps below is not needed until the URL for the 1-clicks does not change
      # and in that case the sed in the script should be adapted based on the changes
      # echo "Updating documentation for region ${REGION}"
      # "${SCRIPT_DIR}"/update_md_files_links.sh "$BUCKET" "$REGION" "$SCRIPT_DIR"
      if [ "$REGION" == "us-east-1" ];
      then
        echo "Uploading accounting template"
        "${SCRIPT_DIR}"/slurm-accounting/upload.sh "$BUCKET" "$REGION" "$SCRIPT_DIR"
      fi
    fi
done
