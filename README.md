## PclusterManager

### Step 1
First Deploy the PclusterManager Server (which includes the AWS ParallelCluster API)

| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| North Virginia (us-east-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)
| Oregon (us-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Ireland (eu-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-central-1.s3.amazonaws.com/pcluster-manager.yaml) |

### Step 2: Setup CloudFormation Stack

The AWS Console opens on the AWS CloudFormation panel to deploy your stack. Update the field `AdminUserEmail` with a valid email to receive a temporary password in order to connect to the Pcluster Manager GUI. Leave the other fields with their default values and click Next to proceed to Step 3.

![CloudFormation Settings](https://github.com/aws-samples/pcluster-manager/blob/main/install/pcmanager-install.png)

### Step 3

Scroll down to the bottom of the Stage 3 page (Configure stack options) and click Next.

### Step 4

Scroll down to the bottom of the Stage 4 page (Review) and click on the the two tick boxes to create new IAM resources. Once done, click on Create stack.

![Deploy the Stack](https://github.com/aws-samples/pcluster-manager/blob/main/install/pcmanager-deploy.png)

The setup for Pcluster Manager (and AWS ParallelCluster API) will take approximately 20 minutes.

### Step 5 Login

During the setup process you will receive an automated email with a temporary password which looks like the following (except the email you receive will have a code in the place of the `[REDACTED]` text below. You will use this temporary password to login to your administrator account along with the email you specified in `Step 2` above.

![Admin Temporary Password](https://github.com/aws-samples/pcluster-manager/blob/main/install/welcome-email.png)

Once the stack has been created (you should see `CREATE_COMPLETE` in green as the status next to the `pcluster-manager` stack) -- go to the `Outputs` tab and select the `PclusterManagerUrl` output to access the site. Use your administrator email from `Step 2` and the temporary password from your email to login to the site.

![CloudFormation Outputs](https://github.com/aws-samples/pcluster-manager/blob/main/install/cfn-outputs.png)


### Step 6

Once you have logged in to the site you will be presented with a page that looks something like the following. Likely if this is your first time interacting with ParallelCluster your list of clusters will be empty. In that case, click the `Create Cluster` in the top right and follow the instructions in the wizard to create your first cluster.

![Main Page](https://github.com/aws-samples/pcluster-manager/blob/main/install/main-page.png)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

