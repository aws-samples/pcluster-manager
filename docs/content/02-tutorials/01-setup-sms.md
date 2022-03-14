+++
title = "a. Setup SMS for MFA"
date = 2019-09-18T10:46:30-04:00
draft = false
weight = 21
+++

To enable Multi-Factor Authentication (MFA) with Pcluster Manager there's two setup steps that need to be completed.

1. Setup an Origination number
2. Add a sandbox number

#### 1. Setup an Origination Number

1. Navigate to [Pinpoint Phone Numbers Console](https://console.aws.amazon.com/pinpoint/home?#/sms-account-settings/phoneNumbers) > Click **Request Phone Number**

    Fill out the following options:

    | Option      | Description |
    | ----------- | ----------- |
    | Country      | [Your Country]     |
    | Number Type   | **Toll Free**        |
    | Capabilities   | SMS        |
    | Default Message Type   | Transactional        |

    ![Origination Number Setup](origination-number.png)

2. Click **Next** > **Request**

#### 2. Add a sandbox number

1. Next navigate to the [SNS SMS Console](https://console.aws.amazon.com/sns/v3/home?#/mobile/text-messaging) > Click **Add a phone number"

    ![Sandbox Number](sandbox-number.png)

2. Enter the phone number of the user and set verification message language

    ![Sandbox Number 2](sandbox-number-2.png)

3. You'll receive a text message, enter that code to verify your number

#### 3. Test with Pcluster Manager

Now that you've gotten the SMS portion setup you can go ahead and login. You'll see a screen after you enter your username/passowrd that looks like:

![PCM MFA Confirmation](pcm-mfa.png)

If everthing is setup properly you'll receive a text message that allows you to login.