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

import { useTheme } from '@mui/material/styles';

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Components
import EmptyState from '../../components/EmptyState';
import DateView from '../../components/DateView'

function Status(props: any) {
  const theme = useTheme();
  const aligned = (icon: any, text: any, color: any) => <div style={{
    color: color || 'black',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  }}>
    {icon}
    <span style={{display: 'inline-block', paddingLeft: '10px'}}> {text}</span>
  </div>
  const statusMap = {"stopped": aligned(<CancelIcon />, props.status, theme.palette.error.main),
    "running": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function InstanceActions({
  fleetStatus,
  instance
}: any) {

  const pending = useState(['app', 'clusters', 'action', 'pending']);
  const clusterName = useState(['app', 'clusters', 'selected']);
  const navigate = useNavigate();
  const logHref = `/clusters/${clusterName}/logs?instance=${instance.instanceId}`;

  const refresh = () => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    clusterName && GetClusterInstances(clusterName, () => clearState(['app', 'clusters', 'action', 'pending']));
  }

  const stopInstance = (instance: any) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "stop_instances", refresh);
  }

  const startInstance = (instance: any) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "start_instances", refresh);
  }

  return <SpaceBetween direction='horizontal' size='s'>
      {fleetStatus === "STOPPED" &&
      <div>
        {instance.nodeType === 'HeadNode' &&  instance.state === 'running' && <Button loading={pending} onClick={() => {stopInstance(instance)}}>Stop</Button>}
        {instance.nodeType === 'HeadNode' &&  instance.state === 'stopped' && <Button loading={pending} onClick={() => {startInstance(instance)}}>Start</Button>}
      </div>
      }
      {fleetStatus !== "STOPPED" &&
        <div title="Compute Fleet must be stopped.">
          {instance.nodeType === 'HeadNode' &&  instance.state === 'running' && <Button disabled={true}>Stop</Button>}
        </div>
      }
    <Button href={logHref} onClick={(e) => {navigate(logHref); e.preventDefault();}}>Logs</Button>
    </SpaceBetween>
}

export default function ClusterInstances() {

  let defaultRegion = useState(['aws', 'region']) || "";
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  const clusterName = useState(['app', 'clusters', 'selected']);
  const instances = useState(['clusters', 'index', clusterName, 'instances'])

  const clusterPath = ['clusters', 'index', clusterName];
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);

  React.useEffect(() => {
    const tick = () => {
      const clusterName = getState(['app', 'clusters', 'selected']);
      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      clusterName && GetClusterInstances(clusterName);
    }
    const clusterName = getState(['app', 'clusters', 'selected']);
    // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
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
            cell: item => <Link external externalIconAriaLabel="Opens in a new tab" href={`${consoleDomain(region)}/ec2/v2/home?region=${region}#InstanceDetails:instanceId=${(item as any).instanceId}`}>{(item as any).instanceId}</Link>,
            sortingField: "instanceId"
        },
        {
            id: "instance-type",
            header: "instance",
            cell: item => (item as any).instanceType,
            sortingField: "instanceType"
        },
        {
            id: "launch-time",
            header: "Launch",
            cell: item => <DateView date={(item as any).launchTime}/>,
            sortingField: "launchTime"
        },
        {
            id: "node-type",
            header: "Type",
            cell: item => (item as any).nodeType,
            sortingField: "nodeType"
        },
        {
            id: "private-ip",
            header: "Private IP",
            cell: item => (item as any).privateIpAddress,
            sortingField: "privateIpAddress"
        },
        {
            id: "public-ip",
            header: "Public IP",
            cell: item => (item as any).publicIpAddress,
            sortingField: "publicIpAddress"
        },
        {
            id: "state",
            header: "State",
            cell: item => <Status status={(item as any).state} cluster={item}/>,
            sortingField: "state"
        },
        {
            id: "actions",
            header: "Actions",
            cell: item => <InstanceActions fleetStatus={fleetStatus} instance={item}/>,
        },
    ]} loading={instances === null} items={items} loadingText="Loading instances..." pagination={<Pagination {...paginationProps}/>} filter={<TextFilter {...filterProps} countText={`Results: ${filteredItemsCount}`} filteringAriaLabel="Filter instances"/>}/>;
}
