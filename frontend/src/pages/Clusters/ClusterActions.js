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

import jsyaml from 'js-yaml';

import { setState, useState, isAdmin, ssmPolicy, consoleDomain } from '../../store'
import { UpdateComputeFleet, GetConfiguration, GetDcvSession, DeleteCluster, DescribeCluster, ListClusters } from '../../model'
import { findFirst, clusterDefaultUser } from '../../util'
import { loadTemplate } from '../Configure/util'

// UI Elements
import Button from "@awsui/components-react/button"
import SpaceBetween from "@awsui/components-react/space-between"

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList';
import FolderIcon from '@mui/icons-material/Folder';
import MonitorIcon from '@mui/icons-material/Monitor';

// Components
import { DeleteDialog, showDialog, hideDialog } from '../../components/DeleteDialog'
import { ClusterStopDialog, stopComputeFleet } from './ClusterStopDialog'

export default function ClusterActions () {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = useState(clusterPath);
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;
  const headNode = useState([...clusterPath, 'headNode']);

  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);
  const clusterStatus = useState([...clusterPath, 'clusterStatus']);
  const dcvEnabled = useState([...clusterPath, 'config', 'HeadNode', 'Dcv', 'Enabled']);

  function isSsmPolicy(p) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region);
  }
  const iamPolicies = useState([...clusterPath, 'config', 'HeadNode', 'Iam', 'AdditionalIamPolicies']);
  const ssmEnabled = iamPolicies && findFirst(iamPolicies, isSsmPolicy);

  const startFleet = () => {
    UpdateComputeFleet(clusterName, "START_REQUESTED")
  }

  const editConfiguration = () => {
    setState(['app', 'wizard', 'clusterName'], clusterName);
    setState(['app', 'wizard', 'page'], 'cluster');
    setState(['app', 'wizard', 'dialog'], true);
    setState(['app', 'wizard', 'editing'], true);

    GetConfiguration(clusterName, (configuration) => {
      loadTemplate(jsyaml.load(configuration));
    });
  }

  const deleteCluster = () => {
    console.log(`Deleting: ${clusterName}`);
    DeleteCluster(clusterName, (resp) => {DescribeCluster(clusterName); ListClusters()});
    hideDialog('deleteCluster');
  }

  const shellCluster = (instanceId) => {
    window.open(`${consoleDomain(region)}/systems-manager/session-manager/${instanceId}?region=${region}`);
  }

  const ssmFilesystem = (instanceId) => {
    let user = clusterDefaultUser(cluster);
    const path = encodeURIComponent(`/home/${user}/`)
    window.open(`${consoleDomain(region)}/systems-manager/managed-instances/${instanceId}/file-system?region=${region}&osplatform=Linux#%7B%22path%22%3A%22${path}%22%7D`);
  }

  const dcvConnect = (instance) => {
    let callback = (dcvInfo) => {
      window.open(`https://${instance.publicIpAddress}:${dcvInfo.port}?authToken=${dcvInfo.session_token}#${dcvInfo.session_id}`);
    }
    let user = clusterDefaultUser(cluster);
    GetDcvSession(instance.instanceId, user, callback);
  }

  return <div style={{marginLeft: "20px"}}>
    <DeleteDialog id='deleteCluster' header='Delete Cluster?' deleteCallback={deleteCluster}>
      Are you sure you want to delete cluster {clusterName}?
    </DeleteDialog>
    <ClusterStopDialog clusterName={clusterName} />
    <SpaceBetween direction="horizontal" size="xs">
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS' || clusterStatus === 'CREATE_FAILED' || !isAdmin()} variant="normal" onClick={editConfiguration} iconName={"edit"}> Edit</Button>
      {fleetStatus === "STOPPED" && <Button className="action" variant="normal" onClick={startFleet} iconName={"caret-right-filled"}> Start</Button>}
      {fleetStatus === "RUNNING" && <Button className="action" variant="normal" onClick={stopComputeFleet}>
        <div className="container">
          <CancelIcon /> Stop
        </div>
      </Button>}
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS' || !isAdmin()} color="default" onClick={() => {showDialog('deleteCluster')}}>
        <div className="container">
          <DeleteIcon /> Delete
        </div>
      </Button>
      {headNode && headNode.publicIpAddress && headNode.publicIpAddress !== "" && ssmEnabled &&
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS'} onClick={() => {ssmFilesystem(headNode.instanceId)}}>
        <div className="container">
          <FolderIcon />
          Filesystem
        </div>
      </Button>}
      {headNode && headNode.publicIpAddress && headNode.publicIpAddress !== "" && 
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS'} onClick={() => {shellCluster(headNode.instanceId)}}>
        <div className="container">
          <FeaturedPlayListIcon />
          Shell
        </div>
      </Button>}
      {headNode && headNode.publicIpAddress && headNode.publicIpAddress !== "" && dcvEnabled &&
        <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS'} onClick={() => {dcvConnect(headNode)}}>
          <div className="container">
            <MonitorIcon />
            DCV
          </div>
            </Button>}
    </SpaceBetween>
  </div>
}
