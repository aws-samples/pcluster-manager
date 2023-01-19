# Development

To run AWS ParallelCluster UI locally, start by setting the following environment variables:

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

## Backend with Cognito
From the Cognito service page of the AWS account where PCUI has been deployed, click on the user pool
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

## Typescript
The project has been converted to Typescript using [ts-migrate](https://github.com/airbnb/ts-migrate/tree/master/packages/ts-migrate)(an in depth explanation can be found [here](https://medium.com/airbnb-engineering/ts-migrate-a-tool-for-migrating-to-typescript-at-scale-cd23bfeb5cc)).
The tool automatically adds comments similar to `// @ts-expect-error` when typing errors cannot be fixed automatically: if you fix a type error either by adding a missing third party declaration or tweaking the signature of a function, you can adjust automatically the codebase and remove `//@ts-ignore` comments using `npm run ts-reignore`.

## Testing

Launch tests of the API backend by running:

```bash
pytest
```
For detailed information on how to invoke `pytest`, see this [resource](https://docs.pytest.org/en/7.1.x/how-to/usage.html).

To run frontend tests:
```
npm test
```
