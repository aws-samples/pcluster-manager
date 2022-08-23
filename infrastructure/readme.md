## Setup Github and AWS credentials using Cloudformation
To access AWS resources inside a Github workflow you need to create new IAM roles under AWS and use a specific action that will retrieve temporary credentials to access your account.

To create the resources needed by the workflow action you can deploy the `./github-env-setup.yml` to [CloudFormation](https://aws.amazon.com/cloudformation/).
- Go under `CloudFormation > Stacks > Create stack`
- Upload a template file using `github-env-setup.yml`
- Give the stack a name (it doesn't matter which one)
- Create the stack
- Go to the IAM console, find the role name `*PrivateDeploy*`, copy the ARN and use it with the [AWS credentials action](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions) to authenticate

The stack will create a new role with the minimum set of policies needed to build and deploy an instance of PCluster Manager.

**This procedure must be done only once per AWS account since IAM it's a global service.**

## Update the infrastructure of an environment
When a change is made to one of the following files:
- pcluster-manager.yaml
- pcluster-manager-cognito.yaml
- SSMSessionProfile-cfn.yaml

it is not sufficient to run the `update.sh` script to update the PCM instances because it builds and deploys the Lambda image (with only the changes to backend and frontend().
To update the infrastructure just run the `infrastructure/update-environment-infra.sh` and pass the environment to update.
If you have to update the `demo` environment do the following:
- gain `Admin` access to the AWS account in which the environment is hosted
- run `./infrastructure/update-environment-infra.sh demo`