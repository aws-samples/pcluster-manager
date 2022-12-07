+++
title = "h. Setup Custom Domain 🔗"
weight = 28
+++

Custom domains are a great way to shorten the default API Gateway domain into something more readable. For example instead of `https://sdrojbaf64.execute-api.us-east-2.amazonaws.com/` users could navigate to, for example, `example.com`.

Before getting started ensure that you:

* Own a Domain
* Know how to change basic DNS settings

We'll be referring to `example.com` only as an example in the following steps. Use your domain when you see this.

## Create new Domain in API Gateway

1. Navigate to [API Gateway Console > Custom domain names > Create](https://console.aws.amazon.com/apigateway/main/publish/domain-names/create?)

    ![Create Domain](08-custom-domain/create-domain.png)

2. If you haven't already created a certificate, you can do that through ACM by clicking "Create new certificate in Amazon Certificate Manager". If you already have a cert, skip to [Setup API Mappings](#setup-api-mappings).

## Create certificate

1. On the [Certificate Manager console](https://console.aws.amazon.com/acm/home), click "Request"
2. Enter in the domain you own, i.e. `example.com`
3. Select either email or DNS validation (I prefer email)
4. Click request

    ![Request Certificate](08-custom-domain/certificate.png)

If you selected email, you'll get an email to the email you have on file with the regisitrar. Click "I approve" to activate the certificate.

## Setup API Mappings

Return back to the API Gateway console, select the certificate and click "Create" to complete the setup.

1. Next on the API Gateway > Custom domain names > your domain
2. Click on **Configure API Mappings** and create a new one like:

    ![API Gateway Custom Mappings](08-custom-domain/api-mappings.png)

You'll see a section called **API Gateway domain name**. Copy that for DNS setup.

## Setup DNS

Create a DNS **CNAME** rule that points your domain to the API Gateway domain like so:

| Rule  | Source      | Destination                                       |
|-------|-------------|---------------------------------------------------|
| CNAME | example.com | d-hb4qd1edp8.execute-api.us-east-2.amazonaws.com. |

**Note:** this is not the same as the URL you access when you go to PCM. Check API Gateway > Custom Domains > API Gateway domain name for the correct domain.

## Add the domain to your Cognito user pool

1. Navigate to the [Cognito Console](https://console.aws.amazon.com/cognito/v2/idp/user-pools) > Select your user pool
2. Under App Integration > Domain > **Create custom domain**

    ![Cognito Custom Domain](08-custom-domain/cognito-custom-domain.png)

3. Enter in the same domain as before and select the certificate

## Configure API Gateway Callback URL

1. Navigate to [Cognito](https://console.aws.amazon.com/cognito/v2/idp/user-pools) > App Integration > **App clients and analytics**. There you'll see an application, click on it and scroll down to Hosted UI.
2. Edit the section and add in i.e. `example.com/login` under the **Allowed Callback URLs** section:

    ![Hosted UI](08-custom-domain/hosted-ui.png)

## Configure AWS Lambda Function

1. Go to the [Lambda Console (deeplink)](https://console.aws.amazon.com/lambda/home?#/functions?f0=true&fo=and&k0=functionName&n0=false&o0=%3A&op=and&v0=PclusterManagerFunction) and search for `PclusterManagerFunction`
2. Select the function then **Configuration** > **Environment Variable**. Edit `SITE_URL` to point to the domain you setup:

    ![Hosted UI](08-custom-domain/site-url.png)

## Test

1. Navigate to your domain, i.e. `example.com` and authenticate, you should now be connected to ParallelCluster Manager using your own domain.