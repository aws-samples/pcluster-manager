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

export {};

declare global {

  // Instance

  enum InstanceState {
    Pending = "pending",
    Running = "running",
    ShuttingDown = "shutting-down",
    Terminated = "terminated",
    Stopping = "stopping",
    Stopped = "stopped",
  }

  enum NodeType {
    HeadNode = "HeadNode",
    ComputeNode = "ComputeNode",
  }

  type EC2Instance = {
    instanceId: string,
    instanceType: string,
    launchTime: string,
    privateIpAddress: string, // only primary?
    publicIpAddress: string,
    state: InstanceState
  }

  type Instance = {
    instanceId: string,
    instanceType: string,
    launchTime: string,
    nodeType: NodeType,
    privateIpAddress: string, // only primary?
    publicIpAddress?: string,
    queueName?: string,
    state: InstanceState
  }

  // Image

  type ImageId = string

  type Ec2AmiInfo = {
    // EC2 AMI id
    amiId: string,
    // EC2 AMI Tags
    tags: Tags,
    // EC2 AMI name
    amiName: string,
    // EC2 AMI architecture
    architecture: string,
    // EC2 AMI state
    state: Ec2AmiState,
    // EC2 AMI description
    description: string,
  }

  type ImageInfoSummary = {
    // Id of the image.
    imageId: ImageId,
    // Ec2 image information.
    ec2AmiInfo: Ec2AmiInfoSummary,
    // AWS region where the image is built.
    region: Region,
    // ParallelCluster version used to build the image.
    version: Version,
    // ARN of the main CloudFormation stack.
    cloudformationStackArn: string,
    // Status of the image build process.
    imageBuildStatus: ImageBuildStatus,
    // Status of the CloudFormation stack for the image build process.
    cloudformationStackStatus: CloudFormationStackStatus,
  }

  type ImageConfigurationStructure = {
    // URL of the image configuration file.
    url: string,
  }

  // Image configuration as a YAML document
  type ImageConfigurationData = string

  enum ImageBuildStatus {
    BuildInProgress = "BUILD_IN_PROGRESS",
    BuildFailed = "BUILD_FAILED",
    BuildComplete = "BUILD_COMPLETE",
    DeleteInProgress = "DELETE_IN_PROGRESS",
    DeleteFailed = "DELETE_FAILED",
    DeleteComplete = "DELETE_COMPLETE",
  }

  enum ImageBuilderImageStatus {
    Pending = "PENDING",
    Creating = "CREATING",
    Building = "BUILDING",
    Testing = "TESTING",
    Distributing = "DISTRIBUTING",
    Integrating = "INTEGRATING",
    Available = "AVAILABLE",
    Cancelled = "CANCELLED",
    Failed = "FAILED",
    Deprecated = "DEPRECATED",
    Deleted = "DELETED",
  }

  enum Ec2AmiState {
    Pending = "PENDING",
    Available = "AVAILABLE",
    Invalid = "INVALID",
    Deregistered = "DEREGISTERED",
    Transient = "TRANSIENT",
    Failed = "FAILED",
    Error = "ERROR",
  }

  type Ec2AmiInfoSummary = {
    // EC2 AMI id
    amiId: string,
  }

  // Cluster

  // Name of the cluster
  type ClusterName = string

  type SuppressValidatorExpression = string

  type SuppressValidatorsList = SuppressValidatorExpression[]

  type ClusterInfoSummary = {
    // Name of the cluster.
    clusterName: ClusterName,
    // AWS region where the cluster is created.
    region: Region,
    // ParallelCluster version used to create the cluster.
    version: Version,
    // ARN of the main CloudFormation stack.
    cloudformationStackArn: string,
    // Status of the CloudFormation stack provisioning the cluster infrastructure.
    cloudformationStackStatus: CloudFormationStackStatus,
    // Status of the cluster infrastructure.
    clusterStatus: ClusterStatus,
    // Scheduler of the cluster.
    scheduler?: Scheduler,
  }

  type ClusterDescription = {
    // Name of the cluster.
    clusterName: ClusterName,
    // AWS region where the cluster is created.
    region: Region,
    // ParallelCluster version used to create the cluster.
    version: Version,
    // Status of the cluster. Corresponds to the CloudFormation stack status.
    cloudFormationStackStatus: CloudFormationStackStatus,
    // Status of the cluster infrastructure.
    clusterStatus: ClusterStatus,
    // Scheduler of the cluster.
    scheduler: Scheduler,
    // ARN of the main CloudFormation stack.
    cloudformationStackArn: string,
    // Timestamp representing the cluster creation time.
    creationTime: string,
    // Timestamp representing the last cluster update time.
    lastUpdatedTime: string,
    clusterConfiguration: ClusterConfigurationStructure,
    computeFleetStatus: ComputeFleetStatus,
    // Tags associated with the cluster.
    tags: Tags,
    headNode?: EC2Instance,
    // Reason of the failure when the stack is in CREATE_FAILED, UPDATE_FAILED or DELETE_FAILED status.
    failureReason?: string
  }

  enum ClusterStatus {
    CreateInProgress = "CREATE_IN_PROGRESS",
    CreateFailed = "CREATE_FAILED",
    CreateComplete = "CREATE_COMPLETE",
    DeleteInProgress = "DELETE_IN_PROGRESS",
    DeleteFailed = "DELETE_FAILED",
    DeleteComplete = "DELETE_COMPLETE",
    UpdateInProgress = "UPDATE_IN_PROGRESS",
    UpdateComplete = "UPDATE_COMPLETE",
    UpdateFailed = "UPDATE_FAILED",
  }

  enum ComputeFleetStatus {
    StartRequested = "START_REQUESTED",  // works only with Slurm
    Starting = "STARTING",  // works only with Slurm
    Running = "RUNNING",  // works only with Slurm
    Protected = "PROTECTED",  // works only with Slurm
    StopRequested = "STOP_REQUESTED",  // works only with Slurm
    Stopping = "STOPPING",  // works only with Slurm
    Stopped = "STOPPED",  // works only with Slurm
    Unknown = "UNKNOWN",  // works only with Slurm
    Enabled = "ENABLED",  // works only with AWS Batch
    Disabled = "DISABLED",  // works only with AWS Batch
  }

  type ClusterConfigurationStructure = {
    // URL of the cluster configuration file.
    url: string,
  }

  // Cluster configuration as a YAML document
  type ClusterConfigurationData = string

  type ChangeSet = Change[]

  type Change = {
    parameter: string,
    currentValue: string,
    requestedValue: string,
  }

  type Scheduler = {
    type: string,
    metadata: Metadata,
  }

  type Metadata = {
    name: string,
    version: string,
  }

  // Common
  type Region = string

  type Version = string

  // Token to use for paginated requests.
  type PaginationToken = string

  type Tags = Tag[]

  type Tag = {
    // Tag name
    key: string,
    // Tag value
    value: string,
  }

  type ConfigValidationMessage = {
    // Id of the validator.
    id: string,
    // Type of the validator.
    type: string,
    // Validation level
    level: ValidationLevel,
    // Validation message
    message: string,
  }

  type ValidationMessages = ConfigValidationMessage[]

  enum ValidationLevel {
    Error = "ERROR",
    Info = "INFO",
    Warning = "WARNING",
  }

  enum CloudFormationStackStatus {
    CreateComplete = "CREATE_COMPLETE",
    CreateFailed = "CREATE_FAILED",
    CreateInProgress = "CREATE_IN_PROGRESS",
    DeleteComplete = "DELETE_COMPLETE",
    DeleteFailed = "DELETE_FAILED",
    DeleteInProgress = "DELETE_IN_PROGRESS",
    RollbackComplete = "ROLLBACK_COMPLETE",
    RollbackFailed = "ROLLBACK_FAILED",
    RollbackInProgress = "ROLLBACK_IN_PROGRESS",
    UpdateComplete = "UPDATE_COMPLETE",
    UpdateCompleteCleanupInProgress = "UPDATE_COMPLETE_CLEANUP_IN_PROGRESS",
    UpdateInProgress = "UPDATE_IN_PROGRESS",
    UpdateRollbackComplete = "UPDATE_ROLLBACK_COMPLETE",
    UpdateRollbackCompleteCleanupInProgress = "UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS",
    UpdateRollbackFailed = "UPDATE_ROLLBACK_FAILED",
    UpdateRollbackInProgress = "UPDATE_ROLLBACK_IN_PROGRESS",
  }

  type StackStatus = CloudFormationStackStatus

  enum CloudFormationResourceStatus {
    CreateComplete = "CREATE_COMPLETE",
    CreateFailed = "CREATE_FAILED",
    CreateInProgress = "CREATE_IN_PROGRESS",
    DeleteComplete = "DELETE_COMPLETE",
    DeleteFailed = "DELETE_FAILED",
    DeleteInProgress = "DELETE_IN_PROGRESS",
    DeleteSkipped = "DELETE_SKIPPED",
    ImportComplete = "IMPORT_COMPLETE",
    ImportFailed = "IMPORT_FAILED",
    ImportInProgress = "IMPORT_IN_PROGRESS",
    ImportRollbackComplete = "IMPORT_ROLLBACK_COMPLETE",
    ImportRollbackFailed = "IMPORT_ROLLBACK_FAILED",
    ImportRollbackInProgress = "IMPORT_ROLLBACK_IN_PROGRESS",
    UpdateComplete = "UPDATE_COMPLETE",
    UpdateFailed = "UPDATE_FAILED",
    UpdateInProgress = "UPDATE_IN_PROGRESS",
  }

  type StackEventStatus = CloudFormationResourceStatus

  // Instances


  // Logs

  type LogStreamName = string


  type LogEvent = {
    timestamp: string,
    message: string
  }

  type LogEvents = LogEvent[]

  type LogFilterList = LogFilterExpression[]

  type LogFilterExpression = string

  type LogStreams = LogStream[]

  type LogStream = {
    // Name of the log stream.
    logStreamName: string,
    // The creation time of the stream.
    creationTime: string,
    // The time of the first event of the stream.
    firstEventTimestamp: string,
    // The time of the last event of the stream. The lastEventTime value updates on an eventual consistency basis. It typically updates in less than an hour from ingestion, but in rare situations might take longer.
    lastEventTimestamp: string,
    // The last ingestion time.
    lastIngestionTime: string,
    // The sequence token.
    uploadSequenceToken: string,
    // The Amazon Resource Name (ARN) of the log stream.
    logStreamArn: string,
  }

  type StackEvent = {
    // The unique ID name of the instance of the stack.
    stackId: string,
    // The unique ID of this event.
    eventId: string,
    // The name associated with a stack.
    stackName: string,
    // The logical name of the resource specified in the template.
    logicalResourceId: string,
    // The name or unique identifier associated with the physical instance of the resource.
    physicalResourceId: string,
    // Type of resource.
    resourceType: string,
    // Time the status was updated.
    timestamp: string,
    // Current status of the resource.
    resourceStatus: CloudFormationResourceStatus,
    // Success/failure message associated with the resource.
    resourceStatusReason?: string,
    // BLOB of the properties used to create the resource.
    resourceProperties?: string,
    // The token passed to the operation that generated this event.
    clientRequestToken?: string
  }

  type StackEvents = StackEvent[]

  // Jobs

  enum JobStateCode {
    //Job terminated due to launch failure, typically due to a hardware failure ( e.g. unable to boot the node or block and the job can not be requeued).
    BootFail = "BOOT_FAIL",
    //Job was explicitly cancelled by the user or system administrator. The job may or may not have been initiated.
    Cancelled = "CANCELLED",
    //Job has terminated all processes on all nodes with an exit code of zero.
    Completed = "COMPLETED",
    //Job has been allocated resources, but are waiting for them to become ready for use ( e.g. booting).
    Configuring = "CONFIGURING",
    //Job is in the process of completing. Some processes on some nodes may still be active.
    Completing = "COMPLETING",
    //Job terminated on deadline.
    Deadline = "DEADLINE",
    //ob terminated with non-zero exit code or other failure condition.
    Failed = "FAILED",
    //Job terminated due to failure of one or more allocated nodes.
    NodeFail = "NODE_FAIL",
    //Job experienced out of memory error.
    OutOfMemory = "OUT_OF_MEMORY",
    //Job is awaiting resource allocation.
    Pending = "PENDING",
    //Job terminated due to preemption.
    Preempted = "PREEMPTED",
    //Job currently has an allocation.
    Running = "RUNNING",
    //Job is being held after requested reservation was deleted.
    ResvDelHold = "RESV_DEL_HOLD",
    //Job is being requeued by a federation.
    RequeueFed = "REQUEUE_FED",
    //Held job is being requeued.
    RequeueHold = "REQUEUE_HOLD",
    //Completing job is being requeued.
    Requeued = "REQUEUED",
    //Job is about to change size.
    Resizing = "RESIZING",
    //Sibling was removed from cluster due to other cluster starting the job.
    Revoked = "REVOKED",
    //Job is being signaled.
    Signaling = "SIGNALING",
    //The job was requeued in a special state. This state can be set by users, typically in EpilogSlurmctld, if the job has terminated with a particular exit value.
    SpecialExit = "SPECIAL_EXIT",
    //Job is staging out files.
    StageOut = "STAGE_OUT",
    // Job Has An Allocation, But Execution Has Been Stopped With Sigstsignal. Cpus Have Been Retained By This Job.: signal. CPUS have been retained by this job.
    Stopped = "STOPPED",
    //Job has an allocation, but execution has been suspended and CPUs have been released for other jobs.
    Suspended = "SUSPENDED",
    //Job terminated upon reaching its time limit.
    Timeout = "TIMEOUT",
  }

  type AccountingJobSummary = {
    name: string
    nodes: string,
    partition: string,
    state?: {
      current: JobStateCode,
      reason: string
    },
    job_id: string,
    exit_code: {
      return_code: number,
      status: string
    },
    user: string
  }


  type JobSummary = {
    job_id: string,
    job_state: JobStateCode,
    name: string,
    nodes: string,
    partition: string,
    time: string
  }

  type Job = {
    Account: string,
    AccrueTime: string,
    'AllocNode:Sid': string,
    BatchFlag: string,
    BatchHost: string,
    'CPUs/Task': string,
    Command: string,
    Contiguous: string,
    CoreSpec: string,
    Deadline: string,
    DelayBoot: string,
    Dependency: string,
    EligibleTime: string,
    EndTime: string,
    ExcNodeList: string,
    ExitCode: string,
    Features: string,
    GroupId: string,
    JobId: string,
    JobName: string,
    JobState: JobStateCode,
    LastSchedEval: string,
    Licenses: string,
    MCS_label: string,
    MinCPUsNode: string,
    MinMemoryNode: string,
    MinTmpDiskNode: string,
    Network: string,
    Nice: string,
    NodeList: string,
    'NtasksPerN:B:S:C': string,
    NumCPUs: string,
    NumNodes: string,
    NumTasks: string,
    OverSubscribe: string,
    Partition: string,
    Power: string,
    Priority: string,
    QOS: string,
    Reason: string,
    Reboot: string,
    'ReqB:S:C:T': string,
    ReqNodeList: string,
    Requeue: string,
    Restarts: string,
    RunTime: string,
    Scheduler: string,
    SecsPreSuspend: string,
    'Socks/Node': string,
    StartTime: string,
    StdErr: string,
    StdIn: string,
    StdOut: string,
    SubmitTime: string,
    SuspendTime: string,
    TRES: string,
    TimeLimit: string,
    TimeMin: string,
    UserId: string,
    WorkDir: string,
  }

}

