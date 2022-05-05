+++
title = "d. Cost Tracking"
weight = 24
+++

Cost Tracking is essential to every single HPC workload, it's important to be able to track costs **per-user**, **per-project**, **per-slurm-partition** and track these costs overtime.

There's two different ways to setup cost tracking, each with their own tradeoffs:

1. To see historical spend on a **per-job** basis, [setup Slurm accounting](02-slurm-accounting.html). This will allow you to query for job runtimes, who submitted what jobs, how many instances and duration of the job. This won't show shared resources such as Filesystems or idle time on compute instances.
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

```yaml

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

### Step 5 - Create a Budget

```
```