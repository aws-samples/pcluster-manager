+++
title = "b. Deploy Pcluster Manager"
weight = 12
+++

The [AWS ParallelCluster API](https://docs.aws.amazon.com/parallelcluster/latest/ug/api-reference-v3.html) has been released with the version 3 of AWS ParallelCluster. It enables you to to manage clusters though an API hosted on AWS and build workflows to manage your cluster lifecycle with Python.

Pcluster Manager is a web UI that built upon the AWS ParallelCluster CLI that you can use to manage your compute clusters. It'll take about 20 minutes to deploy both stacks. You will initiate the deployment now to have it ready by the time you need it.

1. Deploy the Pcluster Manager stack by clicking on the link in your region. If you don't have a prefered region use **Ohio (us-east-2)**.

{{% notice info %}}
If you don't see your region click **More Regions (Click to expand)** below.
{{% /notice %}}

| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ohio (us-east-2)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-2.s3.amazonaws.com/pcluster-manager.yaml)       |
| North Virginia (us-east-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)
| Ireland (eu-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-central-1.s3.amazonaws.com/pcluster-manager.yaml) |

{{%expand "More Regions (Click to expand)" %}}
                   
| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Oregon (us-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-west-2.s3.amazonaws.com/pcluster-manager.yaml)       |
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
| GovCloud West (us-gov-west-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/launch-stack.svg)](https://console.amazonaws-us-gov.com/cloudformation/home?region=us-gov-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-gov-west-1.s3-us-gov-west-1.amazonaws.com/pcluster-manager.yaml) |
{{% /expand%}}

2. The AWS Console opens on the AWS CloudFormation panel to deploy your stack. Update the field *AdminUserEmail* with **a valid email** to receive a temporary password in order to connect to the Pcluster Manager GUI. Leave the other fields with their default values and click **Next** to proceed to Step 3.

![Pcluster Manager install](pcmanager-install.png)
![Pcluster Manager install](pcmanager-stack.png)

3. Scroll down to the bottom of the Stage 3 page (*Configure stack options*) and click **Next**.
4. Scroll down to the bottom of the Stage 4 page (*Review*) and **click** on the the two tick boxes to create new IAM resources. Once done, click on **Create stack**.

![Pcluster Manager install](pcmanager-deploy.png)

The stack is deploying using AWS CloudFormation. It will take ~20 minutes to deploy the AWS ParallelCluster API and Pcluster Manager GUI. In the meantime, you will complete the first part of the lab. Continue to the next page to define the configuration of your first HPC system in AWS.

{{% notice warning %}}Ensure that you entered a valid email when deploying the Pcluster Manager stack. This email will be used to send you the credentials to connect to Pcluster Manager. If the email you will have to delete and recreate it which may delay your progression.
{{% /notice %}}
