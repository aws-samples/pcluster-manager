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

import { clearState, consoleDomain, getState, setState, ssmPolicy, useState } from '../../store'
import { QueueStatus, CancelJob, JobInfo } from '../../model'
import { clusterDefaultUser, findFirst } from '../../util'
import { useCollection } from '@awsui/collection-hooks';

import { useTheme } from '@mui/material/styles';

// UI Elements
import {
  Button,
  Box,
  ColumnLayout,
  Container,
  Link,
  Modal,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter
} from "@awsui/components-react";

import JobSubmitDialog from './JobSubmitDialog'

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';

// Components
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading'

// Key:Value pair (label / children)
const ValueWithLabel = ({
  label,
  children
}: any) => (
  <div>
    <Box margin={{ bottom: 'xxxs' }} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
);

function refreshQueues(callback: any) {
  const clusterName = getState(['app', 'clusters', 'selected']);
  const region = getState(['aws', 'region']);
  if(clusterName){
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    headNode && region && QueueStatus(clusterName, headNode.instanceId, user, callback);
  }
}

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
  const statusMap = {"CANCELLED": aligned(<CancelIcon />, props.status, theme.palette.error.main),
    "CONFIGURING": aligned(<CircularProgress size={15} color='info' />, props.status, theme.palette.info.main),
    "RUNNING": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function JobActions({
  job,
  disabled,
  cancelCallback
}: any) {
  let pendingPath = ['app', 'clusters', 'queue', 'action', job.job_id, 'pending'];
  const pending = useState(pendingPath);

  const cancelJob = (jobId: any, cancelCallback: any) => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    setState(pendingPath, true);
    CancelJob(headNode.instanceId, user, jobId, () => refreshQueues(() => {clearState(pendingPath); cancelCallback && cancelCallback()}))
  }

  return (
    <div>
      {job.job_state !== "COMPLETED" && job.job_state !== "CANCELLED" &&
      <div>
        <Button loading={pending} disabled={disabled} onClick={() => {cancelJob(job.job_id, cancelCallback)}}>Stop Job</Button>
      </div>
      }
    </div>
  )
}

function FileLink({
  path,
  isFile
}: any) {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;
  const headNode = useState([...clusterPath, 'headNode']);

  const linkPath = isFile ? path.slice(0, path.lastIndexOf('/')) : path;

  return <a href={`${consoleDomain(region)}/systems-manager/managed-instances/${headNode.instanceId}/file-system?region=${region}&osplatform=Linux#%7B%22path%22%3A%22${linkPath}%22%7D`} rel="noreferrer" target="_blank">{path}</a>
}

function JobProperties({
  job
}: any) {
  return <Container>
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Job Id">{job.JobId}</ValueWithLabel>
          <ValueWithLabel label="Job Name">{job.JobName}</ValueWithLabel>
          <ValueWithLabel label="Queue">{job.Partition}</ValueWithLabel>
          <ValueWithLabel label="User Id">{job.UserId}</ValueWithLabel>
          <ValueWithLabel label="Group Id">{job.GroupId}</ValueWithLabel>
          <ValueWithLabel label="Priority">{job.Priority}</ValueWithLabel>
          <ValueWithLabel label="Account">{job.Account}</ValueWithLabel>
          <ValueWithLabel label="State"><Status status={job.JobState} /></ValueWithLabel>
          <ValueWithLabel label="Reason">{job.Reason}</ValueWithLabel>
          <ValueWithLabel label="Requeue">{job.Requeue}</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Node List">{job.NodeList}</ValueWithLabel>
          <ValueWithLabel label="Restarts">{job.Restarts}</ValueWithLabel>
          <ValueWithLabel label="Reboot">{job.Reboot}</ValueWithLabel>
          <ValueWithLabel label="ExitCode">{job.ExitCode}</ValueWithLabel>
          <ValueWithLabel label="RunTime">{job.RunTime}</ValueWithLabel>
          <ValueWithLabel label="TimeLimit">{job.TimeLimit}</ValueWithLabel>
          <ValueWithLabel label="SubmitTime">{job.SubmitTime}</ValueWithLabel>
          <ValueWithLabel label="WorkDir"><FileLink path={job.WorkDir} /></ValueWithLabel>
          <ValueWithLabel label="BatchHost">{job.BatchHost}</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="EndTime">{job.EndTime}</ValueWithLabel>
          <ValueWithLabel label="NumNodes">{job.NumNodes}</ValueWithLabel>
          <ValueWithLabel label="NumCPUs">{job.NumCPUs}</ValueWithLabel>
          <ValueWithLabel label="NumTasks">{job.NumTasks}</ValueWithLabel>
          <ValueWithLabel label="CPUs/Task">{job['CPUs/Task']}</ValueWithLabel>
          <ValueWithLabel label="TRES">{job.TRES}</ValueWithLabel>
          <ValueWithLabel label="Command">{job.Command}</ValueWithLabel>
          <ValueWithLabel label="StdOut"><FileLink path={job.StdOut} isFile={true} /></ValueWithLabel>
          <ValueWithLabel label="StdErr"><FileLink path={job.StdErr} isFile={true} /></ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
}

function JobModal() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);
  const open = useState(['app', 'clusters', 'jobInfo', 'dialog']);
  const job = useState(['app', 'clusters', 'jobInfo', 'data']);

  const close = () => {
    setState(['app', 'clusters', 'jobInfo', 'dialog'], false)
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
            {job && <JobActions job={{job_id: job.JobId, job_state: job.JobState}} disabled={fleetStatus !== "RUNNING"} cancelCallback={close}/>}
            {/* @ts-expect-error TS(2322) FIXME: Type '{ children: string; onClick: () => void; aut... Remove this comment to see the full error message */}
            <Button onClick={close} autoFocus>Close</Button>
          </SpaceBetween>
        </Box>
      }
      header={`Job Info: ${job ? job.JobName : ""}`}>
      {job ? <JobProperties job={job} /> : <div style={{textAlign: "center", paddingTop: "40px"}}><Loading /></div>}
    </Modal>
  );
}

export default function ClusterScheduling() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = useState(clusterPath);
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);
  const clusterMinor = cluster.version ? parseInt(cluster.version.split(".")[1]) : 0;
  const jobs = useState(['clusters', 'index', clusterName, 'jobs']);
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  function isSsmPolicy(p: any) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region);
  }

  const iamPolicies = useState([...clusterPath, 'config', 'HeadNode', 'Iam', 'AdditionalIamPolicies']);
  const ssmEnabled = iamPolicies && findFirst(iamPolicies, isSsmPolicy);

  React.useEffect(() => {
    const tick = () => {
      // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
      clusterMinor > 0 && ssmEnabled && refreshQueues();
    }
    // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
    clusterMinor > 0 && ssmEnabled && refreshQueues();
    const timerId = setInterval(tick, 10000);
    return () => { clearInterval(timerId); }
  }, [])

  const selectJobCallback = (jobInfo: any) => {
    setState(['app', 'clusters', 'jobInfo', 'data'], jobInfo);
  }

  const selectJob = (jobId: any) => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    if(clusterName){
      const clusterPath = ['clusters', 'index', clusterName];
      const cluster = getState(clusterPath);
      let user = clusterDefaultUser(cluster);
      const headNode = getState([...clusterPath, 'headNode']);
      clearState(['app', 'clusters', 'jobInfo', 'data']);
      headNode && setState(['app', 'clusters', 'jobInfo', 'dialog'], true);
      // @ts-expect-error TS(2554) FIXME: Expected 6 arguments, but got 5.
      headNode && JobInfo(clusterName, headNode.instanceId, user, jobId, selectJobCallback);
    }
  }

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    jobs || [],
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


  return <SpaceBetween direction="vertical" size="s">
    <JobModal />
    <JobSubmitDialog submitCallback={refreshQueues}/>
    {ssmEnabled && <Button variant="primary" disabled={fleetStatus !== "RUNNING"} onClick={() => setState(['app', 'clusters', 'jobSubmit', 'dialog'], true)}>Submit Job</Button>}
    {clusterMinor > 0 && ssmEnabled &&
        (jobs ? <Table {...collectionProps} trackBy="job_id" columnDefinitions={[
                {
                    id: "id",
                    header: "ID",
                    cell: item => <Link onFollow={() => selectJob((item as any).job_id)}>{(item as any).job_id}</Link>,
                    sortingField: "job_id"
                },
                {
                    id: "name",
                    header: "name",
                    cell: item => (item as any).name,
                    sortingField: "name"
                },
                {
                    id: "partition",
                    header: "partition",
                    cell: item => (item as any).partition,
                    sortingField: "partition"
                },
                {
                    id: "nodes",
                    header: "nodes",
                    cell: item => (item as any).nodes,
                    sortingField: "nodes"
                },
                {
                    id: "state",
                    header: "state",
                    cell: item => <Status status={(item as any).job_state}/>,
                    sortingField: "job_state"
                },
                {
                    id: "time",
                    header: "time",
                    cell: item => (item as any).time,
                    sortingField: "time"
                },
                {
                    id: "actions",
                    header: "Actions",
                    cell: item => <JobActions disabled={fleetStatus !== "RUNNING"} job={item}/>,
                },
            ]} items={items} loadingText="Loading jobs..." pagination={<Pagination {...paginationProps}/>} filter={<TextFilter {...filterProps} countText={`Results: ${filteredItemsCount}`} filteringAriaLabel="Filter jobs"/>}/> : <div style={{ textAlign: "center", paddingTop: "40px" }}><Loading /></div>)}
    {clusterMinor === 0 && <div>Scheduling is only available in clusters with version 3.1.x and greater.</div>}
    {!ssmEnabled && <div>You must enable SSM to monitor jobs.</div>}
  </SpaceBetween>;
}
