# Slurm Accounting

In this tutorial we will work through setting up Slurm Accounting. This enables many features within slurm, including job resource tracking and providing a necessary building block to slurm federation.

## Step 1 - Setup External Accounting Database

The first requirement is to setup an external database that Slurm can use to store the accounting data.

Use the following CloudFormation Quick-Create link to create the database in
your AWS account. Note that if you would like to create the databas in a
different region, change the value of the `region` parameter in the URL to the
region of your choice and reload the page.

[![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/quickcreate?stackName=slurm-accounting&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/slurm-accounting/accounting-cluster-template.yaml)

When you're creating the stack, be sure to specify the `Public subnet AZ` and
`Private subnet AZ` parameters to correspond to the region where you are
creating the stack. All other values should be suitable as defaults, however
feel free to change the database instance type depending on your workload
needs.

![CloudFormation Settings](slurm-accounting-cfn-properties.png)
