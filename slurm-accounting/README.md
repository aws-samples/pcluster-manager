# Slurm Job Accounting

The code here will set up a basic AWS ParallelCluster with Slurm job accounting enabled.

## VPC and Database Setup

A CloudFormation stack has been provided for setting up the required infrastructure. Included in the stack:

* **`accounting-cluster-template.yaml`** - A top-level template for creating the VPC stack and RDS stack.
* **`vpc-template.yaml`** - Creates networking resources for the cluster. Key features:
   * Public subnet for head node
   * Private subnet for compute nodes
   * NAT Gateway
   * VPC flow logs
* **`slurmdb-template.yaml`** Creates a manged RDS instance with the following options:
   * MySQL or MariaDB database engine
   * Subnet group (if multi-AZ is
   * Security group (to be used by ParallelCluster)
* A user name and password for the database are generated and stored in AWS Secrets Manager.

You will need to store the stack templates files in an accessible location, such as an S3 bucket or git repo. The top-level
template has a parameter, `TemplateRootUrl`, that can be specified to point to the location of the templates.

To deploy the job-accounting CloudFormation template:

```
aws cloudformation create-stack \
  --region <region>\
  --template-url <url of top-level template>
  --stack-name <stack name>
  --capabilities CAPABILITY_NAMED_IAM
```

Example:

```
aws cloudformation create-stack \
  --region eu-west-1 \
  --stack-name test \
  --template-url https://test-bucket.s3.eu-west-1.amazonaws.com/accounting-cluster-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

The stack has a number of options that can be configured, including the option for create the VPC or using
an exisiting VPC. You can also configure options for the Slurm database, including the engine, RDS instance class, and
storage size.
The default parameters should be sufficient for most users, but if you wish to override any, please review the CloudFormation
template for the different options available.

The stack will take several minutes to deploy, and once complete, a number of outputs are available to use in a ParallelCluster
configuration file (e.g. RDS endpoint, Slurm DB security group). A script is also provided to generate a basic cluster configuration
file.

### AWS ParallelCluster

The `generate-config.sh` script can be used to generate a basic ParallelCluster configuration that will incorporate the resources created in
the previous CloudFormation stack. To use it:

```
cd pcluster

./generate-config.sh \
  --region <region> \
  --stack-name <name of CF stack from the previous step> \
  --config-bucket <s3 bucket name where configuration files are stored> \
  --aws-key <ssh key>
```

**TODO**
Fix the s3 bucket url to be more flexible (e.g. git url)

The script takes a cluster configuration template, `cluster-config.yaml.template`, and generates a configuration file that may
be used to deploy a basic cluster. Alternatively, users can create their configuration and use the template here as a guide.

The key points to note in the cluster template file are:

* **`AdditionalSecurityGroups:`**
  A security group was created in the CloudFormation stack and assigned to the RDS instance. We need to add this to the cluster
  head node to enable it to access the RDS instance.
* **`Iam:`**
  * **`S3Access:`**
    This examples assumes that the user is using an S3 bucket to store all of the CloudFormation templates, and ParallelCluster configuration files.
    As such, we need to all the head node to reach this bucket as part of the post-install process.
  * **`AdditionalIamPolicies:`**
    The main policy we've added here is `SecretsManagerReadWrite`. The stack above created a username and password for the database, which is then stored in
    AWS Secrets Manager. This policy allows the cluster head node to access this secret.
 * **`CustomActions:`**
   A post-install script is run to configure Slurm to make use of the created database for job accounting. The script uses the
   the same configuration bucket to pull down Slurm configuration files, the secret ID to injet the username and password, and the RDS
   endpoint and port.

Once the ParallelCluster configuration file has been generated, you can create the cluster as you normally would:

```
pcluster create-cluster -c cluster-config.yaml -n accounting-demo-cluster
```

###Slurm Job Accounting

Once the cluster has been created, log in and verfiy that job accounting has been configured:

```
sacctmgr list cluster

   Cluster     ControlHost  ControlPort   RPC     Share GrpJobs       GrpTRES GrpSubmit MaxJobs       MaxTRES MaxSubmit     MaxWall                  QOS   Def QOS
   ---------- --------------- ------------ ----- --------- ------- ------------- --------- ------- ------------- --------- ----------- -------------------- ---------
   parallelc+       10.0.0.43         6820  9472         1                                                                                           normal
```

If you encounter any errors you can check the log files `/var/log/slurmctld.log` and `/var/log/slurmdbd.log`

**TODO**
Slurm job accounting tutorial, extracting job history, generating reports
