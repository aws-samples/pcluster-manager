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
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

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
      <Dialog
        open={open || false}
        onClose={cancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Cluster?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete cluster {props.clusterName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>Cancel</Button>
          <Button onClick={deleteCluster} autoFocus>
            Delete!
          </Button>
        </DialogActions>
      </Dialog>
  );
}
