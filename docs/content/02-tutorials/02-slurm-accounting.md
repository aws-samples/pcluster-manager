+++
title = "b. Slurm Accounting 🪄"
weight = 22
+++

![Accounting Architecture](02-slurm-accounting/architecture.png)

In this tutorial we will work through setting up [Slurm Accounting](https://slurm.schedmd.com/accounting.html). This is a pre-requisite for many features within Slurm, including job resource tracking and [Slurm Federation](https://slurm.schedmd.com/federation.html). Starting in **3.3.0** Slurm accounting is setup directly in the ParallelCluster Manager interface. This tutorial assumes you're creating a cluster **>= 3.3.0**.

### Step 1 - Setup External Accounting Database

The first requirement is to setup an external database that Slurm can use to store the accounting data. Use the following CloudFormation Quick-Create link to create the database in your AWS account:
  
{{% button href="https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-slurm-db&templateURL=https://us-east-1-aws-parallelcluster.s3.amazonaws.com/templates/1-click/serverless-database.yaml" icon="fas fa-rocket" %}}Deploy Accounting Database{{% /button %}}

{{% notice info %}}
Change the region in the upper right to create the database in a region separate from `us-east-2`.
{{% /notice %}}

Change the following stack parameters:

* **Password** create a password for your database
* **VPC** use the same VPC as you plan on creating the cluster in
* **Subnet1** use the same subnet as you plan on creating the cluster in
* **Subnet2** use another subnet from the same VPC. This is for High-Availability (HA) purposes.

![CloudFormation Parameters](02-slurm-accounting/cfn-properties.png)

The rest you can leave as default. Click create and wait **~30 minutes** for the stack to create.

### Step 2 - Retrieve the outputs from the CloudFormation stack

Once the stack creation has completed, go to the **Outputs** tab of the stack and make note of the properties as they will be used in the creation of your cluster:

![CloudFormation Outputs](02-slurm-accounting/cfn-outputs.jpeg)

### Step 3 - Create Your Cluster

Next, go to ParallelCluster Manager and choose the **Create** option to create a new cluster.

#### Slurm Settings

Under the HeadNode section, you'll find a section called **Slurm Properties**. Enter in information from the cloudformation stack outputs for Database, Username, and Password, you can use the following mapping to go from CloudFormation to ParallelCluster Manager:

| Parameter                      | CloudFormation Stack Output                        |
|--------------------------------|----------------------------------------------------|
| **Database**                   | `DatabaseHost:DatabasePort`                        |
| **Username**                   | `DatabaseAdminUser`                                |
| **Password**                   | `DatabaseSecretArn`                                |
| **Additional Security Groups** | `DatabaseClientSecurityGroup`                      |

![Slurm Settings](02-slurm-accounting/cluster-properties.png)

Also on the HeadNode tab, under **AdditionalSecurityGroups** select the `DatabaseClientSecurityGroup` security group output from CloudFormation:

![Additional Security Groups](02-slurm-accounting/additional-sg.png)

## Review Config

After you've configured the HeadNode, Filesystem and Queues, you'll be asked to review the config. Here's an example of what the SlurmSettings section should look like:

```yaml
SlurmSettings:
    Database:
      Uri: slurm-accounting-cluster.cluster-hash.us-east-2.rds.amazonaws.com:3306
      UserName: clusteradmin
      PasswordSecretArn: arn:aws:secretsmanager:us-east-2:123456789:secret:AccountingClusterAdminSecre-hash2
```

{{% notice info %}}
You'll see a warning like: `Cannot validate secret arn:aws:secretsmanager:us-east-2:1234567890:secret:AccountingClusterAdminSecret due to lack of permissions. Please refer to ParallelCluster official documentation for more information.` which can be safely ignored.
{{% /notice %}}

## Step 5 - Submit a job

Once the cluster has been successfully created, we can submit a job to see that accounting is working properly.

1. SSH into the Cluster, if you've enabled "Virtual Console" you can click on the "Shell" button.
2. Submit a job with the following command:

```bash
sbatch --wrap 'sleep 30'
```

## Step 6 - View the Accounting Tab

Once you've submitted a job, you can see the job information under the `Accounting tab`

You can use any of the filters at the top to narrow down the number of jobs in the view to select specific jobs.

![Accounting Tab](02-slurm-accounting/job-list.png)

If you choose the Job ID in the left column you can see further detials about the job.

![Accounting Detail](02-slurm-accounting/job-details.png)
