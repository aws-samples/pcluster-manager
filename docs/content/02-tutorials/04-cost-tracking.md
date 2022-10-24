+++
title = "d. Cost Tracking 💰"
weight = 24
+++

Cost Tracking is essential to every single HPC workload, it's important to be able to track costs **per-user**, **per-project**, **per-slurm-partition** and track these costs overtime.

There's two different ways to setup cost tracking, each with their own tradeoffs:

1. To see historical spend on a **per-job** basis, setup [Slurm Accounting 🪄](02-slurm-accounting.html). This will allow you to query for job runtimes, who submitted what jobs, how many instances and duration of the job. This won't show shared resources such as Filesystems or idle time on compute instances.
2. To track costs **per-cluster**, you can tag ec2 instances, this allows you to generate reports in AWS Cost Explorer breaking down by what you tagged.

We're going to setup the requisite scripts to tag the instances, allowing users to submit jobs like:

```bash
sbatch --comment ProjectA
```

And administrators to generate reports like:

![Cost Explorer Project](cost-tracking/cost-explorer-project.png)

### Step 1 - create IAM Policy

In order to allow the EC2 instances to modify tags, we need to create an IAM policy that allows tagging.

1. Go to the [IAM Console](https://console.aws.amazon.com/iamv2/home#/policies) > **Create Policy**
2. Click on **json** tab and paste in the following:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ec2:DeleteTags",
                "ec2:DescribeTags",
                "ec2:CreateTags"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "budgets:ViewBudget"
            ],
            "Resource": "arn:aws:budgets::*:budget/*"
        }
    ]
}
```
3. Click next a few times until you're at the "Review policy" screen.
4. Name it `pclusterTagsAndBudget`

### Step 2 - configure HeadNode

In Pcluster Manager, when you create the cluster, on the **HeadNode** section drop down the "Advanced Options".

2. Turn on Multi-runner script
3. Click "Add Script"
4. Select the "Cost Tags" managed script
5. Paste in the arn of the `pclusterTagsAndBudget` you created above. 

![HeadNode Setup](cost-tracking/cost-tags-headnode.png)

### Step 3 - configure ComputeFleet

On the **ComputeFleet** section drop down the "Advanced Options".

2. Turn on Multi-runner script
3. Click "Add Script"
4. Select the "Cost Tags" managed script
5. Paste in the arn of the `pclusterTagsAndBudget` you created above. 

![HeadNode Setup](cost-tracking/cost-tags-computefleet.png)

### Step 4 - review

Next, review your config. It should look similar to the following:

```yaml
Image:
  Os: alinux2
HeadNode:
  InstanceType: c5.2xlarge
  Networking:
    SubnetId: subnet-1234567
  Ssh:
    KeyName: keypair
  CustomActions:
    OnNodeConfigured:
      Script: >-
        https://raw.githubusercontent.com/sean-smith/pcluster-manager/cost-explorer/resources/scripts/cost-tags.sh
  Iam:
    AdditionalIamPolicies:
      - Policy: arn:aws:iam::1234567890:policy/pclusterTagsAndBudget
      - Policy: arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess
      - Policy: arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
  Dcv:
    Enabled: true
Scheduling:
  Scheduler: slurm
  SlurmQueues:
    - Name: cpu
      Networking:
        SubnetIds:
          - subnet-1234567
        PlacementGroup:
          Enabled: true
      ComputeResources:
        - Name: cpu-hpc6a48xlarge
          Instances:
            - InstanceType: hpc6a.48xlarge
          MinCount: 0
          MaxCount: 100
          Efa:
            Enabled: true
      CustomActions:
        OnNodeConfigured:
          Script: >-
            https://raw.githubusercontent.com/sean-smith/pcluster-manager/cost-explorer/resources/scripts/cost-tags.sh
      Iam:
        AdditionalIamPolicies:
          - Policy: arn:aws:iam::822857487308:policy/pclusterTagsAndBudget
Tags:
  - Key: aws-parallelcluster-username
    Value: NA
  - Key: aws-parallelcluster-jobid
    Value: NA
  - Key: aws-parallelcluster-project
    Value: NA
Region: us-east-2
```

### Step 5 - Submit Job with Project

To create a project, edit the file `/opt/slurm/etc/projects_list.conf`:

```bash
ec2-user=ProjectA, ProjectB
userA=ProjectA, ProjectC
```

In this file you'll find a list of users and the projects associated with them. When you submit a job it'll require you to select a project from that file:

```bash
$ sbatch submit.sh
You need to specify a project. "--comment ProjectName"
$ sbatch --comment ProjectB submit.sh
Submitted batch job 5017
```

You'll see the following tags get added to the job:

| Tag                          | Description                                          |
|------------------------------|------------------------------------------------------|
| aws-parallelcluster-username | user who submitted the job                           |
| aws-parallelcluster-project  | project name specified in `--comment <project-name>` |
| aws-parallelcluster-jobid    | the id of the submitted job                          |
| parallelcluster:queue-name    | The Slurm partition these jobs were submitted too.                         |

### Step 5 - Create a Budget

Budgets allow us to track specific project cost over time and get alerted if we're about to hit a cap.

1. Navigate to the [AWS Budgets Portal](https://console.aws.amazon.com/billing/home?#/budgets/create) > **Create Budget**
2. Create a **Cost Budget**
3. Enter in the amount of money and frequency you desire.
4. Select "Filter by specific AWS cost dimensions" and set the following:

| Budget Item    | Description                                                               |
|----------------|---------------------------------------------------------------------------|
| Dimension | Tag                                             |
| Tag            | `aws-parallelcluster-project`                                             |
| Project Name   | Name of the project, corresponding to `/opt/slurm/etc/projects_list.conf` |

![Create Budget](cost-tracking/create-budget.png)

5. Enter a threshold and email address to get notified when approaching the budget
6. Modify the file `/opt/slurm/bin/sbatch` on the cluster and set `budget="yes"`. 

```bash
#enable or disable the budget checks for the projects
budget="yes"
```

This will check the budget with the same name of the project before the user submits a job and make sure the budget hasn't been exceeded. For example, if `ProjectA`'s budget has been exceeded you'll see:

```bash
sbatch -N 100 --comment ProjectA submit.sh
The Project ProjectA does not have more budget allocated for this month.
```