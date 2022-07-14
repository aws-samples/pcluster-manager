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
import { CreateCluster, UpdateCluster, ListClusters, DescribeCluster, notify } from '../../model'

// UI Elements
import {
  Container,
  Header,
  Toggle,
  Spinner,
} from "@awsui/components-react";

// Components
import ValidationErrors from '../../components/ValidationErrors'
import ConfigView from '../../components/ConfigView'

// State
import { setState, getState, useState } from '../../store'

// Constants
const configPath = ['app', 'wizard', 'clusterConfigYaml'];

function handleWarnings(resp) {
  if(!resp.validatonMessages)
    return;

  resp.validatonMessages.forEach((message, i) => {
      notify(message.message, 'warning');
  })
}

function handleCreate(handleClose, navigate) {
  const clusterName = getState(['app', 'wizard', 'clusterName']);
  const editing = getState(['app', 'wizard', 'editing']);
  const disableRollback = getState(['app', 'wizard', 'disableRollback']) || false;
  const forceUpdate = getState(['app', 'wizard', 'forceUpdate']);
  const clusterConfig = getState(configPath) || "";
  const dryRun = false;
  const region = getState(['app', 'wizard', 'config', 'Region']);
  var errHandler = (err) => {setState(['app', 'wizard', 'errors', 'create'], err); setState(['app', 'wizard','pending'], false);}
  var successHandler = (resp) => {
    let href = `/clusters/${clusterName}/stack-events`;
    handleWarnings(resp);

    setState(['app', 'wizard', 'pending'], false);
    DescribeCluster(clusterName)
    setState(['app', 'clusters', 'selected'], clusterName);
    ListClusters();
    handleClose();
    navigate(href);
  }
  setState(['app', 'wizard', 'errors', "create"], null);

  if(editing)
  {
    setState(['app', 'wizard', 'pending'], "Update");
    UpdateCluster(clusterName, clusterConfig, dryRun, forceUpdate, successHandler, errHandler);
  }
  else
  {
    setState(['app', 'wizard', 'pending'], "Create");
    CreateCluster(clusterName, clusterConfig, region, disableRollback, dryRun, successHandler, errHandler);
  }
}

function handleDryRun(handleClose) {
  const clusterName = getState(['app', 'wizard', 'clusterName']);
  const editing = getState(['app', 'wizard', 'editing']);
  const forceUpdate = getState(['app', 'wizard', 'forceUpdate']);
  const clusterConfig = getState(configPath) || '';
  const region = getState(['app', 'wizard', 'config', 'Region']);
  const disableRollback = false;
  const dryRun = true;
  var errHandler = (err) => {setState(['app', 'wizard', 'errors', 'create'], err); setState(['app', 'wizard','pending'], false);}
  var successHandler = (resp) => {
    handleWarnings(resp);
    setState(['app', 'wizard', 'pending'], false);
  }
  setState(['app', 'wizard', 'pending'], "Dry Run");
  setState(['app', 'wizard', 'errors', "create"], null);
  if(editing)
    UpdateCluster(clusterName, clusterConfig, dryRun, forceUpdate, successHandler, errHandler);
  else
    CreateCluster(clusterName, clusterConfig, region, disableRollback, dryRun, successHandler, errHandler);
}

function createValidate() {
  return true;
}

function Create() {
  const clusterConfig = useState(configPath);
  const forceUpdate = useState(['app', 'wizard', 'forceUpdate']) || false;
  const disableRollback = useState(['app', 'wizard', 'disableRollback']) || false;
  const errors = useState(['app', 'wizard', 'errors', 'create']);
  const pending = useState(['app', 'wizard', 'pending']);
  const editing = getState(['app', 'wizard', 'editing']);
  return <Container header={<Header description={`This is the cluster configuration that will be used to ${editing ? 'update' : 'create'} your cluster.`}>Cluster Configuration</Header>}>
    <ConfigView config={clusterConfig} pending={!clusterConfig} onChange={({detail}) => {setState(configPath, detail.value)}} />
    {errors && <ValidationErrors errors={errors} /> }
    {pending && <div><Spinner size="normal" /> {pending} request pending...</div>}
    {editing && <Toggle checked={forceUpdate} onChange={() => setState(['app', 'wizard', 'forceUpdate'], !forceUpdate)}>Force Update: Enable this to perform an update while the ComputeFleet is still running.</Toggle>}
    {!editing && <Toggle checked={disableRollback} onChange={() => setState(['app', 'wizard', 'disableRollback'], !disableRollback)}>Disable Rollback: Enable this to retain resources in the event of creation failure.</Toggle>}
  </Container>
}

export { Create, createValidate, handleCreate, handleDryRun }
