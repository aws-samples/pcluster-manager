+++
title = "a. Setup Multi-Factor Authentication 📱"
date = 2019-09-18T10:46:30-04:00
draft = false
weight = 21
+++

To enable Multi-Factor Authentication (MFA) with Pcluster Manager there's two steps that need to be completed:

1. Enable MFA for Cognito Userpool
2. Login and setup Authenticator app

#### 1. Setup MFA in Cognito Userpool

1. Navigate to [Cognito Console](https://console.aws.amazon.com/cognito/v2/idp/user-pools/) > Click on your user pool > Select **Sign-in experience** tab > Scroll down to Multi-Factor Authentication and click **Edit**
2. Select **Require MFA** and **Authenticator apps** > Save changes

![PCM MFA Cognito Setup](sms/cognito-enable-mfa.png)

#### 2. Login to Pcluster Manager

1. The next time you login to ParallelCluster Manager you'll see a screen like the following: 
2. Scan the QR code and continue setup in your favorite authenticator app. I reccomend [Authy](https://authy.com/features/setup/).

![Setup Authy](sms/setup-authy.png)
