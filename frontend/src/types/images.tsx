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

export type ImageId = string

export type Ec2AmiInfo = {
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

export type ImageInfoSummary = {
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

export type ImageConfigurationStructure = {
  // URL of the image configuration file.
  url: string,
}

// Image configuration as a YAML document
export type ImageConfigurationData = string

export type Ec2AmiInfoSummary = {
  // EC2 AMI id
  amiId: string,
}
