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

import { GetClusterInstances, Ec2Action } from '../../model'
import { setState, clearState, useState, getState } from '../../store'

// UI Elements
import {
  Button,
  Header,
  Link,
  Pagination,
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

function Status(props) {
  const theme = useTheme();
  const aligned = (icon, text, color) => <div style={{
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
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function InstanceActions({fleetStatus, instance}) {

  const pending = useState(['app', 'clusters', 'action', 'pending']);

  const refresh = () => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    clusterName && GetClusterInstances(clusterName, () => clearState(['app', 'clusters', 'action', 'pending']));
  }

  const stopInstance = (instance) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "stop_instances", refresh);
  }

  const startInstance = (instance) => {
    setState(['app', 'clusters', 'action', 'pending'], true);
    Ec2Action([instance.instanceId], "start_instances", refresh);
  }

  return (
    <div>
      {fleetStatus === "STOPPED" &&
      <div>
        {instance.nodeType === 'HeadNode' &&  instance.state === 'running' && <Button loading={pending} onClick={() => {stopInstance(instance)}}>Stop</Button>}
        {instance.nodeType === 'HeadNode' &&  instance.state === 'stopped' && <Button loading={pending} onClick={() => {startInstance(instance)}}>Start</Button>}
      </div>
      }
    </div>
  )
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

  return <>
    <Header
      variant="h3"
      description=""
      counter={ instances && `(${instances.length})` }>
      Instances
    </Header>
    <Table
      {...collectionProps}
      trackBy="instanceId"
      columnDefinitions={[
        {
          id: "id",
          header: "Id",
          cell: item => <Link
              external
              externalIconAriaLabel="Opens in a new tab"
              href={`https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#InstanceDetails:instanceId=${item.instanceId}`}
            >{item.instanceId}</Link>,
          sortingField: "instanceId"
        },
        {
          id: "instance-type",
          header: "instance",
          cell: item => item.instanceType,
          sortingField: "instanceType"
        },
        {
          id: "launch-time",
          header: "Launch",
          cell: item => <DateView date={item.launchTime} />,
          sortingField: "launchTime"
        },
        {
          id: "node-type",
          header: "Type",
          cell: item => item.nodeType,
          sortingField: "nodeType"
        },
        {
          id: "private-ip",
          header: "Private IP",
          cell: item => item.privateIpAddress,
          sortingField: "privateIpAddress"
        },
        {
          id: "public-ip",
          header: "Public IP",
          cell: item => item.publicIpAddress,
          sortingField: "publicIpAddress"
        },
        {
          id: "state",
          header: "State",
          cell: item => <Status status={item.state} />,
          sortingField: "state"
        },
        {
          id: "actions",
          header: "Actions",
          cell: item => <InstanceActions fleetStatus={fleetStatus} instance={item} />,
        },
      ]}
      loading={instances === null}
      items={items}
      loadingText="Loading instances..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter instances"
        />
      }
    />
  </>
}
