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
import { CloudFormationResourceStatus } from './base'

export  type StackEvent = {
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

export type StackEvents = StackEvent[]
