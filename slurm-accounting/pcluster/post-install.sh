#!/bin/bash

set -x
set -e

# Install MySQL
yum install -y mysql

# Set variables from post-install args
config_bucket=$1
secret_id=$2
rds_endpoint=$3
rds_port=$4

# Get Slurm database credentials
slurm_db_user=$(aws secretsmanager get-secret-value --secret-id ${secret_id} --region eu-west-1 | jq --raw-output '.SecretString' | jq -r .username)
slurm_db_password=$(aws secretsmanager get-secret-value --secret-id ${secret_id} --region eu-west-1 | jq --raw-output '.SecretString' | jq -r .password)

# Other variables needed for configuring Slurm
slurm_dbd_host=$(hostname)
slurm_etc=/opt/slurm/etc

# Copy Slurm configuration files
aws s3 cp --quiet ${config_bucket}/sacct/slurm_sacct.conf ${slurm_etc}/slurm_sacct.conf
aws s3 cp --quiet ${config_bucket}/sacct/slurmdbd.conf ${slurm_etc}/slurmdbd.conf

# Modify Slurm configuration files
sed -i "s|@SLURM_DBD_HOST@|${slurm_dbd_host}|g" ${slurm_etc}/slurm_sacct.conf
sed -i "s|@SLURM_DBD_USER@|${slurm_db_user}|g" ${slurm_etc}/slurm_sacct.conf
sed -i "s|@SLURM_DBD_HOST@|${slurm_dbd_host}|g" ${slurm_etc}/slurmdbd.conf
sed -i "s|@RDS_USER@|${slurm_db_user}|g" ${slurm_etc}/slurmdbd.conf
sed -i "s|@RDS_PASS@|${slurm_db_password}|g" ${slurm_etc}/slurmdbd.conf
sed -i "s|@RDS_ENDPOINT@|${rds_endpoint}|g" ${slurm_etc}/slurmdbd.conf
sed -i "s|@RDS_PORT@|${rds_port}|g" ${slurm_etc}/slurmdbd.conf

echo "include slurm_sacct.conf" >> ${slurm_etc}/slurm.conf
chmod 600 ${slurm_etc}/slurmdbd.conf
chown slurm:slurm ${slurm_etc}/slurmdbd.conf

# Restart Slurm daemons
/opt/slurm/sbin/slurmdbd
systemctl restart slurmctld
