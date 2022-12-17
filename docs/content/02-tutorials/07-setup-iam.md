+++
title = "g. Setup IAM Permissions 🔑"
weight = 27
+++

Be default AWS ParallelCluster API limits the policies you're allowed to attach with `AdditionalIAMPolicies` to the following [managed policies](https://docs.aws.amazon.com/parallelcluster/latest/ug/api-reference-v3.html#api-reference-invoke-v3):

* arn:aws:iam::1234567890:policy/parallelcluster*
* arn:aws:iam::1234567890:policy/parallelcluster/*
* arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy
* arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
* arn:aws:iam::aws:policy/AWSBatchFullAccess
* arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
* arn:aws:iam::aws:policy/service-role/AWSBatchServiceRole
* arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role
* arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
* arn:aws:iam::aws:policy/service-role/AmazonEC2SpotFleetTaggingRole
* arn:aws:iam::aws:policy/EC2InstanceProfileForImageBuilder
* arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

If you try and attach a policy outside of this list, you'll get an error like:

```
API: iam:AttachRolePolicy User: ... is not authorized to perform: iam:AttachRolePolicy on resource: role api-cluster-2022-05-09-17-46-53-RoleHeadNode-EXNM6B7GER1S because no identity-based policy allows the iam:AttachRolePolicy action
```

To fix this, you can add additional IAM permissions to PCM like so:

1. Go to the [Lambda Console (deeplink)](https://console.aws.amazon.com/lambda/home?#/functions?f0=true&fo=and&k0=functionName&n0=false&o0=%3A&op=and&v0=ParallelClusterFunction) and search for `ParallelClusterFunction`
2. Select the function then `Configuration` > `Permissions` > Click on the role under `Role name`.

![Attach Policies](07-setup-iam/lambda-permissions.jpeg)

3. Select the `AWSXRayDaemonWriteAccess` policy and remove it
4. Select `Add permissions` > `Create inline Policy`

![Attach Policies](07-setup-iam/attach-policies.png)

5. Click on the **JSON** tab and paste in the following policy. Make sure to change `<account-id>` to your aws account id.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
               "iam:AttachRolePolicy",
               "iam:DetachRolePolicy"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:iam::<account-id>:role/parallelcluster/*"
        }
    ]
}
```

6. Click **Review Policy**, give it a name like `pcluster-attach-detach-policies` and click **Save**.
