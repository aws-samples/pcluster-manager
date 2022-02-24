
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
import { useCollection } from '@awsui/collection-hooks';

import { useTheme } from '@mui/material/styles';

import { useState, getState, setState, clearState } from '../../store'

import { SlurmAccounting } from '../../model'
import { clusterDefaultUser, getIn, findFirst } from '../../util'

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';

// Components
import EmptyState from '../../components/EmptyState';

// UI Elements
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  FormField,
  Input,
  Link,
  Modal,
  Select,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter
} from "@awsui/components-react";

// Key:Value pair (label / children)
const ValueWithLabel = ({ label, children }) => (
  <div>
    <Box margin={{ bottom: 'xxxs' }} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
);

function refreshAccounting(args, callback, list) {
  const startTime = getState(['app', 'clusters', 'accounting', 'startTime']);
  const endTime = getState(['app', 'clusters', 'accounting', 'endTime']);
  const queue = getState(['app', 'clusters', 'accounting', 'queue']);

  const clusterName = getState(['app', 'clusters', 'selected']);
  const defaultArgs = (!args || Object.keys(args).length === 0) ? {} : args;

  if(startTime && startTime !== "")
    defaultArgs['S'] = startTime;

  if(endTime && endTime !== "")
    defaultArgs['E'] = endTime;

  if(queue)
    defaultArgs['r'] = queue;

  setState(['app', 'clusters', 'accounting', 'pending'], true);
  const defaultCallback = (data) => {
    if(list)
      setState(['clusters', 'index', clusterName, 'accounting'], data);
    else
      callback && callback(data);
    clearState(['app', 'clusters', 'accounting', 'pending']);
  }
  const failCallback = (data) => {
    console.log("fail: ", data);
    clearState(['app', 'clusters', 'accounting', 'pending']);
  }
  if(clusterName){
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    headNode && SlurmAccounting(clusterName, headNode.instanceId, user, defaultArgs, defaultCallback, failCallback);
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
      "FAILED": aligned(<CancelIcon />, props.status, theme.palette.error.main),
      "CONFIGURING": aligned(<CircularProgress size={15} color='info' />, props.status, theme.palette.info.main),
      "COMPLETED": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
      "SUCCESS": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
    "RUNNING": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function QueueSelect() {
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const queues = getState([...clusterPath, 'config', 'Scheduling', 'SlurmQueues']) || []

  const queuePath = ['app', 'clusters', 'accounting', 'queue'];
  const queue = useState(queuePath)

  let queuesOptions = [["[ANY]", "[ANY]"], ...queues.map((q) => [q.Name, q.Name])]

  let itemToOption = (item) => {
    if(!item)
      return;
    const [value, title] = item;
    return {label: <div style={{minWidth: "200px"}}>{title}</div>,
      value: value}
  }

  return (<>
    <Select
      selectedOption={itemToOption(findFirst(queuesOptions, x => {return x[0] === queue}) || ["[ANY]", "[ANY]"])}
      onChange={({detail}) => {
        if(detail.selectedOption.value === "[ANY]")
          clearState(queuePath)
        else
          setState(queuePath, detail.selectedOption.value);}}
      options={queuesOptions.map(itemToOption)}
      selectedAriaLabel="Selected"/>
  </>);
}

function JobProperties({job}) {
  return <Container>
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Job Id">{job.job_id}</ValueWithLabel>
          <ValueWithLabel label="Cluster">{job.cluster}</ValueWithLabel>
          <ValueWithLabel label="Group">{job.group}</ValueWithLabel>
          <ValueWithLabel label="Time">{getIn(job, ['time', 'elapsed'])}</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="State">{<Status status={getIn(job, ['state', 'current'])} />}</ValueWithLabel>
          <ValueWithLabel label="Name">{job.name}</ValueWithLabel>
          <ValueWithLabel label="Nodes">{job.nodes}</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Queue">{job.partition}</ValueWithLabel>
          <ValueWithLabel label="Return Code">{getIn(job, ['exit_code', 'return_code'])}</ValueWithLabel>
          <ValueWithLabel label="Exit Status">{<Status status={getIn(job, ['exit_code', 'status'])} />}</ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
}

function JobModal() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const open = useState(['clusters', 'index', clusterName, 'accounting', 'dialog']);
  const selectedJob = useState(['clusters', 'index', clusterName, 'accounting', 'selectedJob']);
  const job = useState(['clusters', 'index', clusterName, 'accounting', 'job', selectedJob]);

  const close = () => {
    setState(['clusters', 'index', clusterName, 'accounting', 'dialog'], false)
  };

  return (
    <Modal
      onDismiss={close}
      visible={open}
      closeAriaLabel="Close modal"
      size="large"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={close} autoFocus>Close</Button>
          </SpaceBetween>
        </Box>
      }
      header="Job Info">
      {job && <JobProperties job={job} />}
      {!job && <div>Loading...</div>}
    </Modal>
  );
}

export default function ClusterAccounting() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const accounting = useState(['clusters', 'index', clusterName, 'accounting']);
  const errors = useState(['clusters', 'index', clusterName, 'accounting', 'errors']) || [];

  const pending = useState(['app', 'clusters', 'accounting', 'pending']);
  const startTime = useState(['app', 'clusters', 'accounting', 'startTime']);
  const endTime = useState(['app', 'clusters', 'accounting', 'endTime']);
  const jobs = useState(['clusters', 'index', clusterName, 'accounting', 'jobs']) || []

  React.useEffect(() => {
    refreshAccounting({}, null, true);
  }, [])

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

  const selectJob = (job_id) => {
    refreshAccounting({j: job_id}, (ret) => {
      setState(['clusters', 'index', clusterName, 'accounting', 'dialog'], true);
      setState(['clusters', 'index', clusterName, 'accounting', 'selectedJob'], job_id);
      setState(['clusters', 'index', clusterName, 'accounting', 'job', job_id], ret.jobs[0]);
    }, false)
  }

  return <>
    <JobModal />
    <SpaceBetween direction="vertical" size="s">
      <Button loading={pending} onClick={() => refreshAccounting({}, null, true)}>Refresh</Button>

      <SpaceBetween direction="horizontal" size="s">
        <FormField label="Start Time">
          <Input
            value={startTime}
            placeholder="now-60m"
            onChange={(({detail}) => {setState(['app', 'clusters', 'accounting', 'startTime'], detail.value)})} />
        </FormField>
        <FormField label="End Time">
          <Input
            value={endTime}
            placeholder="now"
            onChange={(({detail}) => {setState(['app', 'clusters', 'accounting', 'endTime'], detail.value)})} />
        </FormField>
        <FormField label="Queue">
          <QueueSelect />
        </FormField>
      </SpaceBetween>
      <SpaceBetween direction="vertical" size="s">
        {errors.map((e) => <div>{e.error}</div>)}
      </SpaceBetween>

      <SpaceBetween direction="vertical" size="s" >
        <Table
          {...collectionProps}
          trackBy="job_id"
          columnDefinitions={[
            {
              id: "id",
                header: "ID",
                cell: item => <Link onFollow={() => selectJob(item.job_id)}>{item.job_id}</Link>,
                sortingField: "job_id"
            },
            {
              id: "name",
              header: "name",
              cell: item => item.name,
              sortingField: "name"
            },
            {
              id: "queue",
              header: "queue",
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
              cell: item => <Status status={getIn(item, ['state','current'])} />,
              sortingField: "job_state"
            }
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
      </SpaceBetween>
    </SpaceBetween>
  </>;
}
