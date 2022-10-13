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

REGULAR_BUCKET=pcm-release-us-east-1
ALTERNATIVE_BUCKET=pcm-release-eu-west-1
REGULAR_REGION_FOR_TEMPLATES="us-east-1"
ALTERNATIVE_REGION_FOR_TEMPLATES="eu-west-1"

BUCKETS=("$REGULAR_BUCKET" "$ALTERNATIVE_BUCKET")
REGIONS=("$REGULAR_REGION_FOR_TEMPLATES" "$ALTERNATIVE_REGION_FOR_TEMPLATES")