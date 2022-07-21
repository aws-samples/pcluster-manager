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

error(){
 echo "An error has occurred while downloading files."
}

trap 'error' ERR

DEST=$1

if [ "$DEST" == "" ]; then
  echo "You must specify a destination directory."
  exit 1
fi
shift

mkdir -p ${DEST}
pushd ${DEST}

if [[ $# -eq 0 ]]; then
  echo "You must specify at least one file to download."
  exit 1
fi


while [[ $# -gt 0 ]]
do
  SOURCE="$1"
  echo "Downloading ${SOURCE} to ${DEST}"

  if [[ ${SOURCE,,} =~ s3:// ]]; then
    aws s3 cp $SOURCE .
  elif [[ ${SOURCE,,} =~ http://  || ${SOURCE,,} =~ https://  ]]; then
    wget -q ${SOURCE}
  else
    echo "Unknown source argument, must start with s3:// or http[s]://"
    exit 1
  fi
  shift
done
