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
import React from 'react';
import { Link as InternalLink } from "react-router-dom"
import { useNavigate } from "react-router-dom"

import HelpTooltip from '../components/HelpTooltip'
import { Link, StatusIndicator, StatusIndicatorProps } from "@awsui/components-react";
import { useState } from '../store'

export type StatusMap = Record<string, StatusIndicatorProps.Type>

function ClusterFailedHelp({
  clusterName
}: any) {
  let navigate = useNavigate();

  const clusterPath = ['clusters', 'index', clusterName];
  const headNode = useState([...clusterPath, 'headNode']);
  let href = `/clusters/${clusterName}/logs`;
  let cfnHref = `/clusters/${clusterName}/stack-events?filter=_FAILED`;
  if(headNode)
    href += `?instance=${headNode.instanceId}`

  return <HelpTooltip>
    Stack failed to create, see <InternalLink to={cfnHref}>CloudFormation Stack Events</InternalLink> 
    &nbsp; or &nbsp;
    <Link onFollow={(e) => {navigate(href); e.preventDefault()}}>Cluster Logs</Link>
    &nbsp; to see why.
  </HelpTooltip>
}

export default function Status({
  status,
  cluster,
  statusMapOverrides
}: {status: string, cluster?: any, statusMapOverrides?: StatusMap}) {
  const failedStatuses = new Set(['CREATE_FAILED', 'DELETE_FAILED', 'UPDATE_FAILED']);

  const defaultStatusMap: StatusMap = {'CREATE_IN_PROGRESS': 'in-progress',
    'CREATE_COMPLETE': 'success',
    'CREATE_FAILED': 'error',
    'CANCELLED': 'error',
    'CONFIGURING': 'in-progress',
    'COMPLETING': 'in-progress',
    'COMPLETED': 'success',
    'DELETE_IN_PROGRESS': 'in-progress',
    'DELETE_FAILED': 'error',
    'FAILED': 'error',
    'RUNNING': 'success',
    'STOPPED': 'error',
    'SUCCESS': 'success',
    'STOP_REQUESTED': 'in-progress',
    'UPDATE_FAILED': 'error',
    'UPDATE_IN_PROGRESS': 'in-progress',
    'UNKNOWN': 'error',
    'UPDATE_COMPLETE': 'success'};

  const statusMap: StatusMap = {...defaultStatusMap, ...(statusMapOverrides || {})}

  if(!(status in statusMap))
    return <span>{status ? status.replaceAll("_", " ") : "<unknown>"}</span>

  return <StatusIndicator type={statusMap[status]}>
    {status ? status.replaceAll("_", " ") : "<unknown>"}
    { cluster && failedStatuses.has(status) && <ClusterFailedHelp clusterName={cluster.clusterName} />  }
  </StatusIndicator>
}
