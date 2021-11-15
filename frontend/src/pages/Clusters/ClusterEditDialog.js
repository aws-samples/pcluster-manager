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
import { setState, useState } from '../../store'
import jsyaml from 'js-yaml';

// UI Elements
import {
  Button
} from "@awsui/components-react";
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

// Icons
import CancelIcon from '@mui/icons-material/Cancel';

// Components
import ValidationErrors from '../../components/ValidationErrors'

import { UpdateComputeFleet, UpdateCluster, GetConfiguration } from '../../model'

// Constants
const clustersEditPath = ['app', 'clusters', 'clusterEdit'];

export default function ClusterEditDialog(props) {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const open = useState([...clustersEditPath, 'dialog']);
  const clusterConfig = useState([...clustersEditPath, 'config']);
  const errors = useState([...clustersEditPath, 'errors']);
  const pending = useState([...clustersEditPath, 'pending']);

  const clusterPath = ['clusters', 'index', clusterName];
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);

  const handleClose = () => {
    setState([...clustersEditPath, 'dialog'], false)
    setState([...clustersEditPath, 'errors'], null)
  };

  const stopFleet = () => {
    UpdateComputeFleet(clusterName, "STOP_REQUESTED")
  }

  const handleUpdate = () => {
    let config_path = ['clusters', 'index', clusterName, 'config'];
    var errHandler = (err) => {
      setState([...clustersEditPath, 'errors'], err);
      setState([...clustersEditPath, 'pending'], false);
      GetConfiguration(clusterName, (configuration) => {setState(config_path, jsyaml.load(configuration))});
    }
    var successHandler = (resp) => {
      setState([...clustersEditPath, 'pending'], false);
      handleClose();
      GetConfiguration(clusterName, (configuration) => {setState(config_path, jsyaml.load(configuration))});
    }
    setState([...clustersEditPath, 'pending'], true)
    UpdateCluster(props.clusterName, clusterConfig, successHandler, errHandler)
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      className="configuration-editor"
      open={open || false}
      onClose={handleClose}
      fullWidth={true}
      maxWidth="lg"
      scroll="paper"
      aria-labelledby="cluster-edit-dialog-title"
      aria-describedby="cluster-edit-dialog-description" >
      <DialogTitle id="cluster-edit-dialog-title">Cluster Configuration: {props.clusterName}</DialogTitle>
      <DialogContent dividers={true}>
        {clusterConfig ?
          <textarea
            disabled= { pending }
            spellCheck="false"
            className="configuration-data" value={clusterConfig}
            onChange={(e) => {setState([...clustersEditPath, 'config'], e.target.value)}} />
            : <div><CircularProgress size={15}/> Loading...</div>}
        {errors && <ValidationErrors errors={errors} /> }
        {pending && <div><CircularProgress size={15}/> Update In Progress...</div>}
      </DialogContent>
      <DialogActions>
        {(fleetStatus === "RUNNING" || fleetStatus === "STOP_REQUESTED") && <Button className="action" variant="normal" loading={fleetStatus === "STOP_REQUESTED"} onClick={stopFleet}>
          {fleetStatus !== "RUNNING" ? <span>Stop Compute Fleet</span>
            : <div className="container"><CancelIcon /> Stop Compute Fleet</div>}
        </Button>}
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={pending} onClick={handleUpdate}>Update Cluster</Button>
      </DialogActions>
    </Dialog>
  );
}
