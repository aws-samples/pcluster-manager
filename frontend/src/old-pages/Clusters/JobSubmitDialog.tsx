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
import { useTranslation } from 'react-i18next';
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
  RadioGroup,
  Select,
  SpaceBetween,
} from "@awsui/components-react";

const submitPath = ['app', 'clusters', 'jobSubmit'];
const jobPath = [...submitPath, 'job'];

function itemToOption([value, title]: [string, string]) {
  return {label: title, value: value}
}

function QueueSelect() {
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const queues = getState([...clusterPath, 'config', 'Scheduling', 'SlurmQueues']) || []

  const jobPath = [...submitPath, 'job'];
  let partition = useState([...jobPath, 'partition']);

  let queuesOptions = [["[ANY]", "[ANY]"], ...queues.map((q: any) => [q.Name, q.Name])]

  return <>
    {/* @ts-expect-error TS(2322) FIXME: Type '"h4"' is not assignable to type 'Variant | u... Remove this comment to see the full error message */}
    <Header variant="h4"
      description="Queue where the job will run.">Queue</Header>
    <Select
      selectedOption={itemToOption(findFirst(queuesOptions, (x: any) => {return x[0] === partition}) || ["[ANY]", "[ANY]"])}
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
  </>;
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
    const callback = (data: any) => {
      clearState(errorsPath);
      clearState(costEstimatePendingPath);
      setState(priceEstimatePath, data.estimate);
      setState(costEstimatePath, data.estimate * jobRuntime * nodes)
    }
    const failure = (data: any) => {
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

interface JobFieldProps {
  header: string;
  description: string;
  placeholder: string;
  property: string;
}

function JobField({
  header,
  description,
  placeholder,
  property
}: JobFieldProps) {
  return <>
    <SpaceBetween direction="vertical" size="xxs" key={property}>
      <Header 
        variant="h2" 
        description={description}>
        {header}
      </Header>
      <FormField>
        <Input 
          onChange={({ detail }) => {setState([...jobPath, property], detail.value);}}
          value={useState([...jobPath, property])}
          placeholder={placeholder}
        />
      </FormField>
    </SpaceBetween>
  </>
}

export default function JobSubmitDialog({
  submitCallback
}: any) {
  const { t } = useTranslation();
  const open = useState([...submitPath, 'dialog']);
  const error = useState([...submitPath, 'error']);
  const clusterName = getState(['app', 'clusters', 'selected']);

  const job = useState(jobPath);
  const submitting = useState([...submitPath, 'pending']);
  const jobType: string = useState([...submitPath, 'job-entry']) || 'command';

  React.useEffect(() => setState([...jobPath, 'wrap'], true), []);

  let isMemBasedSchedulingEnabled = useState(
      ['clusters', 'index', clusterName, 'config', 'Scheduling', 'SlurmSettings', 'EnableMemoryBasedScheduling']
  ) || false;

  const jobTypeSelect = (detail: string) => {
    setState([...submitPath, 'job-entry'], detail)
    detail === 'command' ? setState([...jobPath, 'wrap'], true) : clearState([...jobPath, 'wrap']);
  }

  const jobTypeHeader = {
    'command': "Command",
    'file': "Script Path"
  }[jobType]

  const jobTypeDescription = {
    'command': "The command to run as a part of this job.",
    'file': "Path to the script to run."
  }[jobType]

  const jobTypePlaceholder = {
    'command': "sleep 30",
    'file': "/home/ec2-user/myscript.sbatch"
  }[jobType]

  const submitJob = () => {
    const clusterPath = ['clusters', 'index', clusterName];
    const cluster = getState(clusterPath);
    let user = clusterDefaultUser(cluster);
    const headNode = getState([...clusterPath, 'headNode']);
    const success_callback = () => {
      setState([...submitPath, 'dialog'], false);
      setState([...submitPath, 'pending'], false);
      submitCallback && submitCallback();
    }
    const failure_callback = (message: any) => {
      setState([...submitPath, 'error'], message)
      setState([...submitPath, 'pending'], false);
    }
    setState([...submitPath, 'pending'], true);
    SubmitJob(headNode.instanceId, user, job, success_callback, failure_callback)
  };

  const cancel = () => {
    setState([...submitPath, 'dialog'], false)
  };

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
            <Button loading={submitting} onClick={submitJob}>Submit</Button>
          </SpaceBetween>
        </Box>
      }
      header="Submit Job">
      <SpaceBetween direction="vertical" size="m">
      <ColumnLayout columns={2} borders="vertical">
      
        <JobField 
          header="Job Name" 
          description="Please choose an identifier for this job." 
          placeholder="job-name" 
          property='job-name'
        />

        <JobField
          header="Working Directory" 
          description="Please choose a working directory for the job [optional]" 
          placeholder="/home/ec2-user" 
          property='chdir'
        />

        <JobField
          header="Nodes"
          description="Number of nodes for job [optional]"
          placeholder="0"
          property='nodes'
        />

        <JobField
          header="Number of tasks"
          description="Number of tasks for job [optional]"
          placeholder="0"
          property='ntasks'
        />

        { isMemBasedSchedulingEnabled && 
          <JobField
            header={t("JobSubmitDialog.requiredMemory.header")}
            description={t("JobSubmitDialog.requiredMemory.description")}
            placeholder="0"
            property='mem'
          />
        }

        <QueueSelect />

        <RadioGroup 
          onChange={({detail}) => {jobTypeSelect(detail.value);}}
          value={jobType}
          items={[
            {value: "command", label: "Run a command"},
            {value: "file", label: "Run a script on the head node"}
          ]}
        />

        <JobField
          header={jobTypeHeader!}
          description={jobTypeDescription!}
          placeholder={jobTypePlaceholder!}
          property='command'
        />

      </ColumnLayout>
      <ExpandableSection header="Cost estimate">
        <JobCostEstimate />
      </ExpandableSection>
      </SpaceBetween>
      <div style={{color: 'red', marginTop: "20px"}}>{(error || "").split('\n').map((line: any, i: any) => <div key={i}>{line}</div>)}</div>
    </Modal>
  );
}
