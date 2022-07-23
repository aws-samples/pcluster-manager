+++
title = "g. Slurm REST API 🌀"
weight = 27
+++

Enable the Slurm REST API. Requires Slurm Accounting.

## Step 1 - Setup Slurm Accounting

Slurm Accounting is required to enable the Slurm REST API. Follow the [instructions](https://pcluster.cloud/02-tutorials/02-slurm-accounting.html) to enable Slurm Accounting but **do not begin cluster creation** after completing Step 4.

## Step 2 - Create a Security Group to allow inbound HTTPS traffic

By default, your cluster will not be able to accept incoming HTTPS requests to the REST API. You will need to [create a security group](https://console.aws.amazon.com/ec2/v2/home?#CreateSecurityGroup:) to change this.

1. Under `Security group name`, enter "Slurm REST API" (or another name of your choosing)
2. Ensure `VPC` matches the cluster's VPC
3. Delete any rules that may have been automatically generated
4. Add an inbound rule and select `HTTPS` under `Type` and `Anywhere-IPv4` under `Destination`
5. Click `Create security group`

## Step 3 - Configure your cluster

In your cluster configuration, return to the Head Node section and add your security group. 

Under `Advanced options`, you should have already added a script for Slurm Accounting. In the same multi-runner, click `Add Script` and select `Slurm REST API`.

Create your cluster. Make sure you followed the Slurm Accounting tutorial for the rest of the configuration.

## Step 4 - Test

Once the cluster has been successfully created, go to the `Job Scheduling` tab and select `Submit Job`

![Cluster Properties](accounting/submit-job.png)

Choose a name for your job, a number of nodes to run under, select `Run a script (manual entry)` and add `echo test` on line 2 under `#!/bin/bash`.

Click `submit`. If the job was successful, it should be listed as `COMPLETED` after a few seconds.
