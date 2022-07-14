
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
import Loading from '../../components/Loading'
import HelpTooltip from '../../components/HelpTooltip'

// UI Elements
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  DateRangePicker,
  FormField,
  Header,
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

function refreshAccounting(args: any, callback: any, list: any) {
  const startTime = getState(['app', 'clusters', 'accounting', 'startTime']);
  const endTime = getState(['app', 'clusters', 'accounting', 'endTime']);
  const queue = getState(['app', 'clusters', 'accounting', 'queue']);
  const nodes = getState(['app', 'clusters', 'accounting', 'nodes']);
  const clusterUser = getState(['app', 'clusters', 'accounting', 'user']);
  const jobName = getState(['app', 'clusters', 'accounting', 'jobName']);
  const jobState = getState(['app', 'clusters', 'accounting', 'jobState']);

  const clusterName = getState(['app', 'clusters', 'selected']);
  const defaultArgs = (!args || Object.keys(args).length === 0) ? {} : args;

  if(startTime && startTime !== "")
    defaultArgs['starttime'] = startTime;

  if(endTime && endTime !== "")
    defaultArgs['endtime'] = endTime;

  if(queue)
    defaultArgs['partition'] = queue;

  if(nodes && nodes !== "")
    defaultArgs['nodelist'] = nodes;

  if(jobName && jobName !== "")
    defaultArgs['name'] = jobName;

  if(clusterUser && clusterUser !== "")
    defaultArgs['user'] = clusterUser;

  if(jobState && jobState !== "")
    defaultArgs['state'] = jobState;

  if(list)
    clearState(['clusters', 'index', clusterName, 'accounting', 'jobs'])

  setState(['app', 'clusters', 'accounting', 'pending'], true);
  const defaultCallback = (data: any) => {
    if(list)
      setState(['clusters', 'index', clusterName, 'accounting'], data);
    else
      callback && callback(data);
    clearState(['app', 'clusters', 'accounting', 'pending']);
  }
  const failCallback = (data: any) => {
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
      "FAILED": aligned(<CancelIcon />, props.status, theme.palette.error.main),
      "CONFIGURING": aligned(<CircularProgress size={15} color='info' />, props.status, theme.palette.info.main),
      "COMPLETED": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
      "SUCCESS": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
    "RUNNING": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status}</span>;
}

function JobStateSelect() {
  const jobStates = ['BOOT_FAIL', 'CANCELLED', 'COMPLETED', 'DEADLINE',
    'FAILED', 'NODE_FAIL', 'OUT_OF_MEMORY', 'PENDING', 'PREEMPTED', 'RUNNING',
    'REQUEUED', 'RESIZING', 'REVOKED', 'SUSPENDED', 'TIMEOUT'];
  const jobStatePath = ['app', 'clusters', 'accounting', 'jobState'];
  const jobState = useState(jobStatePath);

  let itemToOption = (item: any) => {
    if(!item)
      return;
    return {label: <div style={{minWidth: "200px"}}>{item}</div>,
      value: item}
  }

  return <>
    <Select
      // @ts-expect-error TS(2322) FIXME: Type '{ label: Element; value: any; } | undefined'... Remove this comment to see the full error message
      selectedOption={itemToOption(findFirst(jobStates, (x: any) => {return x === jobState}) || ["[ANY]"])}
      onChange={({detail}) => {
        if(detail.selectedOption.value === "[ANY]")
          clearState(jobStatePath)
        else
          setState(jobStatePath, detail.selectedOption.value);
        refreshAccounting({}, null, true);
      }}
      // @ts-expect-error TS(2322) FIXME: Type '({ label: Element; value: any; } | undefined... Remove this comment to see the full error message
      options={['[ANY]', ...jobStates].map(itemToOption)}
      selectedAriaLabel="Selected"/>
  </>;
}

function QueueSelect() {
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const queues = getState([...clusterPath, 'config', 'Scheduling', 'SlurmQueues']) || []

  const queuePath = ['app', 'clusters', 'accounting', 'queue'];
  const queue = useState(queuePath)

  let queuesOptions = [["[ANY]", "[ANY]"], ...queues.map((q: any) => [q.Name, q.Name])]

  let itemToOption = (item: any) => {
    if(!item)
      return;
    const [value, title] = item;
    return {label: <div style={{minWidth: "200px"}}>{title}</div>,
      value: value}
  }

  return <>
    <Select
      // @ts-expect-error TS(2322) FIXME: Type '{ label: Element; value: any; } | undefined'... Remove this comment to see the full error message
      selectedOption={itemToOption(findFirst(queuesOptions, (x: any) => {return x[0] === queue}) || ["[ANY]", "[ANY]"])}
      onChange={({detail}) => {
        if(detail.selectedOption.value === "[ANY]")
          clearState(queuePath)
        else
          setState(queuePath, detail.selectedOption.value);
        refreshAccounting({}, null, true);
      }}
      // @ts-expect-error TS(2322) FIXME: Type '({ label: Element; value: any; } | undefined... Remove this comment to see the full error message
      options={queuesOptions.map(itemToOption)}
      selectedAriaLabel="Selected"/>
  </>;
}

function JobStep({
  step
}: any) {
  const reqs = getIn(step, ['tres', 'requested', 'max']) || []
  return (
    <span style={{paddingLeft: "10px"}}>
      {reqs.filter((req: any) => req.type !== 'energy').map((req: any) => <span style={{paddingRight: "10px"}}>{req.type}: {req.count} </span> )}
    </span>
  );
}

function JobSteps({
  job
}: any) {
  const steps = job.steps || [];
  return (
    <div>
      {steps.map((step: any, i: any) => <div style={{paddingLeft: "10px"}}>{i}: <JobStep step={step} /></div>) }
    </div>
  );
}

function CostEstimate({
  job
}: any) {
  return <>
    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
      <span>$ {(getIn(job, ['price_estimate']) * getIn(job, ['allocation_nodes']) * (getIn(job, ['time', 'elapsed']) / 3600.0)).toFixed(5)}</span>
      <HelpTooltip>
        <b>Warning</b>This cost estimate is based on the time the job took, the number of nodes and an estimate of the node cost. It could be inaccurate and is just meant to be an overall estimate.
      </HelpTooltip>
    </div>
  </>
}

function JobProperties({
  job
}: any) {
  console.log(job);
  return <Container>
    <SpaceBetween direction="vertical" size="l">
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Job Id">{job.job_id}</ValueWithLabel>
          <ValueWithLabel label="Cluster">{job.cluster}</ValueWithLabel>
          <ValueWithLabel label="Group">{job.group}</ValueWithLabel>
          <ValueWithLabel label="User">{job.user}</ValueWithLabel>
          <ValueWithLabel label="Time">{getIn(job, ['time', 'elapsed'])} s</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="State">{<Status status={getIn(job, ['state', 'current'])} />}</ValueWithLabel>
          <ValueWithLabel label="Name">{job.name}</ValueWithLabel>
          <ValueWithLabel label="Nodes">{job.nodes}</ValueWithLabel>
          <ValueWithLabel label="Account">{job.account}</ValueWithLabel>
          <ValueWithLabel label="Nodes">{job.allocation_nodes}</ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween direction="vertical" size="l">
          <ValueWithLabel label="Queue">{job.partition}</ValueWithLabel>
          <ValueWithLabel label="Return Code">{getIn(job, ['exit_code', 'return_code'])}</ValueWithLabel>
          <ValueWithLabel label="Exit Status">{<Status status={getIn(job, ['exit_code', 'status'])} />}</ValueWithLabel>
          {getIn(job, ['price_estimate']) && <ValueWithLabel label="Cost Estimate"><CostEstimate job={job} /></ValueWithLabel>}
        </SpaceBetween>
      </ColumnLayout>
      <ValueWithLabel label="Steps">{<JobSteps job={job} />}</ValueWithLabel>
    </SpaceBetween>
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
            {/* @ts-expect-error TS(2322) FIXME: Type '{ children: string; onClick: () => void; aut... Remove this comment to see the full error message */}
            <Button onClick={close} autoFocus>Close</Button>
          </SpaceBetween>
        </Box>
      }
      header={`Job Info: ${job ? job.name : ""}`}>
      {job && <JobProperties job={job} />}
      {!job && <div>Loading...</div>}
    </Modal>
  );
}

export default function ClusterAccounting() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  //const accounting = useState(['clusters', 'index', clusterName, 'accounting']);
  //const errors = useState(['clusters', 'index', clusterName, 'accounting', 'errors']) || [];

  const pending = useState(['app', 'clusters', 'accounting', 'pending']);
  //const startTime = useState(['app', 'clusters', 'accounting', 'startTime']) || '';
  //const endTime = useState(['app', 'clusters', 'accounting', 'endTime']) || '';
  const nodes = useState(['app', 'clusters', 'accounting', 'nodes']) || []
  const user = useState(['app', 'clusters', 'accounting', 'user']) || ''
  const jobName = useState(['app', 'clusters', 'accounting', 'jobName']) || []
  const jobs = useState(['clusters', 'index', clusterName, 'accounting', 'jobs']);

  React.useEffect(() => {
    refreshAccounting({}, null, true);
  }, [])

  const setDateRange = (val: any) => {
    if(!val)
    {
      clearState(['app', 'clusters', 'accounting', 'startTime']);
      clearState(['app', 'clusters', 'accounting', 'endTime']);
    } else {
      if(val.type === 'relative')
      {
        if(val.unit === 'month')
        {
          setState(['app', 'clusters', 'accounting', 'startTime'], `now-${val.amount * 4}weeks`);
          setState(['app', 'clusters', 'accounting', 'endTime'], 'now');
        } else if(val.unit === 'year')
        {
          setState(['app', 'clusters', 'accounting', 'startTime'], `now-${val.amount * 52}weeks`);
          setState(['app', 'clusters', 'accounting', 'endTime'], 'now');
        } else {
          setState(['app', 'clusters', 'accounting', 'startTime'], `now-${val.amount}${val.unit}s`);
          setState(['app', 'clusters', 'accounting', 'endTime'], 'now');
        }
      } else {
        const start = new Date(val.startDate);
        const end = new Date(val.endDate);
        setState(['app', 'clusters', 'accounting', 'startTime'], start.toISOString().substring(0,19));
        setState(['app', 'clusters', 'accounting', 'endTime'], end.toISOString().substring(0,19));
      }
    }
    refreshAccounting({}, null, true);
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

  const selectJob = (job_id: any) => {
    setState(['clusters', 'index', clusterName, 'accounting', 'dialog'], true);
    clearState(['clusters', 'index', clusterName, 'accounting', 'selectedJob']);
    clearState(['clusters', 'index', clusterName, 'accounting', 'job', job_id]);
    refreshAccounting({jobs: job_id}, (ret: any) => {
      setState(['clusters', 'index', clusterName, 'accounting', 'selectedJob'], job_id);
      setState(['clusters', 'index', clusterName, 'accounting', 'job', job_id], ret.jobs[0]);
    }, false)
  }

  const [dateValue, setDateValue] = React.useState(undefined);

  return <>
    <JobModal />
    <SpaceBetween direction="vertical" size="s">
      <Container header={<Header variant="h2" actions={<Button loading={pending} onClick={() => refreshAccounting({}, null, true)}>Refresh</Button>}>Filters</Header>}>
      <SpaceBetween direction="horizontal" size="s">
        <FormField label="Time range filter">
          <div onKeyPress={e => e.key === 'Enter' && refreshAccounting({}, null, true)}>
            {/* @ts-expect-error TS(2345) FIXME: Argument of type 'Value | null' is not assignable ... Remove this comment to see the full error message */}
            <DateRangePicker onChange={({ detail }) => { setDateRange(detail.value); setDateValue(detail.value); }} value={dateValue} relativeOptions={[
        {
            key: "previous-5-minutes",
            amount: 5,
            unit: "minute",
            type: "relative"
        },
        {
            key: "previous-30-minutes",
            amount: 30,
            unit: "minute",
            type: "relative"
        },
        {
            key: "previous-1-hour",
            amount: 1,
            unit: "hour",
            type: "relative"
        },
        {
            key: "previous-6-hours",
            amount: 6,
            unit: "hour",
            type: "relative"
        }
    ]} i18nStrings={{
        todayAriaLabel: "Today",
        nextMonthAriaLabel: "Next month",
        previousMonthAriaLabel: "Previous month",
        customRelativeRangeDurationLabel: "Duration",
        customRelativeRangeDurationPlaceholder: "Enter duration",
        customRelativeRangeOptionLabel: "Custom range",
        customRelativeRangeOptionDescription: "Set a custom range in the past",
        customRelativeRangeUnitLabel: "Unit of time",
        formatRelativeRange: e => {
            const t = 1 === e.amount ? e.unit : `${e.unit}s`;
            return `Last ${e.amount} ${t}`;
        },
        formatUnit: (e, t) => (1 === t ? e : `${e}s`),
        dateTimeConstraintText: "Range must be between 6 - 30 days. Use 24 hour format.",
        relativeModeTitle: "Relative range",
        absoluteModeTitle: "Absolute range",
        relativeRangeSelectionHeading: "Choose a range",
        startDateLabel: "Start date",
        endDateLabel: "End date",
        startTimeLabel: "Start time",
        endTimeLabel: "End time",
        clearButtonLabel: "Clear",
        cancelButtonLabel: "Cancel",
        applyButtonLabel: "Apply"
    }} placeholder="Filter by a date and time range"/>
          </div>
        </FormField>
        <FormField label="Queue">
          <QueueSelect />
        </FormField>
        <FormField label="Job State">
          <JobStateSelect />
        </FormField>
        <FormField label="User">
          <div onKeyPress={e => e.key === 'Enter' && refreshAccounting({}, null, true)}>
          <Input value={user} placeholder="ec2-user" onChange={(({ detail }) => { setState(['app', 'clusters', 'accounting', 'user'], detail.value); })}/>
          </div>
        </FormField>
        <FormField label="Nodes">
          <div onKeyPress={e => e.key === 'Enter' && refreshAccounting({}, null, true)}>
          <Input value={nodes} placeholder="queue0-c5n-large-1" onChange={(({ detail }) => { setState(['app', 'clusters', 'accounting', 'nodes'], detail.value); })}/>
          </div>
        </FormField>
        <FormField label="Job Name">
          <div onKeyPress={e => e.key === 'Enter' && refreshAccounting({}, null, true)}>
          <Input value={jobName} placeholder="job0" onChange={(({ detail }) => { setState(['app', 'clusters', 'accounting', 'jobName'], detail.value); })}/>
          </div>
        </FormField>
      </SpaceBetween>
      </Container>

      {jobs ? <SpaceBetween direction="vertical" size="s">
        <Table {...collectionProps} trackBy={i => `${(i as any).job_id}-${(i as any).name}`} columnDefinitions={[
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
                id: "queue",
                header: "queue",
                cell: item => (item as any).partition,
                sortingField: "partition"
            },
            {
                id: "user",
                header: "user",
                cell: item => (item as any).user,
                sortingField: "user"
            },
            {
                id: "state",
                header: "state",
                cell: item => <Status status={getIn(item, ['state', 'current'])}/>,
                sortingField: "job_state"
            }
        ]} items={items} loadingText="Loading jobs..." pagination={<Pagination {...paginationProps}/>} filter={<TextFilter {...filterProps} countText={`Results: ${filteredItemsCount}`} filteringAriaLabel="Filter jobs"/>}/>
      </SpaceBetween>
        : <div style={{ textAlign: "center", paddingTop: "40px" }}><Loading /></div>}
    </SpaceBetween>
  </>;
}
