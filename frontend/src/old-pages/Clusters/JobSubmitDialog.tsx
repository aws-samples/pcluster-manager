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
import { useState, setState, getState, clearState } from '../../store';
import { findFirst, clusterDefaultUser } from '../../util';
import { getScripts } from './util';
import { SubmitJob, SubmitJobScript, PriceEstimate } from '../../model';
import ConfigView from '../../components/ConfigView';
import { Job } from '../../types/jobs';
import FileUploadButton from '../../components/FileChooser'; 

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
  const { t } = useTranslation();
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const queues = getState([...clusterPath, 'config', 'Scheduling', 'SlurmQueues']) || []

  let partition = useState([...jobPath, 'partition']);

  let queuesOptions = [["[ANY]", "[ANY]"], ...queues.map((q: any) => [q.Name, q.Name])]

  return <>
    <Header variant="h2"
      description={t("JobSubmitDialog.queue.description")}>{t("JobSubmitDialog.queue.header")}</Header>
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
  const { t } = useTranslation();
  const jobRuntimePath = [...submitPath, 'jobRuntime'];
  const priceEstimatePath = [...submitPath, 'priceEstimate'];
  const priceEstimate = useState(priceEstimatePath);
  const costEstimatePendingPath = [...submitPath, 'costEstimatePending'];

  const costEstimatePending = useState(costEstimatePendingPath);

  const jobRuntime = useState(jobRuntimePath);
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
      setState(errorsPath, t("JobSubmitDialog.errors.mustSelectQueue"));
      clearState(costEstimatePendingPath);
    } else if(!nodes || nodes === '')
    {
      setState(errorsPath, t("JobSubmitDialog.errors.mustSelectNodes"));
      clearState(costEstimatePendingPath);
    } else if(!jobRuntime || jobRuntime === '')
    {
      setState(errorsPath, t("JobSubmitDialog.errors.mustSelectRuntime"));
      clearState(costEstimatePendingPath);
    } else {
      PriceEstimate(clusterName, queueName, callback, failure);
    }
  }

  return <>
    <Alert visible header={t("JobSubmitDialog.costEstimate.alertHeader")}>
      {t("JobSubmitDialog.costEstimate.alertContent")}
    </Alert>
    <div style={{marginTop: "10px"}}>
      <FormField errorText={errors}>
      {t("JobSubmitDialog.costEstimate.timeEstimateHeader")}
        <SpaceBetween direction="horizontal" size="s" key="command">
          <div style={{flexGrow: 1}}>
            <Input
              onChange={({ detail }) => {setState(jobRuntimePath, detail.value);}}
              value={jobRuntime}
              inputMode='numeric'
              placeholder={'2.5'}
            />
          </div>
          <Button loading={costEstimatePending} onClick={estimateCost}>{t("JobSubmitDialog.costEstimate.button")}</Button>
        </SpaceBetween>
      </FormField>
      {costEstimate && <FormField>{t("JobSubmitDialog.costEstimate.estimatedCost")} ${costEstimate.toFixed(2)}</FormField>}
      {costEstimate && <pre>{t("JobSubmitDialog.costEstimate.formula")} =&gt; {priceEstimate} * {jobRuntime} * {nodes}</pre>}
    </div>
  </>
}

interface JobFieldProps {
  header: string;
  description: string;
  placeholder: string;
  property: string;
  disabled?: boolean;
}

function JobField({
  header,
  description,
  placeholder,
  property,
  disabled=false
}: JobFieldProps) {

  const setStateIfNotEmpty = React.useCallback((value: string) => {
    !value || value === '' ? clearState([...jobPath, property]) : setState([...jobPath, property], value);
  }, [property])

  return <>
    <SpaceBetween direction="vertical" size="xxs" key={property}>
      <Header 
        variant="h2" 
        description={description}>
        {header}
      </Header>
      <FormField>
        <Input 
          onChange={({ detail }) => setStateIfNotEmpty(detail.value)}
          value={useState([...jobPath, property])}
          placeholder={placeholder}
          disabled={disabled}
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
  const error = useState([...submitPath, 'error']) || "";
  const clusterName = getState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = getState(clusterPath);
  const headNode = getState([...clusterPath, 'headNode']);

  const job: Job = useState(jobPath);
  const submitting = useState([...submitPath, 'pending']);
  const jobType: string = useState([...submitPath, 'job-entry']);
  const jobCommand: string = useState([...jobPath, 'command']);

  let isMemBasedSchedulingEnabled = useState(
    [...clusterPath, 'config', 'Scheduling', 'SlurmSettings', 'EnableMemoryBasedScheduling']
  ) || false;

  let isSlurmApiEnabled = getScripts(
    useState([...clusterPath, 'config', 'HeadNode', 'CustomActions'])
  ).includes('slurm-rest-api');

  const isScriptSelected = jobType === 'script';

  const jobTypeSelect = (entryType: string) => {
    setState([...submitPath, 'job-entry'], entryType);
    clearState([...jobPath, 'command']);
    entryType === 'command' ? setState([...jobPath, 'wrap'], true) : clearState([...jobPath, 'wrap']);
    if(entryType === 'script') clearState([...jobPath, 'chdir']);
  }

  const scriptSelectDescription = isSlurmApiEnabled ? "" : t("JobSubmitDialog.jobTypeScript.radioGroupDisabledDescription");

  const jobTypeHeader = {
    'command': t("JobSubmitDialog.jobTypeCommand.header"),
    'file': t("JobSubmitDialog.jobTypeFile.header")
  }[jobType]

  const jobTypeDescription = {
    'command': t("JobSubmitDialog.jobTypeCommand.description"),
    'file': t("JobSubmitDialog.jobTypeFile.description")
  }[jobType]

  const jobTypePlaceholder = {
    'command': "sleep 30",
    'file': "/home/ec2-user/myscript.sbatch",
    'script': jobCommand || "#!/bin/bash\n"
  }[jobType]

  const submitJob = React.useCallback(async () => {
    let user = clusterDefaultUser(cluster);
    const success_callback = () => {
      clearState([...submitPath, 'error']);
      setState([...submitPath, 'dialog'], false);
      setState([...submitPath, 'pending'], false);
      submitCallback && submitCallback();
    }
    const failure_callback = (message: string) => {
      setState([...submitPath, 'error'], message); // TODO: doesn't support translation
      setState([...submitPath, 'pending'], false);
    }
    setState([...submitPath, 'pending'], true);
    const errorMessage = isScriptSelected ? 
      await SubmitJobScript(clusterName, headNode.instanceId, user, job) 
      : 
      await SubmitJob(headNode.instanceId, user, job); 
    errorMessage === "" ? success_callback() : failure_callback(errorMessage);
    errorMessage === "" ? success_callback() : failure_callback(errorMessage);
  }, [cluster, clusterName, headNode.instanceId, isScriptSelected, job, submitCallback]);

  const submitJobIfEntered = React.useCallback(() => {
    const entry = (getState([...jobPath, 'command']) || '').replace(/\n| /gm, '');
    if(entry === '#!/bin/bash' || entry === '') {
      setState([...submitPath, 'error'], t("JobSubmitDialog.errors.emptyJob"));
    } else {
      submitJob();
    }
  }, [submitJob])

  const cancel = () => {
    setState([...submitPath, 'dialog'], false);
    clearState([...submitPath, 'error']);
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
            <Button onClick={cancel}>{t("JobSubmitDialog.cancel")}</Button>
            <Button loading={submitting} onClick={submitJobIfEntered} variant="primary">{t("JobSubmitDialog.submit")}</Button>
          </SpaceBetween>
        </Box>
      }
      header={t("JobSubmitDialog.header")}>
      <SpaceBetween direction="vertical" size="m">
      <ColumnLayout columns={2} borders="vertical">
      
        <JobField 
          header={t("JobSubmitDialog.job-name.header")}
          description={t("JobSubmitDialog.job-name.description")}
          placeholder={t("JobSubmitDialog.job-name.placeholder")}
          property='job-name'
        />

        <JobField
          header={t("JobSubmitDialog.chdir.header")}
          description={t("JobSubmitDialog.chdir.description")}
          placeholder="/home/ec2-user" 
          property='chdir'
          disabled={isScriptSelected}
        />

        <JobField
          header={t("JobSubmitDialog.nodes.header")}
          description={t("JobSubmitDialog.nodes.description")}
          placeholder="0"
          property='nodes'
        />

        <JobField
          header={t("JobSubmitDialog.ntasks.header")}
          description={t("JobSubmitDialog.ntasks.description")}
          placeholder="0"
          property='ntasks'
        />

        { isMemBasedSchedulingEnabled && 
          <JobField
            header={t("JobSubmitDialog.mem.header")}
            description={t("JobSubmitDialog.mem.description")}
            placeholder="0"
            property='mem'
          />
        }

        <QueueSelect />

        <RadioGroup 
          onChange={({detail}) => {jobTypeSelect(detail.value);}}
          value={jobType}
          items={[
            {value: "command", label: t("JobSubmitDialog.jobTypeCommand.radioGroup")},
            {value: "file", label: t("JobSubmitDialog.jobTypeFile.radioGroup")},
            {value: "script", label: t("JobSubmitDialog.jobTypeScript.radioGroup"), disabled: !isSlurmApiEnabled, description: scriptSelectDescription}
          ]}
        />
      </ColumnLayout>

        { isScriptSelected ? 
          <>
          <FileUploadButton handleData={(data: string) => setState([...jobPath, 'command'], data)}/>
          <ConfigView 
            config={jobTypePlaceholder!}
            // language="sh"
            onChange={({ detail }: any) => {
              setState([...jobPath, 'command'], detail.value);
            }}>
          </ConfigView>
          </>
          :
          <JobField
            header={jobTypeHeader!}
            description={jobTypeDescription!}
            placeholder={jobTypePlaceholder!}
            property='command'
          />
        }

      <ExpandableSection header={t("JobSubmitDialog.costEstimate.header")}>
        <JobCostEstimate />
      </ExpandableSection>
      </SpaceBetween>
      <div style={{color: 'red', marginTop: "20px"}}>{error.split('\n').map((line: any, i: any) => <div key={i}>{line}</div>)}</div>
    </Modal>
  );
}
