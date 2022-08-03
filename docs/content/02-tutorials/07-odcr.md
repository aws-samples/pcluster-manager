+++
title = "d. On-Demand Capacity Reservation 🤖"
weight = 28
+++

On-Demand Capacity Reservations (ODCR's) are used to reserve capacity, this is particularly useful for instances with constrained capacity such as `p4dn.24xlarge`. This tutorial assumes you're familiar with the [steps here](https://docs.aws.amazon.com/parallelcluster/latest/ug/launch-instances-odcr-v3.html).

## Setup

To setup a ODCR with AWS ParallelCluster, we'll use the managed post-install script. This creates a file `/opt/slurm/etc/pcluster/run_instances_overrides.json` on the head node with the queue, compute resource, and capacity reservation group arn filled in.

1. Create a new cluster and on the **HeadNode** configuration screen, click on the "Advanced" dropdown and add in the `On-Demand Capacity Reservation` script:

    ![On-Demand Capacity Reservation](odcr/post-install.png)

    Fill in the parameters accordingly:

    | **Parameter**                   | **Description**                                                                                                                                                         |
    |---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
    | Queue Name                      | Name of the queue you want to use the capacity reservation with.                                                                                                        |
    | Compute Resource                | Name of the compute resource within the queue, this is typically `[queue_name]-[instance_type]` without the `.` in the instance type. i.e. `queue0-p4d24xlarge`         |
    | Capacity Reservation Group Name | This is the name of the Capacity Group you created in [Step 1](https://docs.aws.amazon.com/parallelcluster/latest/ug/launch-instances-odcr-v3.html#odcr-create-cluster) |

1. Follow the instructions in [Step 1](https://docs.aws.amazon.com/parallelcluster/latest/ug/launch-instances-odcr-v3.html#odcr-create-cluster) to create an IAM policy.

1. Add additional IAM permissions to your lambda function following [Step 3](02-slurm-accounting.html#step-3---add-permissions-to-your-lambda)

1. Add that IAM policy under the **IAM Policies** section of the **Advanced options** portion of the **HeadNode** configuration.

    ![On-Demand Capacity Reservation IAM Setup](odcr/iam.png)

1. On the review screen your cluster configuration should look similar to the following:

```yaml
HeadNode:
  InstanceType: t2.micro
  Networking:
    SubnetId: subnet-12345678
  LocalStorage:
    RootVolume:
      VolumeType: gp3
  CustomActions:
    OnNodeConfigured:
      Script: >-
        https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/multi-runner.py
      Args:
        - >-
          https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/odcr.sh
        - '-queue0'
        - '-queue0-p4d24xlarge'
        - '-EC2CRGroup'
  Iam:
    AdditionalIamPolicies:
      - Policy: arn:aws:iam::ACCOUNT_ID:policy/RunInstancesCapacityReservation
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: queue0
      ComputeResources:
        - Name: queue0-p4d24xlarge
          MinCount: 0
          MaxCount: 4
          InstanceType: p4d.24xlarge
          Efa:
            Enabled: true
      Networking:
        SubnetIds:
          - subnet-12345678
        PlacementGroup:
          Enabled: true
      ComputeSettings:
        LocalStorage:
          RootVolume:
            VolumeType: gp3
Region: region
Image:
  Os: alinux2
```

## Test

Once the cluster has been created, we can SSH in and make sure it's using the correct capacity reservation. First allocate some instances in the queue you set above:

```bash
$ salloc -N 1 -p queue0
```

Now review the log `/var/log/parallelcluster/slurm_resume.log`, it should have a line like:

```
Found RunInstances parameters override. Launching instances with: <parameters_list>
```

Voila! Now that queue will launch instances from your capacity reservation.