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

declare -A REGULAR_OPT_IN_REGIONS_BUCKET_DICT=(
["us-east-2"]="stackset-parallelcluster-pclustermanagertemplates-wry2lebzog5n"
["us-east-1"]="stackset-parallelcluster-pclustermanagertemplates-184q2amn23kgk"
["eu-west-1"]="stackset-parallelcluster-pclustermanagertemplates-1e8t6xfqkjcqf"
["eu-central-1"]="stackset-parallelcluster-pclustermanagertemplates-mhievvad5pyj"
["us-west-2"]="stackset-parallelcluster-pclustermanagertemplates-1mtc8edjqf3kt"
["us-west-1"]="stackset-parallelcluster-pclustermanagertemplates-nxum99q7mscc"
["eu-west-2"]="stackset-parallelcluster-pclustermanagertemplates-b33tcdyl1zes"
["eu-west-3"]="stackset-parallelcluster-pclustermanagertemplates-qj8wr9vjc5fk"
["eu-north-1"]="stackset-parallelcluster-pclustermanagertemplates-1xfeh0bp8hzak"
["eu-south-1"]="stackset-parallelcluster-pclustermanagertemplates-1pmbt5rgp10d2"
["me-south-1"]="stackset-parallelcluster-pclustermanagertemplates-1qlsq3y8w5hk"
["sa-east-1"]="stackset-parallelcluster-pclustermanagertemplates-fsd3fzd27a9p"
["ca-central-1"]="stackset-parallelcluster-pclustermanagertemplates-x2c24hqfpub1"
["ap-east-1"]="stackset-parallelcluster-pclustermanagertemplates-1dk8h9dnehylk"
["ap-northeast-1"]="stackset-parallelcluster-pclustermanagertemplates-1c5bqsmb5fpnp"
["ap-northeast-2"]="stackset-parallelcluster-pclustermanagertemplates-1f1q2gi9dwjvw"
["ap-northeast-3"]="stackset-parallelcluster-pclustermanagertemplates-c322izxiwlbg"
["ap-south-1"]="stackset-parallelcluster-pclustermanagertemplates-15xd0q7l3emut"
["ap-southeast-1"]="stackset-parallelcluster-pclustermanagertemplates-1cwlz9a66fipf"
["ap-southeast-2"]="stackset-parallelcluster-pclustermanagertemplates-e77oyhgfmldx"
["ap-southeast-3"]="stackset-parallelcluster-pclustermanagertemplates-w3wk8md6m9vg"
["af-south-1"]="stackset-parallelcluster-pclustermanagertemplates-13udprfh77tpp"
)
