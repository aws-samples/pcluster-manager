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

// UI Elements
import {
  Box,
  Button,
  Modal,
  SpaceBetween,
} from "@awsui/components-react";

import { DeleteCluster, DescribeCluster, ListClusters } from '../../model'
import { setState, useState } from '../../store'

export default function ClusterDeleteDialog(props) {
  const open = useState(['app', 'clusters', 'clusterDelete', 'dialog']);

  const deleteCluster = () => {
    DeleteCluster(props.clusterName, (resp) => {DescribeCluster(props.clusterName); ListClusters()})
    setState(['app', 'clusters', 'clusterDelete', 'dialog'], false)
  };

  const cancel = () => {
    setState(['app', 'clusters', 'clusterDelete', 'dialog'], false)
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
            <Button onClick={deleteCluster} autoFocus>Delete!</Button>
          </SpaceBetween>
        </Box>
      }
      header="Delete Cluster?"
    >
      Are you sure you want to delete cluster {props.clusterName}?
    </Modal>
  );
}
