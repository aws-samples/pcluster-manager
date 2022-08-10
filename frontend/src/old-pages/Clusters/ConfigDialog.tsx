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
import { ClusterStatus } from '../../types/clusters'
import * as React from 'react';

import { GetConfiguration } from '../../model'
import { setState, useState } from '../../store'

// UI Elements
import {
  Box,
  Button,
  Modal,
  SpaceBetween,
} from "@awsui/components-react";

// Components
import Loading from '../../components/Loading'
import ConfigView from '../../components/ConfigView'

function downloadBlob(blob: any, filename: any) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
  return a;
}


export default function ConfigDialog() {
  const open = useState(['app', 'clusters', 'clusterConfig', 'dialog']);

  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = useState(clusterPath);
  const configYaml = useState([...clusterPath, 'configYaml']);

  const close = () => {
    setState(['app', 'clusters', 'clusterConfig', 'dialog'], false)
  };

  return (
    <Modal
      onDismiss={close}
      visible={open}
      closeAriaLabel="Config modal"
      size="large"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              iconName="download"
              disabled={cluster && cluster.clusterStatus === ClusterStatus.CreateFailed}
              onClick={() => {
                GetConfiguration(clusterName, (configuration: any) => {
                  const blob = new Blob([configuration], {type: 'text/yaml'});
                  downloadBlob(blob, 'config.yaml')});
              }}
            >Download</Button>
            <Button onClick={close}>Close</Button>
          </SpaceBetween>
        </Box>
      }
      header="Cluster Configuration">
      {configYaml ? <ConfigView config={configYaml} /> : <Loading />}
    </Modal>
  );
}
