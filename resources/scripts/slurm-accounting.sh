#!/bin/bash

set -x
set -e

# Set variables from post-install args
secret_id=$1
rds_endpoint=$2
rds_port=$3

mkdir -p /tmp/slurm_accounting
pushd /tmp/slurm_accounting

cat <<EOF > sacct_attrs.json
{
  "slurm_accounting": {
  "secret_id": "${secret_id}",
  "rds_endpoint": "${rds_endpoint}",
  "rds_port": "${rds_port}"}
}
EOF

jq -s '.[0] * .[1]' /etc/chef/dna.json sacct_attrs.json > dna_combined.json

# Copy Slurm configuration files
source_path=https://raw.githubusercontent.com/aws-samples/pcluster-manager/post-install-scripts/resources/files
files=(slurm_sacct.conf.erb slurmdbd.service slurmdbd.conf.erb  slurm_accounting.rb)
for file in "${files[@]}"
do
    wget -qO- ${source_path}/sacct/${file} > ${file}
done

sudo echo cinc-client \
  --local-mode \
  --config /etc/chef/client.rb \
  --log_level auto \
  --force-formatter \
  --no-color \
  --chef-zero-port 8889 \
  -j dna_combined.json \
  -z slurm_accounting.rb
