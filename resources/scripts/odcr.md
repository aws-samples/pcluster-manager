#!/bin/bash
set -e

queue_name=${1}
compute_resource_name=${2}
capacity_reservation_group_name=${3}
account_id=$(curl -s http://169.254.169.254/latest/dynamic/instance-identity/document | awk -F'"' '/"accountId"/ { print $4 }')
region_id=$(curl http://169.254.169.254/latest/dynamic/instance-identity/document|grep region|awk -F\" '{print $4}')

# Override run_instance attributes
cat > /opt/slurm/etc/pcluster/run_instances_overrides.json << EOF
{
    "${queue_name}": {
        "${compute_resource_name}": {
            "CapacityReservationSpecification": {
                "CapacityReservationTarget": {
                    "CapacityReservationResourceGroupArn": "arn:aws:resource-groups:${region_id}:${account_id}:group/${capacity_reservation_group_name}"
                }
            }
        }
    }
}
EOF