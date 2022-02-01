# Installation

### Step 1: CloudFormation Setup
First Deploy the PclusterManager Server (which includes the AWS ParallelCluster API). If you don't see your region below don't fret.

| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ohio (us-east-2)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-2.s3.amazonaws.com/pcluster-manager.yaml)       |
| North Virginia (us-east-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)
| Ireland (eu-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-central-1.s3.amazonaws.com/pcluster-manager.yaml) |

<details>
    <summary>More Regions (Click to expand)</summary>
                   
| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Oregon (us-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| California (us-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-1.svg)](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-west-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| London (eu-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-2.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-2.s3.amazonaws.com/pcluster-manager.yaml)       |
| Paris (eu-north-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-3.svg)](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-3.s3.amazonaws.com/pcluster-manager.yaml)       |
| Stockholm (eu-north-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-north-1.svg)](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-north-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Middle East (me-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/me-south-1.svg)](https://me-south-1.console.aws.amazon.com/cloudformation/home?region=me-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-me-south-1.s3.amazonaws.com/pcluster-manager.yaml) |
| South America (sa-east-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/sa-east-1.svg)](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-sa-east-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Canada (ca-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ca-central-1.svg)](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ca-central-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Hong Kong (ap-east-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-east-1.svg)](https://ap-east-1.console.aws.amazon.com/cloudformation/home?region=ap-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-east-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Tokyo (ap-northeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-1.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-northeast-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Seoul (ap-northeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-2.svg)](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-northeast-2.s3.amazonaws.com/pcluster-manager.yaml) |
| Mumbai (ap-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-south-1.svg)](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-south-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Singapore (ap-southeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-1.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-southeast-1.s3.amazonaws.com/pcluster-manager.yaml) |
| Sydney (ap-southeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-2.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-ap-southeast-2.s3.amazonaws.com/pcluster-manager.yaml) |
</details>


### Step 2: Setup CloudFormation Stack

The AWS Console opens on the AWS CloudFormation panel to deploy your stack. Update the field **AdminUserEmail** with a valid email to receive a temporary password in order to connect to the Pcluster Manager GUI. Leave the other fields with their default values and click Next to proceed to Step 3.

![CloudFormation Settings](pcmanager-install.png)

Click the two IAM boxes and click **Create Stack**

![Deploy the Stack](pcmanager-deploy.png)

The setup for Pcluster Manager (and AWS ParallelCluster API) will take approximately 20 minutes.

### Step 3: Login

During the setup process you will receive an automated email with a temporary password which looks like the following (except the email you receive will have a code in the place of the `[REDACTED]` text below. You will use this temporary password to login to your administrator account along with the email you specified in `Step 2` above.

![Admin Temporary Password](welcome-email.png)

Once the stack has been created (you should see **CREATE_COMPLETE** in green as the status next to the `pcluster-manager` stack) -- go to the `Outputs` tab and select the `PclusterManagerUrl` output to access the site. Use your administrator email from `Step 2` and the temporary password from your email to login to the site.

![CloudFormation Outputs](cfn-outputs.png)

### Step 4: Create a Cluster

Once you have logged in to the site you will be presented with a page that looks something like the following. Likely if this is your first time interacting with ParallelCluster your list of clusters will be empty. In that case, click the **Create Cluster** in the top right and follow the instructions in the wizard to create your first cluster.

![Main Page](main-page.png)
