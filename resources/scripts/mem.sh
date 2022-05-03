#!/bin/bash
# Source:
#   https://gist.github.com/bollig/56c277501505f5eaa5d185b86c2999b9
# Usage:
# ```
#    sh mem.sh
# ```
# You'll need to include the following IAM permissions in your cluster's config:
# ```
# Iam:
#   AdditionalIamPolicies:
#       - Policy: arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess
# ```

source /opt/parallelcluster/cfnconfig

FILELIST=$(ls /opt/slurm/etc/pcluster/slurm_parallelcluster*_partition.conf)

for PARTFILE in $FILELIST; do
        echo "Writiting to /tmp/$(basename $PARTFILE)"
        while IFS= read -r line; do
            if [[ $line == NodeName* ]]; then
                    # NodeName=spot-dy-c52xlarge-[1-16] CPUs=4 State=CLOUD Feature=dynamic,c5.2xlarge,sp-small
                    instance_type=$(echo "$line" | awk '{print $4}' | cut -f 2 -d',' )

                    memory=$(AWS_DEFAULT_REGION=$cfn_region aws ec2 describe-instance-types --instance-type $instance_type --query "InstanceTypes[*].MemoryInfo[]" --output text)
                    RealMemory=$(python -c 'import sys; print(int(0.85 * int(sys.argv[1])))' $memory)
                    (echo "$line" | grep -q "RealMemory" && echo "$line" | sed "s/RealMemory=\(.*\)$/RealMemory=${RealMemory}/" ) || echo "$line RealMemory=${RealMemory}" 
            else
                    echo "$line"
            fi
        done < $PARTFILE > /tmp/$(basename $PARTFILE)
done

# copy revised partition files to slurm conf
cp /tmp/slurm_parallelcluster_*partition.conf /opt/slurm/etc/pcluster/.

# restart slurm for changes to take effect
systemctl restart slurmctld
