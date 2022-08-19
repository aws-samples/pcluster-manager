ParallelCluster Manager - Make HPC Easy
================================

This project is a front-end for [AWS Parallel Cluster](https://github.com/aws/aws-parallelcluster)

Quickly and easily create HPC cluster in AWS using ParallelCluster Manager. This UI uses the AWS ParallelCluster 3.0 API to Create, Update and Delete Clusters as well as access, view logs, and build Amazon Machine Images (AMI's).

Want to request a new feature? 

1. First checkout the [Roadmap](https://github.com/aws-samples/pcluster-manager/projects/1)
2. If you don't already see your feature, [open a feature request](https://github.com/aws-samples/pcluster-manager/issues/new)

You can get started with your first cluster in as little as 15 minutes using the links below.

## Quickstart (15 mins) 🚀

Launch the stack in your AWS account by clicking on one of the below regions:

| Region       | Launch                                                                                                                                                                                                                                                                                                              | 
|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Ohio (us-east-2)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-2.svg)](https://us-east-2.console.aws.amazon.com/cloudformation/home?region=us-east-2#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-2.s3.amazonaws.com/pcluster-manager.yaml)       |
| North Virginia (us-east-1)   | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/us-east-1.svg)](https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-us-east-1.s3.amazonaws.com/pcluster-manager.yaml)
| Ireland (eu-west-1)    | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-west-1.svg)](https://eu-west-1.console.aws.amazon.com/cloudformation/home?region=eu-west-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-west-1.s3.amazonaws.com/pcluster-manager.yaml)       |
| Frankfurt (eu-central-1) | [![Launch](https://samdengler.github.io/cloudformation-launch-stack-button-svg/images/eu-central-1.svg)](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?stackName=pcluster-manager&templateURL=https://pcluster-manager-eu-central-1.s3.amazonaws.com/pcluster-manager.yaml) |

<details>
    <summary>More Regions (Click to expand)</summary>
                   
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

## Updating

To update the the latest version, run the following, make sure to set the region to where you deployed the stack:

```bash
git clone https://github.com/aws-samples/pcluster-manager.git
cd pcluster-manager/
./scripts/update.sh --region us-east-1  # should be region where stack is deployed
```

## Local Development

To run AWS ParallelCluster Manager locally, start by setting the following environment variables:

```bash
export AWS_ACCESS_KEY_ID=[...]
export AWS_SECRET_ACCESS_KEY=[...]
export AWS_DEFAULT_REGION=us-east-2
export API_BASE_URL=https://[API_ID].execute-api.us-east-2.amazonaws.com/prod  # get this from ParallelClusterApi stack outputs
export ENV=dev
```

Install dependencies by running:

```bash
pip3 install -r requirements.txt
```

#### Backend with Cognito
From the Cognito service page of the AWS account where pcluster-manager has been deployed, click on the user pool
and then on the *App Integration* tab. In the App client list at the bottom, make note of the *Client ID*, then
click on the App client and click *Edit* in the *Hosted UI* section, adding `http://localhost:5001/login` to the
*Allowed callback URLs*.

Then export the following variables:

```bash
export SECRET_ID=<the value of the UserPoolClientSecretName output from the PclusterManagerCognito stack>
export SITE_URL=http://localhost:5001
export AUDIENCE=<the value of the Client ID noted in the previous step>
export AUTH_PATH=<the UserPoolAuthDomain output of the ParallelClusterCognito nested stack>
```

Start the API backend by running:

```bash
./scripts/run_flask.sh
```

Start the React frontend by running:

```bash
cd frontend/
npm install # if this is your first time starting the frontend
npm run dev
```

Lastly, navigate to [http://localhost:5001](http://localhost:5001)

#### Frontend
Disable authentication (*HMR does not work when working on http://localhost:5001*), note that this has to be exported in shell where the backend runs:

```bash
export ENABLE_AUTH=false
```

Start the API backend by running:

```bash
./scripts/run_flask.sh
```

Start the React frontend by running:

```bash
cd frontend/
npm install # if this is your first time starting the frontend
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000)

## Typescript
The project has been converted to Typescript using [ts-migrate](https://github.com/airbnb/ts-migrate/tree/master/packages/ts-migrate)(an in depth explanation can be found [here](https://medium.com/airbnb-engineering/ts-migrate-a-tool-for-migrating-to-typescript-at-scale-cd23bfeb5cc)).
The tool automatically adds comments similar to `// @ts-expect-error` when typing errors cannot be fixed automatically: if you fix a type error either by adding a missing third party declaration or tweaking the signature of a function, you can adjust automatically the codebase and remove `//@ts-ignore` comments using `npm run ts-reignore`.

## Testing

Launch tests of the API backend by running:

```bash
pytest
```
For detailed information on how to invoke `pytest`, see this [resource](https://docs.pytest.org/en/7.1.x/how-to/usage.html). 

## Security

See [Security Issue Notifications](CONTRIBUTING.md#security-issue-notifications) for more information.

## Contributing

Please refer to our [Contributing Guidelines](CONTRIBUTING.md) before reporting bugs or feature requests

Please refer to our [Project Guidelines](PROJECT_GUIDELINES.md) before diving into the code

## License

This project is licensed under the Apache-2.0 License.

