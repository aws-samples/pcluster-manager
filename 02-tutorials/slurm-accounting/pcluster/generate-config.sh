#!/bin/bash

# Generate ParalleCluster configuration file
while [[ ""$#"" -gt 0 ]]; do
    case $1 in
        --region) aws_region="$2"; shift ;;
        --stack-name) stack_name="$2"; shift ;;
        --config-bucket) config_bucket="$2"; shift ;;
        --aws-key) key_name="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Query CloudFormation stack and other resources to get IDs
public_subnet_id=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Outputs[?OutputKey=='PClusterPublicSubnetId'].OutputValue" --output text)
private_subnet_id=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Outputs[?OutputKey=='PClusterPrivateSubnetId'].OutputValue" --output text)
secret_id=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Outputs[?OutputKey=='SlurmDbPasswordSecretArn'].OutputValue" --output text)
slurm_db_sg=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Outputs[?OutputKey=='SlurmDbSecurityGroupId'].OutputValue" --output text)
rds_port=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Parameters[?ParameterKey=='SlurmDbPort'].ParameterValue" --output text)
rds_endpoint=$(aws cloudformation describe-stacks --region ${aws_region} --stack-name ${stack_name} --query "Stacks[0].Outputs[?OutputKey=='SlurmDbEndpoint'].OutputValue" --output text)

cp cluster-config.yaml.template cluster-config.yaml
gsed -i "s|@AWS_REGION@|${aws_region}|g" cluster-config.yaml
gsed -i "s|@KEY_NAME@|${key_name}|g" cluster-config.yaml
gsed -i "s|@PUBLIC_SUBNET_ID@|${public_subnet_id}|g" cluster-config.yaml
gsed -i "s|@PRIVATE_SUBNET_ID@|${public_subnet_id}|g" cluster-config.yaml
gsed -i "s|@SLURM_DB_SG@|${slurm_db_sg}|g" cluster-config.yaml
gsed -i "s|@CONFIG_BUCKET@|${config_bucket}|g" cluster-config.yaml
gsed -i "s|@RDS_ENDPOINT@|${rds_endpoint}|g" cluster-config.yaml
gsed -i "s|@RDS_PORT@|${rds_port}|g" cluster-config.yaml
gsed -i "s|@SECRET_ID@|${secret_id}|g" cluster-config.yaml
