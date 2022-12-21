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
import {CloudFormationResourceStatus} from '../types/base'
import {
  ClusterStatus,
  ClusterDescription,
  ClusterInfoSummary,
  ComputeFleetStatus,
} from '../types/clusters'
import {InstanceState, Instance, EC2Instance} from '../types/instances'
import {StackEvent} from '../types/stackevents'
import {JobStateCode} from '../types/jobs'
import React from 'react'
import {
  StatusIndicator,
  StatusIndicatorProps,
} from '@cloudscape-design/components'

export type StatusMap = Record<string, StatusIndicatorProps.Type>

function ClusterStatusIndicator({
  cluster,
}: {
  cluster: ClusterInfoSummary | ClusterDescription
}) {
  const {clusterStatus}: {clusterStatus: ClusterStatus} = cluster

  const statusMap: Record<ClusterStatus, StatusIndicatorProps.Type> = {
    CREATE_COMPLETE: 'success',
    CREATE_FAILED: 'error',
    CREATE_IN_PROGRESS: 'in-progress',
    DELETE_FAILED: 'error',
    DELETE_IN_PROGRESS: 'in-progress',
    DELETE_COMPLETE: 'error',
    UPDATE_COMPLETE: 'success',
    UPDATE_FAILED: 'error',
    UPDATE_IN_PROGRESS: 'in-progress',
  }

  return (
    <StatusIndicator type={statusMap[clusterStatus]}>
      {clusterStatus.replaceAll('_', ' ')}
    </StatusIndicator>
  )
}

function JobStatusIndicator({status}: {status: JobStateCode}) {
  const statusMap: Record<JobStateCode, StatusIndicatorProps.Type> = {
    BOOT_FAIL: 'error',
    CANCELLED: 'error',
    COMPLETED: 'success',
    COMPLETING: 'in-progress',
    CONFIGURING: 'loading',
    DEADLINE: 'info',
    FAILED: 'error',
    NODE_FAIL: 'error',
    OUT_OF_MEMORY: 'error',
    PENDING: 'pending',
    PREEMPTED: 'info',
    REQUEUED: 'info',
    REQUEUE_FED: 'info',
    REQUEUE_HOLD: 'info',
    RESIZING: 'info',
    RESV_DEL_HOLD: 'info',
    REVOKED: 'info',
    RUNNING: 'success',
    SIGNALING: 'info',
    SPECIAL_EXIT: 'info',
    STAGE_OUT: 'info',
    STOPPED: 'stopped',
    SUSPENDED: 'stopped',
    TIMEOUT: 'error',
  }

  return (
    <StatusIndicator type={statusMap[status]}>
      {status.replaceAll('_', ' ')}
    </StatusIndicator>
  )
}

function ComputeFleetStatusIndicator({status}: {status: ComputeFleetStatus}) {
  const statusMap: Record<ComputeFleetStatus, StatusIndicatorProps.Type> = {
    START_REQUESTED: 'loading',
    STARTING: 'pending',
    RUNNING: 'success',
    PROTECTED: 'stopped',
    STOP_REQUESTED: 'loading',
    STOPPING: 'stopped',
    STOPPED: 'stopped',
    UNKNOWN: 'info',
    ENABLED: 'success',
    DISABLED: 'stopped',
  }

  return (
    <StatusIndicator type={statusMap[status]}>
      {status.replaceAll('_', ' ')}
    </StatusIndicator>
  )
}

function InstanceStatusIndicator({
  instance,
}: {
  instance: EC2Instance | Instance
}) {
  const statusMap: Record<InstanceState, StatusIndicatorProps.Type> = {
    pending: 'pending',
    running: 'success',
    'shutting-down': 'loading',
    stopped: 'stopped',
    stopping: 'pending',
    terminated: 'stopped',
  }

  return (
    <StatusIndicator type={statusMap[instance.state]}>
      {instance.state.replaceAll('-', ' ').toUpperCase()}
    </StatusIndicator>
  )
}

function StackEventStatusIndicator({
  stackEvent,
  children,
}: {
  stackEvent: StackEvent
  children?: React.ReactNode
}) {
  const statusMap: Record<
    CloudFormationResourceStatus,
    StatusIndicatorProps.Type
  > = {
    CREATE_COMPLETE: 'success',
    CREATE_FAILED: 'error',
    CREATE_IN_PROGRESS: 'in-progress',
    DELETE_COMPLETE: 'success',
    DELETE_FAILED: 'error',
    DELETE_IN_PROGRESS: 'error',
    DELETE_SKIPPED: 'error',
    IMPORT_COMPLETE: 'success',
    IMPORT_FAILED: 'error',
    IMPORT_IN_PROGRESS: 'in-progress',
    IMPORT_ROLLBACK_COMPLETE: 'success',
    IMPORT_ROLLBACK_FAILED: 'error',
    IMPORT_ROLLBACK_IN_PROGRESS: 'in-progress',
    UPDATE_COMPLETE: 'success',
    UPDATE_FAILED: 'error',
    UPDATE_IN_PROGRESS: 'info',
  }
  return (
    <StatusIndicator type={statusMap[stackEvent.resourceStatus]}>
      {stackEvent.resourceStatus.replaceAll('_', ' ')}
      {children}
    </StatusIndicator>
  )
}

export {
  ClusterStatusIndicator,
  ComputeFleetStatusIndicator,
  InstanceStatusIndicator,
  JobStatusIndicator,
  StackEventStatusIndicator,
}
