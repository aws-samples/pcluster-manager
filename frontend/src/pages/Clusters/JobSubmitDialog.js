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
import * as React from 'react';
import { useState, setState, getState, clearState } from '../../store'
import { findFirst, clusterDefaultUser } from '../../util'
import { SubmitJob, PriceEstimate } from '../../model'

// UI Elements
import {
  Alert,
  Box,
  Button,
  ColumnLayout,
  ExpandableSection,
  FormField,
  Header,
  Input,
  Modal,
  Select,
  SpaceBetween,
  Toggle,
} from "@awsui/components-react";

const submitPath = ['app', 'clusters', 'jobSubmit'];

function itemToOption(item) {
  if(!item)
    return;
  const [value, title] = item;
  return {label: <div style={{minWidth: "200px"}}>{title}</div>,
    value: value}
}

function QueueSelect() {
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const queues = getState([...clusterPath, 'config', 'Scheduling', 'SlurmQueues']) || []

  const jobPath = [...submitPath, 'job'];
  let partition = useState([...jobPath, 'partition']);

  let queuesOptions = [["[ANY]", "[ANY]"], ...queues.map((q) => [q.Name, q.Name])]

  return (
    <>
      <Header variant="h4"
        description="Queue where the job will run.">Queue</Header>
      <Select
        selectedOption={itemToOption(findFirst(queuesOptions, x => {return x[0] === partition}) || ["[ANY]", "[ANY]"])}
        onChange={({detail}) => {
          if(detail.selectedOption.value === "[ANY]")
          {
            clearState([...jobPath, 'partition'])
          } else {
            setState([...jobPath, 'partition'], detail.selectedOption.value);
          }
        }}
        options={queuesOptions.map(itemToOption)}
        selectedAriaLabel="Selected"/>
    </>
  );
}

function JobCostEstimate() {
  const jobRuntimePath = [...submitPath, 'jobRuntime'];
  const priceEstimatePath = [...submitPath, 'priceEstimate'];
  const priceEstimate = useState(priceEstimatePath);
  const costEstimatePendingPath = [...submitPath, 'costEstimatePending'];

  const costEstimatePending = useState(costEstimatePendingPath);

  const jobRuntime = useState(jobRuntimePath);
  const jobPath = [...submitPath, 'job'];
  const nodes = useState([...jobPath, 'nodes']);

  const costEstimatePath = [...submitPath, 'costEstimate'];
  const costEstimate = useState(costEstimatePath);

  const errorsPath = [...submitPath, 'errors', 'costEstimate'];
  const errors = useState(errorsPath);

  const estimateCost = () => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    const queueName = getState([...jobPath, 'partition']);
    setState(costEstimatePendingPath, true);
    const callback = (data) => {
      clearState(errorsPath);
      clearState(costEstimatePendingPath);
      setState(priceEstimatePath, data.estimate);
      setState(costEstimatePath, data.estimate * jobRuntime * nodes)
    }
    const failure = (data) => {
      clearState(costEstimatePendingPath);
      setState(errorsPath, data.message);
    }
    if(!queueName || queueName === "[ANY]")
    {
      setState(errorsPath, "Error: You must select a queue.");
      clearState(costEstimatePendingPath);
    } else if(!nodes || nodes === '')
    {
      setState(errorsPath, "Error: You must select a node count.");
      clearState(costEstimatePendingPath);
    } else if(!jobRuntime || jobRuntime === '')
    {
      setState(errorsPath, "Error: You must select a job runtime.");
      clearState(costEstimatePendingPath);
    } else {
      PriceEstimate(clusterName, queueName, callback, failure);
    }
  }

  return <>
    <Alert visible header="Experimental!">
      This provides a basic cost estimate based on the expected job run-time, the number of nodes and their instance type. Actual costs will vary based on node uptime, storage, and other factors. Please refer to Cost Explorer for actual cluster costs.
    </Alert>
    <div style={{marginTop: "10px"}}>
      <FormField errorText={errors}>
        Your estimate of the total runtime of the job (in Hours).
        <SpaceBetween direction="horizontal" size="s" key="command">
          <div style={{flexGrow: 1}}>
            <Input
              onChange={({ detail }) => {setState(jobRuntimePath, detail.value);}}
              value={jobRuntime}
              inputMode='numeric'
              placeholder={'2.5'}
            />
          </div>
          <Button loading={costEstimatePending} onClick={estimateCost}>Estimate</Button>
        </SpaceBetween>
      </FormField>
      {costEstimate && <FormField>Estimated job cost: ${costEstimate.toFixed(2)}</FormField>}
      {costEstimate && <pre>Price ($/h) * Time (h) * NodeCount =&gt; {priceEstimate} * {jobRuntime} * {nodes}</pre>}
    </div>
  </>
}

export default function JobSubmitDialog({submitCallback}) {
  const open = useState([...submitPath, 'dialog']);
  const error = useState([...submitPath, 'error']);
  const jobPath = [...submitPath, 'job'];

  const job = useState(jobPath);
  const submitting = useState([...submitPath, 'pending']);
  let jobName = useState([...jobPath, 'job-name']);
  let chdir = useState([...jobPath, 'chdir']);
  let nodes = useState([...jobPath, 'nodes']);
  let ntasks = useState([...jobPath, 'ntasks']);
  let command = useState([...jobPath, 'command']);
  let wrap = useState([...jobPath, 'wrap']) || false;

  const submitJob = () => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    const success_callback = () => {
      setState([...submitPath, 'dialog'], false);
      setState([...submitPath, 'pending'], false);
      submitCallback && submitCallback();
    }
    const failure_callback = (message) => {
      setState([...submitPath, 'error'], message)
      setState([...submitPath, 'pending'], false);
    }
    setState([...submitPath, 'pending'], true);
    SubmitJob(headNode.instanceId, user, job, success_callback, failure_callback)
  };

  const cancel = () => {
    setState([...submitPath, 'dialog'], false)
  };

  const enableWrap = (enable) => {
    setState([...jobPath, 'wrap'], enable);
  }

  return (
    <Modal
      onDismiss={cancel}
      visible={open}
      closeAriaLabel="Close modal"
      size="medium"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={cancel}>Cancel</Button>
            <Button loading={submitting} onClick={submitJob} autoFocus>Submit</Button>
          </SpaceBetween>
        </Box>
      }
      header="Submit Job">
      <SpaceBetween direction="vertical" size="m">
      <ColumnLayout columns={2} borders="vertical">
        <SpaceBetween direction="vertical" size="xxs" key="job-name">
          <Header variant="h2"
            description="Please choose an identifier for this job.">
            Job Name
          </Header>
          <FormField>
            <Input
              onChange={({ detail }) => {setState([...jobPath, 'job-name'], detail.value);}}
              value={jobName}
              placeholder="job-name"
            />
          </FormField>
        </SpaceBetween>

        <SpaceBetween direction="vertical" size="xxs" key="chdir">
          <Header variant="h2"
            description="Please choose a working directory for the job [optional]">
            Working Directory
          </Header>
          <FormField>
            <Input
              onChange={({ detail }) => {setState([...jobPath, 'chdir'], detail.value);}}
              value={chdir}
              placeholder="/home/ec2-user/"
            />
          </FormField>
        </SpaceBetween>

        <SpaceBetween direction="vertical" size="xxs" key="nodes">
          <Header variant="h2"
            description="Number of nodes for job [optional]">
            Nodes
          </Header>
          <FormField>
            <Input
              onChange={({ detail }) => {setState([...jobPath, 'nodes'], detail.value);}}
              value={nodes}
              inputMode='numeric'
              placeholder="0"
            />
          </FormField>
        </SpaceBetween>

        <SpaceBetween direction="vertical" size="xxs" key="ntasks">
          <Header variant="h2"
            description="Number of tasks for job [optional]">
            Number of tasks
          </Header>
          <FormField>
            <Input
              onChange={({ detail }) => {setState([...jobPath, 'ntasks'], detail.value);}}
              value={ntasks}
              inputMode='numeric'
              placeholder="0"
            />
          </FormField>
        </SpaceBetween>

        <QueueSelect />

        <Toggle checked={wrap} onChange={({detail}) => enableWrap(!wrap)}>Run a Command (instead of script)</Toggle>

        <SpaceBetween direction="vertical" size="xxs" key="command">
          <Header variant="h2"
            description= { wrap ? "The command to run as a part of this job." : "Path to the script to run."}>
            {wrap ? "Command" : "Script Path"}
          </Header>
          <FormField>
            <Input
              onChange={({ detail }) => {setState([...jobPath, 'command'], detail.value);}}
              value={command}
              placeholder={ wrap ? "sleep 30" : "/home/ec2-user/myscript.sbatch"}
            />
          </FormField>
        </SpaceBetween>
      </ColumnLayout>
      <ExpandableSection header="Cost estimate">
        <JobCostEstimate />
      </ExpandableSection>
      </SpaceBetween>
      <div style={{color: 'red', marginTop: "20px"}}>{(error || "").split('\n').map((line, i) => <div key={i}>{line}</div>)}</div>
    </Modal>
  );
}
