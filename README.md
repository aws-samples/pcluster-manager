ParallelCluster Manager - Make HPC Easy
================================

This project is a front-end for [AWS Parallel Cluster](https://github.com/aws/aws-parallelcluster)

Quickly and easily create HPC cluster in AWS using ParallelCluster Manager. This UI uses the AWS ParallelCluster 3.0 API to Create, Update and Delete Clusters as well as access, view logs, and build Amazon Machine Images (AMI's).

Want to request a new feature? [open a feature request](https://github.com/aws-samples/pcluster-manager/issues/new)

You can get started with your first cluster in as little as 15 minutes using the links below.

## Quickstart (15 mins) 🚀

Launch the stack in your AWS account by clicking on one of the below regions (use the alternative launch link if S3 template loading fails):

| Region       | Launch                                                                                                                                                                                                                                                                                                              | Alternative launch link |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ohio (us-east-2)  | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)       |
| North Virginia (us-east-1)  | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Ireland (eu-west-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-central-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-central-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |

<details>
    <summary>More Regions (Click to expand)</summary>
                   
| Region       | Launch                                                                                                                                                                                                                                                                                                              | Alternative launch link |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Oregon (us-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       |[![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)       |
| California (us-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-1.svg)](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       |[![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-1.svg)](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| London (eu-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-2.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-2.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Paris (eu-west-3)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-3.svg)](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-3.svg)](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)       |
| Stockholm (eu-north-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-north-1.svg)](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-north-1.svg)](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)       |
| Middle East (me-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/me-south-1.svg)](https://me-south-1.console.aws.amazon.com/cloudformation/home?region=me-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/me-south-1.svg)](https://me-south-1.console.aws.amazon.com/cloudformation/home?region=me-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| South America (sa-east-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/sa-east-1.svg)](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/sa-east-1.svg)](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Canada (ca-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ca-central-1.svg)](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ca-central-1.svg)](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Tokyo (ap-northeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-1.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-1.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Seoul (ap-northeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-2.svg)](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-2.svg)](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml)|
| Mumbai (ap-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-south-1.svg)](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-south-1.svg)](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Singapore (ap-southeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-1.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-1.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
| Sydney (ap-southeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-2.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-2.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager.yaml) |
</details>

Enter your email and wait (~15 mins) for the stack to go into **CREATE_COMPLETE**. Using the code from your email login to the Web UI at the address specified by the `PclusterManagerUrl` in the `Outputs` tab of the main `pcluster-manager` stack.

![CloudFormation Outputs](docs/static/01-getting-started/pcmanager-url.png)

For more details see the [Getting Started Guide](https://pcluster.cloud).

## Screen Shot

![Main Page](docs/static/01-getting-started/main-page.png)

## System Architecture

![ParallelCluster Manager Architecture](docs/static/architecture.png)

## Costs

ParallelCluster Manager is built on a serverless architecture and falls into the free tier for most uses. I've detailed the dependency services and their free-tier limits below:

| Service       | Free Tier                                                        |
|---------------|------------------------------------------------------------------|
| Cognito       | 50,000 Monthly Active Users                                      |
| API Gateway   | 1M Rest API Calls                                                |
| Lambda        | 1M free requests / month & 400,000 GB-seconds of compute / month |
| Image Builder | No-Cost except EC2                                               |
| EC2           | ~15 mins one-time to build Container Image                       |

Typical usage will likely cost < $1 / month.


## Reusing a Cognito User Pool

It is possible to reuse a Cognito user pool across multiple PCM instances to avoid having to recreate the user base for each installation. There are two ways to do this:

1. Use an existing PCM installation that utilizes Cognito as a nested stack. This is the default setup when installing PCM through the 1-click links and leaving all Cognito parameters blank.

2. Use a standalone Cognito installation that is deployed before the PCM installation and then linked to it. This has the advantage of being completely separate from PCM and makes CloudFormation updates simpler, as it is not using a nested stack.

### Reusing an Existing PCM Installation with Cognito as a Nested Stack

1. From the CloudFormation console, select the PCM stack that contains the Cognito pool that you want to reuse.
2. Navigate to the Cognito nested stack.
3. Select the **Outputs** tab.
4. Copy the following values:
   - `UserPoolId`
   - `UserPoolAuthDomain`
   - `SNSRole`
5. Install a new PCM instance using the [Quickstart](#quickstart-15-mins-🚀) and fill in all `External PCM Cognito` parameters with the outputs that you just copied. This will prevent PCM from creating a new pool and will use the linked one instead.

### Reusing a Standalone Cognito Installation

1. Launch the Cognito-only stack in the same region as the PCM will be deployed. You can do this by clicking on one of the links below for the desired region (use the alternative launch link if S3 template loading fails).


| Region       | Launch                                                                                                                                                                                                                                                                                                              | Alternative launch link |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ohio (us-east-2)  | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)       |
| North Virginia (us-east-1)  | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Ireland (eu-west-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-central-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-central-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |

<details>
    <summary>More Regions (Click to expand)</summary>
                   
| Region       | Launch                                                                                                                                                                                                                                                                                                              | Alternative launch link |
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Oregon (us-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       |[![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-2.svg)](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)       |
| California (us-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-1.svg)](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       |[![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-west-1.svg)](https://us-west-1.console.aws.amazon.com/cloudformation/home?region=us-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| London (eu-west-2)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-2.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-2.svg)](https://eu-west-2.console.aws.amazon.com/cloudformation/home?region=eu-west-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Paris (eu-west-3)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-3.svg)](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-3.svg)](https://eu-west-3.console.aws.amazon.com/cloudformation/home?region=eu-west-3#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)       |
| Stockholm (eu-north-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-north-1.svg)](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml)       | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-north-1.svg)](https://eu-north-1.console.aws.amazon.com/cloudformation/home?region=eu-north-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)       |
| Middle East (me-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/me-south-1.svg)](https://me-south-1.console.aws.amazon.com/cloudformation/home?region=me-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/me-south-1.svg)](https://me-south-1.console.aws.amazon.com/cloudformation/home?region=me-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| South America (sa-east-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/sa-east-1.svg)](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/sa-east-1.svg)](https://sa-east-1.console.aws.amazon.com/cloudformation/home?region=sa-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Canada (ca-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ca-central-1.svg)](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ca-central-1.svg)](https://ca-central-1.console.aws.amazon.com/cloudformation/home?region=ca-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Tokyo (ap-northeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-1.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-1.svg)](https://ap-northeast-1.console.aws.amazon.com/cloudformation/home?region=ap-northeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Seoul (ap-northeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-2.svg)](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-northeast-2.svg)](https://ap-northeast-2.console.aws.amazon.com/cloudformation/home?region=ap-northeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml)|
| Mumbai (ap-south-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-south-1.svg)](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-south-1.svg)](https://ap-south-1.console.aws.amazon.com/cloudformation/home?region=ap-south-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Singapore (ap-southeast-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-1.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-1.svg)](https://ap-southeast-1.console.aws.amazon.com/cloudformation/home?region=ap-southeast-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
| Sydney (ap-southeast-2) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-2.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-us-east-1.s3.us-east-1.amazonaws.com/pcluster-manager-cognito.yaml) |  [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/ap-southeast-2.svg)](https://ap-southeast-2.console.aws.amazon.com/cloudformation/home?region=ap-southeast-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcm-release-eu-west-1.s3.eu-west-1.amazonaws.com/pcluster-manager-cognito.yaml) |
</details>

2. After the stack is created, select the **Outputs** tab and copy the following values:
   - `UserPoolId`
   - `UserPoolAuthDomain`
   - `SNSRole`
3. Install a new PCM instance using the [Quickstart](#quickstart-15-mins-🚀) and fill in all `External PCM Cognito` parameters with the outputs that you just copied. This will prevent PCM from creating a new pool and will use the linked one instead.

## Identify the installed version of ParallelCluster and ParallelClsuster Manager
1. From the CloudFormation console, select a PCM stack.
2. Select the **Parameters** tab.
3. The version of ParallelCluster is available under `Version`.
4. The version of ParallelCluster Manager is the latest part of the `PublicEcrImageUri` parameter. For example if the value is `public.ecr.aws/pcm/pcluster-manager-awslambda:3.3.0` the version is `3.3.0`.

## Updating

To update the the latest version, run the following, make sure to set the region to where you deployed the stack:

## Development

See [Development guide](DEVELOPMENT.md) to setup a local environment.

## Security

See [Security Issue Notifications](CONTRIBUTING.md#security-issue-notifications) for more information.

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) before reporting bugs or feature requests

Please refer to our [Project Guidelines](PROJECT_GUIDELINES.md) before diving into the code

## License

This project is licensed under the Apache-2.0 License.

