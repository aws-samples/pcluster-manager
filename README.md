## PclusterManager

### Installation Instructions

Follow the [installation instructions](https://github.com/aws-samples/pcluster-manager/blob/main/install/README.md) to setup Pcluster Manager on your account.

### Screen Shot

![Main Page](https://github.com/aws-samples/pcluster-manager/blob/main/install/main-page.png)

### System Architecture

![Architecture](https://github.com/aws-samples/pcluster-manager/blob/main/install/architecture.png)

### Updating

To update the underlying lambda to the latest, run the `./scripts/update.sh` script.

### Local Development

To run Pcluster Manager locally, start by setting the following environment variables:
```
export AWS_ACCESS_KEY_ID=[...]
export AWS_SECRET_ACCESS_KEY=[...]
export AWS_DEFAULT_REGION=us-east-2
export API_BASE_URL=https://[API_ID].execute-api.us-east-2.amazonaws.com/prod
```

Then start the API backend by running `./scripts/run_flask.sh` and the React frontend by running `npm start` in the `frontend/src` directory. Then navigate to [http://localhost:3000](http://localhost:3000)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This project is licensed under the Apache-2.0 License.

