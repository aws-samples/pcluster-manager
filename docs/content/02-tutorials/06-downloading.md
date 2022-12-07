
+++
title = "f. Downloading ⇓"
weight = 26
+++

This tutorial shows you how you can download a file from an external source at cluster start.

## Setup

In order to download a file when you start your cluster,

1. From the Pcluster Manager GUI create a new cluster. Select the **Wizard** option:
2. On the **HeadNode** configuration tab
    + Expand **Advanced Options** > turn on **Multi-Script Runner** > select **Downloader**

![Downloader Screenshot](06-downloading/downloader.png)

*Note*: You can specify either an `http://`, `https://` or `s3://` endpoint, however for any s3 location it must reside in the same region as the cluster.

*Note*: You may specify any number of additional arguments to the script and it will download each of them to the destination directory.


3. On the final screen review and make sure your config looks similar to the following. The only required parameter is the `downloader.sh` script.

```yaml
HeadNode:
  InstanceType: t2.micro
  Ssh:
    KeyName: keypair
  Networking:
    SubnetId: subnet-123456789
  CustomActions:
    OnNodeConfigured:
      Script: >-
        https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/multi-runner.py
      Args:
        - >-
          https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/downloader.sh
        - '-/tmp'
        - '-https://aws.amazon.com'
        - '-s3://mybucket/myfile'
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: queue0
      ComputeResources:
        - Name: queue0-t2-micro
          MinCount: 0
          MaxCount: 4
          Instances:
            - InstanceType: t2.micro
      Networking:
        SubnetIds:
          - subnet-123456789
Region: us-east-2
Image:
  Os: alinux2
```

4. Create your cluster, when your cluster is created each of the files will be downloaded into the destination directory.
