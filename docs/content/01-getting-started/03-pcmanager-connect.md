+++
title = "c. Connect to Pcluster Manager"
weight = 13
+++

1. Got to the AWS Console, in the search box search for [**AWS CloudFormation**](https://console.aws.amazon.com/cloudformation/home) and click on that service.

2. You'll see a stack named **pcluster-manager**, click on that stack > **Outputs** Tab then click on the **PclusterManagerUrl** to connect.

![Pcluster Manager Deployed](pcmanager-url.png)

3. During deployment you received an email titled **[PclusterManager] Welcome to Pcluster Manager, please verify your account.**. Copy the password from that email.

![Pcluster Manager](pcm-email.png)

4. **Enter the credentials**  using the *email* you used when deploying the stack and the *temporary password* from the email above.

![Pcluster Manager CloudFormation Stack](pcmanager-creds.png)

4. You will be asked to provide a new password. Enter a new password to complete signup.

![Signup Screen](signup.png)

Congrats! You are ready to create your HPC cluster in AWS. Let's do that in the next section.