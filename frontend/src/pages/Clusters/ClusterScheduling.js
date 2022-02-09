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

import { useState, getState, setState, clearState } from '../../store'
import { QueueStatus, CancelJob } from '../../model'
import { clusterDefaultUser } from '../../util'
import { useCollection } from '@awsui/collection-hooks';

import { useTheme } from '@mui/material/styles';

// UI Elements
import {
  Button,
  Pagination,
  Table,
  TextFilter
} from "@awsui/components-react";

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';

// Components
import EmptyState from '../../components/EmptyState';


function refreshQueues(callback) {
  const clusterName = getState(['app', 'clusters', 'selected']);
  if(clusterName){
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    QueueStatus(clusterName, headNode.instanceId, user, callback);
  }
}

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
  const statusMap = {"CANCELLED": aligned(<CancelIcon />, props.status, theme.palette.error.main),
      "CONFIGURING": aligned(<CircularProgress size={15} color='info' />, props.status, theme.palette.error.main),
    "RUNNING": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function JobActions({job}) {
  let pendingPath = ['app', 'clusters', 'queue', 'action', job.job_id, 'pending'];
  const pending = useState(pendingPath);

  const cancelJob = (jobId) => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    setState(pendingPath, true);
    CancelJob(headNode.instanceId, user, jobId, () => refreshQueues(() => clearState(pendingPath)))
  }

  return (
    <div>
      {job.job_state !== "COMPLETED" &&
      <div>
        <Button loading={pending} onClick={() => {cancelJob(job.job_id)}}>Stop</Button>
      </div>
      }
    </div>
  )
}

export default function ClusterScheduling() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const cluster = useState(['clusters', 'index', clusterName]);
  const cluster_minor = parseInt(cluster.version.split(".")[1]);
  const jobs = useState(['clusters', 'index', clusterName, 'jobs']) || []

  React.useEffect(() => {
    const tick = () => {
      refreshQueues();
    }
    refreshQueues();
    const timerId = setInterval(tick, 10000);
    return () => { clearInterval(timerId); }
  }, [])

  console.log("jobs: ", jobs)

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    jobs,
    {
      filtering: {
        empty: (
          <EmptyState
            title="No jobs"
            subtitle="No jobs to display."
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No jobs match the filters."
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
    {cluster_minor > 0 &&
    <Table
      {...collectionProps}
      trackBy="job_id"
      columnDefinitions={[
        {
          id: "id",
          header: "ID",
          cell: item => item.job_id,
          sortingField: "job_id"
        },
        {
          id: "name",
          header: "name",
          cell: item => item.name,
          sortingField: "name"
        },
        {
          id: "partition",
          header: "partition",
          cell: item => item.partition,
          sortingField: "partition"
        },
        {
          id: "nodes",
          header: "nodes",
          cell: item => item.nodes,
          sortingField: "nodes"
        },
        {
          id: "state",
          header: "state",
          cell: item => <Status status={item.job_state} />,
          sortingField: "job_state"
        },
        {
          id: "actions",
          header: "Actions",
          cell: item => <JobActions job={item} />,
        },
      ]}
      items={items}
      loadingText="Loading jobs..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter jobs"
        />
      }
    />
    }
    {cluster_minor === 0 && <div>Scheduling is only available in clusters with version 3.1.x and greater.</div>}
  </>
}
