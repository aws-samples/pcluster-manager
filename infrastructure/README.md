## Setup Github and AWS credentials using Cloudformation
To access AWS resources inside a Github workflow you need to create new IAM roles under AWS and use a specific action that will retrieve temporary credentials to access your account.

To create the resources needed by the workflow action you can deploy the `./github-env-setup.yml` to [CloudFormation](https://aws.amazon.com/cloudformation/).
- Go under `CloudFormation > Stacks > Create stack`
- Upload a template file using `github-env-setup.yml`
- Give the stack a name (it should match the `INFRA_BUCKET_STACK_NAME` for env deploy, i.e. `INFRA_BUCKET_STACK_NAME=pcluster-manager-github` for the demo env)
- Create the stack
- Go to the IAM console, find the roles created (see list below), copy the ARN and use it with the [AWS credentials action](https://github.com/marketplace/actions/configure-aws-credentials-action-for-github-actions) to authenticate using those in the matching GitHub Secrets

The stack will create three new roles:
- the `PrivateDeployRole` with the minimum set of policies needed to build and deploy an instance of PCluster Manager, its arn should be put in the secret named `ACTION_DEMO_DEPLOY_JOB_BUILD_AND_DEPLOY_ROLE`
- the `PrivateInfrastructureUpdateRole` with the minimum set of policies needed to update the infrastructure of an environment running PCluster Manager, its arn should be put in the secret named `ACTION_DEMO_DEPLOY_JOB_UPDATE_INFRASTRUCTURE_ROLE`
- the `E2ETestExecutionRole` with the minimum set of policies needed to in order to run E2E tests workflow, its arn should be put in the secret named `ACTION_E2E_TESTS_ROLE`

The same steps are required for the production release workflow, using the `./github-env-setup-prod.yml` stack, to create the role `ProductionDeploy` that should be put in the secret named `ACTION_PRODUCTION_RELEASE_ROLE`.

**This procedure must be done only once per AWS account since IAM it's a global service.**

## Update the infrastructure of an environment
When a change is made to one of the following files:
- parallelcluster-ui.yaml
- parallelcluster-ui-cognito.yaml
- SSMSessionProfile-cfn.yaml

it is not sufficient to run the `build_and_update_lambda.sh` script to update the PCUI instances because it builds and deploys the Lambda image (with only the changes to backend and frontend().
To update the infrastructure just run the `infrastructure/update-environment-infra.sh` and pass the environment to update.
If you have to update the `demo` environment do the following:
- gain `Admin` access to the AWS account in which the environment is hosted
- run `./infrastructure/update-environment-infra.sh demo`

### Update the infrastructure via the GitHub workflow
In order to have the minimum set of allowed actions, the `*UpdateInfrastructurePolicy*` may need to be expanded with time.

If you changed the infrastructure YAMLs, and the workflow is failing due to missing permissions, you should go to `infrastructure/github-env-setup.yml` and update the policy with the new actions you need.

You can then re-run your failing workflow