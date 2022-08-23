+++
title = "e. Cloud9 ☁️"
weight = 25
+++

[Cloud9](https://aws.amazon.com/cloud9/) is a web-based code editor, terminal and file-browser. You can connect to the cluster via Cloud9 and advantage of the following  convenient features:

* Terminal
* Drag & Drop file upload
* Code editor

![Cloud9 Screenshot](cloud9/cloud9.png)

## Setup

To setup the connection, we need to run a script to install the Cloud9 packages on the HeadNode.

1. From the Pcluster Manager GUI create a new cluster. Select the **Wizard** option:
2. On the **HeadNode** configuration tab
    + Expand **Advanced Options** > turn on **Multi-Script Runner** > select **Cloud9**

![Cloud9 Screenshot](cloud9/cloud9-2.png)

3. On the final screen review and make sure your config looks similar to the following. The only required parameter is the `cloud9.sh` script, we also use the `SSMManagedInstanceCore` policy to connect to the headnode.

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
          https://raw.githubusercontent.com/aws-samples/pcluster-manager/main/resources/scripts/cloud9.sh
  Iam:
    AdditionalIamPolicies:
      - Policy: arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: queue0
      ComputeResources:
        - Name: queue0-t2-micro
          MinCount: 0
          MaxCount: 4
          InstanceType: t2.micro
      Networking:
        SubnetIds:
          - subnet-123456789
Region: us-east-2
Image:
  Os: alinux2
```

4. Once the cluster is **CREATE_COMPLETE**, copy the public IP address of the `HeadNode`:

![Public IP](cloud9/cloud9-3.png)

5. Next, navigate to the [Cloud9 Console](https://console.aws.amazon.com/cloud9/home) > **Create Environment** > Give it the same name as the cluster and the following description:

* **Name**: Cluster Name
* **Description**: AWS ParallelCluster HeadNode

![Public IP](cloud9/cloud9-4.png)

7. Copy the public key and then connect to the cluster using SSM, on the headnode paste in the key at the bottom of the `~/.ssh/authorized_keys` file.

9. Install Node.js by executing the following commands on the **HeadNode**

```bash
sudo yum install -y gcc-c++ make
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
sudo yum install -y nodejs 
```

10. Click **Next** then review and confirm. If everything worked you should a screen like the following:

![Public IP](cloud9/cloud9-5.png)