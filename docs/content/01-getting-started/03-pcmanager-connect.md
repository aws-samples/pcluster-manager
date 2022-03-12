+++
title = "c. Connect to Pcluster Manager"
weight = 13
+++

1. During deployment you received an email titled **[PclusterManager] Welcome to Pcluster Manager, please verify your account.**. Click on the link to login with the temporary code provided.

![Pcluster Manager](pcm-email.png)

2. **Enter the credentials**  using the *email* you used when deploying the stack and the *temporary password* from the email above.

![Pcluster Manager CloudFormation Stack](pcmanager-creds.png)

3. You will be asked to provide a new password. Enter a new password to complete signup.

![Signup Screen](signup.png)

Congrats! You are ready to create your HPC cluster in AWS. Let's do that in the next section.

{{% notice note %}}
To get the URL outside of the email, go to [**AWS CloudFormation**](https://console.aws.amazon.com/cloudformation/home) > **pcluster-manager** > **Outputs** then click on the **PclusterManagerUrl** to connect.
![Pcluster Manager Deployed](pcmanager-url.png)
{{% /notice %}}