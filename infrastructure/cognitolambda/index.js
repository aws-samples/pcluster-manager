// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
const axios = require("axios");
const aws = require("aws-sdk");
const cognito = new aws.CognitoIdentityServiceProvider();
const secretsmanager = new aws.SecretsManager();

// if debug = true, we skip the step of attempting to post results to a signed
// S3 URL as our test event would, in theory, contain a static / old / invalid
// S3 URL instead of the freshly-generated URL that is received during a real
// CloudFormation deployment:
const debug = false; 

// If true, secrets are deleted immediately and not recoverable. 
// If false, secrets are deleted but may be recovered within 7 days if needed. 
const deleteImmediately = false; 

/*
  This function acts as a custom CloudFormation resource and therefore must
  handle one of three request types: Create, Update, or Delete. 
*/
exports.handler = async function (event, context, callback) {

    console.log("REQUEST RECEIVED:\n" + JSON.stringify(event));

    // Given that a stack ID is in the format arn:aws:cloudformation:REGION:ACCOUNT:stack/STACKNAME/VERSION,
    // We can parse the stack name from the stack ID by splitting on a '/':
    const stackName = (event.StackId).split('/')[1];
    const userPoolId = event.ResourceProperties.UserPoolId;
    const appClientId = event.ResourceProperties.AppClientId;
    const resourceId = event.LogicalResourceId;
    const requestType = event.RequestType;
    let responseData, responseStatus;

    if (requestType === "Create") {
        try {
            console.log('Getting app client secret from Cognito...')
            var describeUserPoolClientParams = {
                UserPoolId: userPoolId,
                ClientId: appClientId
            };
            var describeResponse = await cognito.describeUserPoolClient(describeUserPoolClientParams).promise();
            var clientSecret = describeResponse.UserPoolClient.ClientSecret;
            console.log('Storing secret in AWS Secrets Manager...');
            var secretName = generateSecretName(stackName, resourceId);

            var secretPayload = {
                userPoolId: userPoolId,
                clientId: appClientId,
                clientSecret: clientSecret
            };
            var createSecretParams = {
                Description: `App client secret for app ${appClientId} of Cognito user pool ${userPoolId} for CF stack ${stackName}`, 
                Name: secretName,
                SecretString: JSON.stringify(secretPayload),
                Tags: [
                    {
                        Key: 'custom:cloudformation:stack-name',
                        Value: stackName
                    },
                    {
                        Key: 'custom:cloudformation:logical-id',
                        Value: resourceId
                    },
                    {
                        Key: 'custom:cloudformation:created-by',
                        Value: 'lambda function ' + process.env.AWS_LAMBDA_FUNCTION_NAME
                    },
                ]
               };
            var secretResponse = await secretsmanager.createSecret(createSecretParams).promise();
            responseData = {
                SecretArn: secretResponse.ARN,
                SecretName: secretResponse.Name,
                SecretVersionId: secretResponse.secretVersionId
            };
            console.log('Create secret response data: ' + JSON.stringify(responseData));
            responseStatus = "SUCCESS";
        }
        catch (err) {
            responseStatus = "FAILED";
            responseData = { Error: "Create client app secret failed." };
            console.log(responseData.Error + ":\n", err);
        }
    }
    else if (requestType === "Update") {
        try {
            console.log('Getting app client secret from Cognito...')
            var describeUserPoolClientParams = {
                UserPoolId: userPoolId,
                ClientId: appClientId
            };
            var describeResponse = await cognito.describeUserPoolClient(describeUserPoolClientParams).promise();
            var clientSecret = describeResponse.UserPoolClient.ClientSecret;

            console.log('Updating secret in AWS Secrets Manager...');
            var secretName = event.PhysicalResourceId;
            console.log('secret name is ' + secretName)
            var secretPayload = {
                UserPoolId: userPoolId,
                ClientId: appClientId,
                ClientSecret: clientSecret
            };
            var updateSecretParams = {
                SecretId: secretName,
                Description: `App client secret for app ${appClientId} of Cognito user pool ${userPoolId} for CF stack ${stackName}`,
                SecretString: JSON.stringify(secretPayload),
            };
            var secretResponse = await secretsmanager.updateSecret(updateSecretParams).promise();
            responseData = {
                SecretArn: secretResponse.ARN,
                SecretName: secretResponse.Name,
                SecretVersionId: secretResponse.secretVersionId
            };
            console.log('Update secret response data: ' + JSON.stringify(responseData));
            responseStatus = "SUCCESS";
        }
        catch (err) {
            responseStatus = "FAILED";
            responseData = { Error: "Update of client app secret failed." };
            console.log(responseData.Error + ":\n", err);
        }
    }
    else if (requestType == "Delete") {
        try {
            console.log('Deleting secret in AWS Secrets Manager...');
            var secretName = event.PhysicalResourceId;
            var secretPayload = {
                UserPoolId: userPoolId,
                ClientId: appClientId,
                ClientSecret: clientSecret
            };
            var deleteParams = {
                SecretId: secretName
            };

            if (deleteImmediately === false) {
                deleteParams.RecoveryWindowInDays = 7;
            } else {
                deleteParams.ForceDeleteWithoutRecovery = true;
            }

            var secretResponse = await secretsmanager.deleteSecret(deleteParams).promise();
            responseData = {
                SecretArn: secretResponse.ARN,
                SecretName: secretResponse.Name
            };
            console.log('Delete secret response data: ' + JSON.stringify(responseData));
            responseStatus = "SUCCESS";
        }
        catch (err) {
            responseStatus = "FAILED";
            responseData = { Error: "Delete of client app secret failed." };
            console.log(responseData.Error + ":\n", err);
        }
    }
    else {
        responseStatus = "FAILED";
        responseData = { Error: "Invalid requestType of '${requestType}'." };
    }

    await sendResponse(event, context, callback, responseStatus, responseData);

};

// Send response to the pre-signed S3 URL 
async function sendResponse(event, context, callback, responseStatus, responseData) {

    var signedUrl = event.ResponseURL;
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "Log Stream: " + context.logStreamName +  " pid: " + responseData.SecretName,
        PhysicalResourceId: responseData.SecretName,
        AuthDomain: event.AuthDomain,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });

    console.log("RESPONSE BODY:\n", responseBody);

    var options = {
        method: 'put',
        headers:  {
            "content-type": "",
            "content-length": responseBody.length
        },
        data: responseBody
    };

    if (debug === true) {
        console.log('Debug=true; skipping post of results to signed S3 URL...');
    } else {
        console.log('Posting response to S3 signed URL...');
        var response = await axios(signedUrl, options);
        console.log("STATUS: " + response.status);
        console.log("HEADERS: " + JSON.stringify(response.headers, null, 2));
    }
    callback(null);
}

function generateSecretName(stackName, resourceId) {
    var result           = `${stackName}-${resourceId}-`;
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 12; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }
