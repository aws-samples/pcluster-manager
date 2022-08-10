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

import { CloudFormationStackStatus, Region, Tags, Version } from './base'
import { EC2Instance } from './instances'

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

export type ClusterName = string

export type SuppressValidatorExpression = string

export type SuppressValidatorsList = SuppressValidatorExpression[]

export type ClusterInfoSummary = {
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

export type ClusterDescription = {
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

export type ClusterConfigurationStructure = {
  // URL of the cluster configuration file.
  url: string,
}

// Cluster configuration as a YAML document
export type ClusterConfigurationData = string

export type ChangeSet = Change[]

export type Change = {
  parameter: string,
  currentValue: string,
  requestedValue: string,
}

export type Scheduler = {
  type: string,
  metadata: Metadata,
}

export type Metadata = {
  name: string,
  version: string,
}
