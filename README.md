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

![CloudFormation Settings](https://github.com/aws-samples/pcluster-manager/blob/main/install/pcmanager-deploy.png)

The setup for Pcluster Manager (and AWS ParallelCluster API) will take approximately 20 minutes.





## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

