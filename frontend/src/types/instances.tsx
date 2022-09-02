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

export enum InstanceState {
  Pending = 'pending',
  Running = 'running',
  ShuttingDown = 'shutting-down',
  Terminated = 'terminated',
  Stopping = 'stopping',
  Stopped = 'stopped',
}

export enum NodeType {
  HeadNode = 'HeadNode',
  ComputeNode = 'ComputeNode',
}

export type EC2Instance = {
  instanceId: string
  instanceType: string
  launchTime: string
  privateIpAddress: string // only primary?
  publicIpAddress: string
  state: InstanceState
}

export type Instance = {
  instanceId: string
  instanceType: string
  launchTime: string
  nodeType: NodeType
  privateIpAddress: string // only primary?
  publicIpAddress?: string
  queueName?: string
  state: InstanceState
}
