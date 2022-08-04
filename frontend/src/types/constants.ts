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

export enum NodeType {
  HeadNode = "HeadNode",
  ComputeNode = "ComputeNode",
}

export enum InstanceState {
  Pending = "pending",
  Running = "running",
  ShuttingDown = "shutting-down",
  Terminated = "terminated",
  Stopping = "stopping",
  Stopped = "stopped",
  }

export enum ComputeFleetStatus {
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

export enum ImageBuildStatus {
  BuildInProgress = "BUILD_IN_PROGRESS",
  BuildFailed = "BUILD_FAILED",
  BuildComplete = "BUILD_COMPLETE",
  DeleteInProgress = "DELETE_IN_PROGRESS",
  DeleteFailed = "DELETE_FAILED",
  DeleteComplete = "DELETE_COMPLETE",
}

export enum ImageBuilderImageStatus {
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

export enum Ec2AmiState {
  Pending = "PENDING",
  Available = "AVAILABLE",
  Invalid = "INVALID",
  Deregistered = "DEREGISTERED",
  Transient = "TRANSIENT",
  Failed = "FAILED",
  Error = "ERROR",
}

export enum ClusterStatus {
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

export enum ValidationLevel {
  Error = "ERROR",
  Info = "INFO",
  Warning = "WARNING",
}

export enum CloudFormationStackStatus {
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

export enum CloudFormationResourceStatus {
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

export  enum JobStateCode {
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
