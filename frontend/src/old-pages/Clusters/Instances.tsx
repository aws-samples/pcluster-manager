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
import { useNavigate } from "react-router-dom"

import { GetClusterInstances, Ec2Action } from '../../model'
import { setState, clearState, useState, getState, consoleDomain } from '../../store'

import { ComputeFleetStatus, NodeType, InstanceState } from '../../types/constants'

// UI Elements
import {
  Button,
  Header,
  Link,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter
} from "@awsui/components-react";

import { useCollection } from '@awsui/collection-hooks';

// Components
import { InstanceStatusIndicator }from "../../components/Status";
import EmptyState from '../../components/EmptyState';
import DateView from '../../components/DateView'

function InstanceActions({
  fleetStatus,
  instance
}: {fleetStatus: ComputeFleetStatus, instance: Instance}) {

  const pending = useState(['app', 'clusters', 'action', 'pending']);
  const clusterName = useState(['app', 'clusters', 'selected']);
  const navigate = useNavigate();
  const logHref = `/clusters/${clusterName}/logs?instance=${instance.instanceId}`;

  const refresh = () => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    clusterName && GetClusterInstances(clusterName, () => clearState(['app', 'clusters', 'action', 'pending']));
  }

  const stopInstance = (instance: Instance) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "stop_instances", refresh);
  }

  const startInstance = (instance: Instance) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "start_instances", refresh);
  }

  return <SpaceBetween direction='horizontal' size='s'>
      {fleetStatus === ComputeFleetStatus.Stopped &&
      <div>
        {instance.nodeType === NodeType.HeadNode && instance.state === InstanceState.Running && <Button loading={pending} onClick={() => {stopInstance(instance)}}>Stop</Button>}
        {instance.nodeType === NodeType.HeadNode && instance.state === InstanceState.Stopped && <Button loading={pending} onClick={() => {startInstance(instance)}}>Start</Button>}
      </div>
      }
      {fleetStatus !== ComputeFleetStatus.Stopped &&
        <div title="Compute Fleet must be stopped.">
          {instance.nodeType === NodeType.HeadNode &&  instance.state === InstanceState.Running && <Button disabled={true}>Stop</Button>}
        </div>
      }
    <Button href={logHref} onClick={(e) => {navigate(logHref); e.preventDefault();}}>Logs</Button>
    </SpaceBetween>
}

export default function ClusterInstances() {

  let defaultRegion = useState(['aws', 'region']) || "";
  const region: Region = useState(['app', 'selectedRegion']) || defaultRegion;

  const clusterName: ClusterName = useState(['app', 'clusters', 'selected']);
  const instances: Instance[] = useState(['clusters', 'index', clusterName, 'instances'])

  const clusterPath = ['clusters', 'index', clusterName];
  const fleetStatus: ComputeFleetStatus = useState([...clusterPath, 'computeFleetStatus']);

  React.useEffect(() => {
    const tick = () => {
      const clusterName = getState(['app', 'clusters', 'selected']);
      clusterName && GetClusterInstances(clusterName);
    }
    const clusterName = getState(['app', 'clusters', 'selected']);
    clusterName && GetClusterInstances(clusterName);
    const timerId = setInterval(tick, 10000);
    return () => { clearInterval(timerId); }
  }, [])

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    instances || [],
    {
      filtering: {
        empty: (
          <EmptyState
            title="No instances"
            subtitle="No instances found."
            action={<span>:(</span>}
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No instances match the filters."
            action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  return <Table {...collectionProps} header={<Header variant="h3" description="" counter={instances && `(${instances.length})`}>
        Instances
      </Header>} trackBy="instanceId" columnDefinitions={[
        {
            id: "id",
            header: "Id",
            cell: instance => <Link external externalIconAriaLabel="Opens in a new tab" href={`${consoleDomain(region)}/ec2/v2/home?region=${region}#InstanceDetails:instanceId=${instance.instanceId}`}>{instance.instanceId}</Link>,
            sortingField: "instanceId"
        },
        {
            id: "instance-type",
            header: "instance",
            cell: instance => instance.instanceType,
            sortingField: "instanceType"
        },
        {
            id: "launch-time",
            header: "Launch",
            cell: instance => <DateView date={instance.launchTime}/>,
            sortingField: "launchTime"
        },
        {
            id: "node-type",
            header: "Type",
            cell: instance => instance.nodeType,
            sortingField: "nodeType"
        },
        {
            id: "private-ip",
            header: "Private IP",
            cell: instance => instance.privateIpAddress,
            sortingField: "privateIpAddress"
        },
        {
            id: "public-ip",
            header: "Public IP",
            cell: instance => instance.publicIpAddress,
            sortingField: "publicIpAddress"
        },
        {
            id: "state",
            header: "State",
            cell: instance => <InstanceStatusIndicator instance={instance} />,
            sortingField: "state"
        },
        {
            id: "actions",
            header: "Actions",
            cell: instance => <InstanceActions fleetStatus={fleetStatus} instance={instance}/>,
        },
    ]} loading={instances === null} items={items} loadingText="Loading instances..." pagination={<Pagination {...paginationProps}/>} filter={<TextFilter {...filterProps} countText={`Results: ${filteredItemsCount}`} filteringAriaLabel="Filter instances"/>}/>;
}
