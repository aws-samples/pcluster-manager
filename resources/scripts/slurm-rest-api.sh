#!/bin/bash

set -x
set -e

mkdir -p /tmp/slurm_rest_api
pushd /tmp/slurm_rest_api

# Copy Slurm configuration files
source_path=https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/files
files=(slurmrestd.service slurm_rest_api.rb nginx.conf)
for file in "${files[@]}"
do
    wget -qO- ${source_path}/sacct/${file} > ${file}
done

sudo cinc-client \
  --local-mode \
  --config /etc/chef/client.rb \
  --log_level auto \
  --force-formatter \
  --no-color \
  --chef-zero-port 8889 \
  -j /etc/chef/dna.json \
  -z slurm_rest_api.rb

set +e
