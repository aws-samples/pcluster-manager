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

import jsyaml from 'js-yaml';

// UI Elements
import {
  Box,
  Button,
  Header,
  Modal,
  SpaceBetween,
} from "@awsui/components-react";

// SubPages
import { Source, sourceValidate } from './Source';
import { Cluster, clusterValidate } from './Cluster';
import { HeadNode, headNodeValidate } from './HeadNode';
import { MultiUser, multiUserValidate } from './MultiUser';
import { Storage, storageValidate } from './Storage';
import { Queues, queuesValidate } from './Queues'
import { Create, createValidate, handleCreate as wizardHandleCreate, handleDryRun as wizardHandleDryRun } from './Create'

// Components
import { stopComputeFleet } from '../Clusters/StopDialog'
import Loading from '../../components/Loading'

// State
import { setState, useState, getState, clearState } from '../../store'
import { LoadAwsConfig } from '../../model'

// Icons
import CancelIcon from '@mui/icons-material/Cancel';

export default function WizardDialog(props) {
  const open = useState(['app', 'wizard', 'dialog']);
  const loadingPath = ['app', 'wizard', 'source', 'loading'];
  const loading = useState(loadingPath);
  const page = useState(['app', 'wizard', 'page']) || 'source';
  const clusterName = useState(['app', 'wizard', 'clusterName']);
  const [ refreshing, setRefreshing ] = React.useState(false);
  const aws = useState(['aws']);
  let multiUserEnabled = useState(['app', 'wizard', 'multiUser']);

  const clusterPath = ['clusters', 'index', clusterName];
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);

  const editing = useState(['app', 'wizard', 'editing']);

  const pages = ['source', 'cluster', 'headNode', 'storage', 'queues', 'create'];

  const handleClose = (clear) => {
    if(clear)
    {
      clearState(['app', 'wizard', 'config']);
      clearState(['app', 'wizard', 'clusterConfigYaml']);
      clearState(['app', 'wizard', 'clusterName']);
      clearState(['app', 'wizard', 'loaded']);
      clearState(['app', 'wizard', 'page']);
      clearState(['app', 'wizard', 'vpc']);
      clearState(['app', 'wizard', 'multiUser']);
      clearState(loadingPath);
    }
    setState(['app', 'wizard', 'dialog'], false);
    clearState(['app', 'wizard', 'errors']);
  };

  const validators = {
    source: sourceValidate,
    cluster: clusterValidate,
    headNode: headNodeValidate,
    multiUser: multiUserValidate,
    storage: storageValidate,
    queues: queuesValidate,
    create: createValidate,
  }

  const handleNext = () => {
    let config = getState(['app', 'wizard', 'config']);
    let currentPage = getState(['app', 'wizard', 'page']);

    // Run the validators corresponding to the page we are on
    if(validators[currentPage] && !validators[currentPage]())
      return;

    if(currentPage === "create")
    {
      wizardHandleCreate(() => handleClose(true));
      return;
    }

    if(currentPage === 'cluster' && multiUserEnabled)
    {
      setState(['app', 'wizard', 'page'], 'multiUser');
      return;
    }

    if(currentPage === 'multiUser') {
      setState(['app', 'wizard', 'page'], 'headNode');
      return;
    }

    for(let i = 0; i < pages.length; i++)
       if(pages[i] === currentPage) {
        let nextPage = pages[i + 1];

        if(nextPage === "create")
        {
          console.log(jsyaml.dump(config));
          setState(['app', 'wizard', 'clusterConfigYaml'], jsyaml.dump(config));
        }
        setState(['app', 'wizard', 'page'], nextPage);
        return;
      }
  }

  const handlePrev = () => {
    setState(['app', 'wizard', 'errors'], null);
    let currentPage = getState(['app', 'wizard', 'page']);
    let source = getState(['app', 'wizard', 'source', 'type']);

    // Special case where the user uploaded a file, hitting "back"
    // goes back to the upload screen rather than through the wizard
    if(currentPage === 'create' && source === 'upload')
    {
      setState(['app', 'wizard', 'page'], 'source');
      return;
    }

    if(currentPage === 'multiUser')
    {
      setState(['app', 'wizard', 'page'], 'cluster');
      return;
    }

    if(currentPage === 'headNode' && multiUserEnabled)
    {
      setState(['app', 'wizard', 'page'], 'multiUser');
      return;
    }

    for(let i = 1; i < pages.length; i++)
      if(pages[i] === currentPage)
      {
        let prevPage = pages[i - 1];
        setState(['app', 'wizard', 'page'], prevPage);
        return;
      }
  }

  const handleDryRun = () => {
    wizardHandleDryRun();
  }

  const handleRefresh = () => {
    setRefreshing(true);
    let region = getState(['wizard', 'region']);
    let chosenRegion = region === "Default" ? null : region;
    LoadAwsConfig(chosenRegion, () => setRefreshing(false));
  }

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  React.useEffect(() => {
    const close = (e) => {
      if(e.key === 'Escape') {
        handleClose(true)
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  },[])

  return (
      <Modal
        className="wizard-dialog"
        onDismiss={() => handleClose(false)}
        visible={open || false}
        closeAriaLabel="Close modal"
        size="large"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              {editing && (fleetStatus === "RUNNING" || fleetStatus === "STOP_REQUESTED") && <Button className="action" variant="normal" loading={fleetStatus === "STOP_REQUESTED"} onClick={stopComputeFleet}>
                {fleetStatus !== "RUNNING" ? <span>Stop Compute Fleet</span>
                : <div className="container"><CancelIcon /> Stop Compute Fleet</div>}
              </Button>}
              <Button onClick={() => handleClose(true)} autoFocus>Cancel</Button>
              <Button disabled={page === pages[0]} onClick={handlePrev}>Back</Button>
              {page === "create" && <Button onClick={handleDryRun}>Dry Run</Button>}
              <Button disabled={loading} onClick={handleNext}>{page === "create" ? (editing ? "Update" : "Create") : "Next"}</Button>
            </SpaceBetween>
          </Box>
        }
        header={
          <Header
            variant="h2"
            actions={page !== "source" && page !== "create" &&
              <Button loading={refreshing} onClick={handleRefresh} iconName={"refresh"}>
                Refresh AWS Config
              </Button>
            }
          >Configuration &gt; {page.charAt(0).toUpperCase() + page.slice(1)}
            {clusterName && ` (${clusterName})`}</Header>
        }>

        <Box className="wizard-container">
          {{"source": <Source />,
            "cluster": aws ? <Cluster /> : <Loading />,
            "headNode": aws ? <HeadNode /> : <Loading />,
            "multiUser": aws ? <MultiUser /> : <Loading />,
            "storage": aws ? <Storage /> : <Loading />,
            "queues": aws ? <Queues /> : <Loading />,
            "create": aws ? <Create /> : <Loading />,
          }[page]}
        </Box>
      </Modal>
  );
}

function WizardShow() {
  const editing = getState(['app', 'wizard', 'editing']);
  const page = getState(['app', 'wizard', 'page']);
  if(editing) {
    clearState(['app', 'wizard', 'config']);
    clearState(['app', 'wizard', 'clusterConfigYaml']);
    clearState(['app', 'wizard', 'loaded']);
    setState(['app', 'wizard', 'editing'], false);
    setState(['app', 'wizard', 'page'], 'source');
  }
  console.log("page: ", page);
  if(!page)
    setState(['app', 'wizard', 'page'], 'source');
  setState(['app', 'wizard', 'dialog'], true);
}

export { WizardDialog, WizardShow }
