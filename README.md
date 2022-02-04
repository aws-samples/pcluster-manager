PCluster Manager - Make HPC Easy
================================

Quickly and easily create HPC cluster in AWS using Pcluster Manager. This UI uses the AWS ParallelCluster 3.0 API to Create, Update and Delete Clusters as well as access, view logs, and build Amazon Machine Images (AMI's).

You can get started with your first cluster in as little as 15 minutes using the links below.

## Quickstart (15 mins) 🚀

Launch the stack in your AWS account by clicking on one of the below regions:

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
| GovCloud East (us-gov-east-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/launch-stack.svg)](https://us-gov-east-1.console.aws.amazon.com/cloudformation/home?region=us-gov-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-gov-east-1.s3.amazonaws.com/pcluster-manager.yaml) |
| GovCloud West (us-gov-west-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/launch-stack.svg)](https://us-gov-west-1.console.aws.amazon.com/cloudformation/home?region=us-gov-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-mmanager-us-gov-west-1.s3.amazonaws.com/pcluster-manager.yaml) |
</details>

Enter your email and wait (~15 mins) for the stack to go into **CREATE_COMPLETE**. Using the code from your email login to the Web UI at the address specified by the `PclusterManagerUrl` in the `Outputs` tab of the main `pcluster-manager` stack.

![CloudFormation Outputs](install/cfn-outputs.png)

For more details see the [Install Instructions](install/README.md).

## Screen Shot

![Main Page](install/main-page.png)

## System Architecture

![Pcluster Manager Architecture](install/architecture.png)

## Updating

To update the the latest version, run the following, make sure to set the region to where you deployed the stack:

```bash
git clone https://github.com/aws-samples/pcluster-manager.git
cd pcluster-manager/
./scripts/update.sh us-east-1  # should be region where stack is deployed
```

## Local Development

To run Pcluster Manager locally, start by setting the following environment variables:

```bash
export AWS_ACCESS_KEY_ID=[...]
export AWS_SECRET_ACCESS_KEY=[...]
export AWS_DEFAULT_REGION=us-east-2
export API_BASE_URL=https://[API_ID].execute-api.us-east-2.amazonaws.com/prod  # get this from ParallelClusterApi stack outputs
```

Start the API backend by running:

```bash
scripts/run_flask.sh
```

Start the React frontend by running:

```bash
cd frontend/src
npm install # if this is your first time starting the frontend
npm start
```

Then navigate to [http://localhost:3000](http://localhost:3000)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

