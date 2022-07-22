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
import { useState, setState, getState, clearState } from '../../store'
import { loadTemplate } from './util'
import { findFirst } from '../../util'
import { GetConfiguration } from '../../model'

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml';

// UI Elements
import {
  Box,
  Container,
  FormField,
  Header,
  Input,
  RadioGroup,
  Select,
  SpaceBetween,
} from "@awsui/components-react";

// Components
import { HiddenUploader } from '../../components/FileChooser'
import Loading from '../../components/Loading'

// Constants
const sourcePath = ['app', 'wizard', 'source'];
const sourceErrorsPath = ['app', 'wizard', 'errors', 'source'];

function copyFrom(sourceClusterName: any)
{
  const loadingPath = ['app', 'wizard', 'source', 'loading'];
  // @ts-expect-error TS(2345) FIXME: Argument of type '(configuration: any) => void' is... Remove this comment to see the full error message
  GetConfiguration(sourceClusterName, (configuration: any) => {
    loadTemplate(jsyaml.load(configuration), () => setState(loadingPath, false));
  });
}

function sourceValidate(suppressUpload = false) {
  let clusterName = getState(['app', 'wizard', 'clusterName']);
  const clusters = getState(['clusters', 'list']) ||  [];
  let clusterNames = new Set(clusters.map((c: any) => c.clusterName))
  let sourceClusterName = getState(['app', 'wizard', 'source', 'selectedCluster']);
  let upload = getState([...sourcePath, 'upload']);
  let source = getState([...sourcePath, 'type']);
  let valid = true;
  const loadingPath = ['app', 'wizard', 'source', 'loading'];

  setState([...sourceErrorsPath, 'validated'], true);


  if(!clusterName || clusterName === "")
  {
    setState([...sourceErrorsPath, 'clusterName'], 'Cluster name must not be blank.');
    valid = false;
  } else if(clusterNames.has(clusterName)) {
    setState([...sourceErrorsPath, 'clusterName'], `Cluster with name ${clusterName} already exists. Please choose a unique name.`);
    valid = false;
  } else if(!/^[a-zA-Z][a-zA-Z0-9-]+$/.test(clusterName)) {
    setState([...sourceErrorsPath, 'clusterName'], `Cluster name ${clusterName} doesn't match the format /^[a-zA-Z][a-zA-Z0-9-]+$/. Please choose a name consisting of only upper and lower-case letters, numbers and dashes.`);
    valid = false;
  } else {
    clearState([...sourceErrorsPath, 'clusterName']);
  }

  if(source === 'cluster' && (!sourceClusterName || sourceClusterName === ''))
  {
    setState([...sourceErrorsPath, 'sourceClusterName'], 'You must select a cluster to copy from.');
    valid = false;
  } else {
    clearState([...sourceErrorsPath, 'sourceClusterName']);
  }

  // Returning false here tells the wizard not to advance
  // which allows us to explicitly control the page if the
  // user selects a file (or stay here if they do not)
  if(valid && (source === 'upload' || source === 'template') && !suppressUpload)
  {
    upload();
    return false;
  }

  // @ts-expect-error TS(2447) FIXME: The '&' operator is not allowed for boolean types.... Remove this comment to see the full error message
  if(valid && (source === 'cluster') & !suppressUpload)
  {
    setState(loadingPath, true);
    copyFrom(sourceClusterName);
    return false;
  }

  return valid;
}

function ClusterSelect() {
  const selectedPath = ['app', 'wizard', 'source', 'selectedCluster'];
  const clusters = useState(['clusters', 'list']) ||  [];
  const selected = useState(selectedPath);
  const errors = useState([...sourceErrorsPath, 'sourceClusterName']);
  let source = useState([...sourcePath, 'type']);
  let validated = useState([...sourceErrorsPath, 'validated']);

  const itemToOption = (item: any) => {
    if(item)
      return {label: item.clusterName, value: item.clusterName}
    else
      return {label: "Please select a cluster."}
  }

  return (
    <FormField errorText={errors}>
      <Select
      disabled = {source !== 'cluster'}
      selectedOption={itemToOption(findFirst(clusters, (x: any) => {return x.clusterName === selected}))}
      onChange={({detail}) => {setState(selectedPath, detail.selectedOption.value); validated && sourceValidate(true);}}
      selectedAriaLabel="Selected"
      options={clusters.map(itemToOption)}
    />
    </FormField>
  );
}

function Source() {
  let clusterName = useState(['app', 'wizard', 'clusterName']) || "";
  let source = useState([...sourcePath, 'type']);
  let validated = useState([...sourceErrorsPath, 'validated']);
  let clusterNameError = useState([...sourceErrorsPath, 'clusterName']);
  const loadingPath = ['app', 'wizard', 'source', 'loading'];
  const loading = useState(loadingPath);

  React.useEffect(() => {
    if(!getState([...sourcePath, 'type']))
      setState([...sourcePath, 'type'], 'wizard');
  }, [])

  const handleUpload = (data: any) => {
    if(source === 'upload') {
      setState(['app', 'wizard', 'page'], 'create');
      setState(['app', 'wizard', 'clusterConfigYaml'], data);
      setState(loadingPath, false);

    } else if(source === 'template')
    {
      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      loadTemplate(jsyaml.load(data))
    }
  }

  return <div>
    {loading ? <Loading />
    :
    <SpaceBetween direction="vertical" size="m">
      <SpaceBetween direction="vertical" size="xxs" key="cluster-name">
          <Header variant="h2"
            description="Please choose an identifier for this cluster. It is suggested to be lower-case and without spaces (e.g. my-cluster)).">
            Cluster Name
          </Header>
        <FormField errorText={clusterNameError}>
          <Input
            onChange={({ detail }) => {setState(['app', 'wizard', 'clusterName'], detail.value); validated && sourceValidate(true)}}
            value={clusterName}
            placeholder="Enter your cluster name"
          />
        </FormField>

      </SpaceBetween>
      <Container header={
        <Header variant="h2"
          description="Please choose the source configuration for the cluster you want to create."
        >Configuration Source
        </Header>
        }
      >
        <SpaceBetween direction="vertical" size="xxs" key="source">
          <RadioGroup
            onChange={({ detail }) => setState([...sourcePath, 'type'], detail.value)}
            value={source}
            items={[
              {
                value: "wizard",
                  label: "Wizard",
                  description: "Choose this to start a new cluster configuration."
              },
              {
                value: "template",
                label: "Template",
                description: "Choose this to use the wizard starting from an existing configuration or template file. This will proceed through the wizard process to allow you to customize any options before creating the cluster."
              },
              {
                value: "cluster",
                label: "From Cluster",
                description: <Box margin={{bottom: "xs"}} >
                  <SpaceBetween direction="vertical" size="xxs">
                    <FormField description="Use an existing cluster as a starting point for the configuration of your new cluster.">
                      <ClusterSelect />
                    </FormField>
                  </SpaceBetween>
                </Box>
              },
              {
                value: "upload",
                label: "Upload a file",
                description: "Choose this if you already have a file you wish to upload. This will proceed directly to the creation step."
              },
            ]}
          />
          <HiddenUploader callbackPath={['app', 'wizard', 'source', 'upload']} handleData={handleUpload} />
        </SpaceBetween>
      </Container>
    </SpaceBetween>
    }
  </div>;
}

export { Source, sourceValidate }
