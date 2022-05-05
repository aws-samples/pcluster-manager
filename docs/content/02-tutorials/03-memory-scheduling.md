+++
title = "c. Memory Scheduling"
weight = 23
+++

Slurm supports memory based scheduling via a `--mem` or `--mem-per-cpu` flag provided at job submission time. This allows scheduling of jobs with high memory requirements, allowing users to guarantee a set amount of memory per-job or per-process.

For example users can run:

```bash
sbatch --mem-per-cpu=64G -n 8 ...
```

To get 8 vcpus and 64 gigs of memory. 

In order to add in memory information, we have a managed post-install script that can be setup with Pcluster Manager. This script sets the `RealMemory` to **85%** of the available system memory, allowing 15% to system processes.

### Step 1 - enable post-install script

To enable this, create a new cluster and one the **HeadNode** configuration screen, click on the "Advanced" dropdown and add in the managed `Memory` script:

![Enable Memory Script](memory-scheduling/memory.png)

Then add the following managed IAM policy to the head node:

```
arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess
```

### Step 2 - review and launch

On the last screen your config should look similar to the following, note you'll minimally need `AmazonEC2ReadOnlyAccess` and `https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/mem.sh` script.

```yaml
HeadNode:
  InstanceType: c5a.xlarge
  Ssh:
    KeyName: keypair
  Networking:
    SubnetId: subnet-123456789
  Iam:
    AdditionalIamPolicies:
      - Policy: arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
      - Policy: arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess
  CustomActions:
    OnNodeConfigured:
      Script: >-
        https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/multi-runner.py
      Args:
        - >-
          https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/mem.sh
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: cpu
      ComputeResources:
        - Name: cpu-hpc6a48xlarge
          MinCount: 0
          MaxCount: 100
          InstanceType: hpc6a.48xlarge
          Efa:
            Enabled: true
      Networking:
        SubnetIds:
          - subnet-123456789
        PlacementGroup:
          Enabled: true
Region: us-east-2
Image:
  Os: alinux2
```

### Step 3 - test

When the cluster has been created you can check the memory settings for each instance:

```bash
$ scontrol show nodes | grep RealMemory
NodeName=cpu-dy-cpu-hpc6a48xlarge-1 CoresPerSocket=1
...
   RealMemory=334233 AllocMem=0 FreeMem=N/A Sockets=96 Boards=1
...
```

You'll see that for the **hpc6a.48xlarge** instance, which has 384 GB of memory that `RealMemory=334233` or `384 GB * .85 = 334.2 GB`.

To schedule a job with memory constraints you can use the `--mem` flag. See the [Slurm sbatch docs](https://slurm.schedmd.com/sbatch.html#OPT_mem) for more info.

```
$ salloc --mem 8GB 
```

You can see the requested memory for that job by running:

```bash
squeue -o "%.18i %.9P %.8j %.8u %.2t %.10M %.6D %.5m %.5c %R"

JOBID PARTITION     NAME     USER      ST    TIME  NODES MIN_M MIN_C    NODELIST(REASON)
3       cpu         interact ec2-user  R     12:25 1     8G    1      cpu-dy-cpu-hpc6a48xlarge-1
```