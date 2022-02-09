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

import { UpdateComputeFleet, GetConfiguration, GetDcvSession } from '../../model'
import { setState, useState } from '../../store'
import { findFirst, getIn } from '../../util'
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
import ClusterDeleteDialog from './ClusterDeleteDialog'
import { ClusterStopDialog, stopComputeFleet } from './ClusterStopDialog'

export default function ClusterActions () {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = useState(clusterPath);
  const region = useState(['app', 'selectedRegion']);
  const defaultRegion = useState(['aws', 'region']);
  const headNode = useState([...clusterPath, 'headNode']);

  const fleetStatus = useState([...clusterPath, 'computeFleetStatus']);
  const clusterStatus = useState([...clusterPath, 'clusterStatus']);
  const dcvEnabled = useState([...clusterPath, 'config', 'HeadNode', 'Dcv', 'Enabled']);

  const ssmPolicy = 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore';
  function isSsmPolicy(p) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy;
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
    setState(['app', 'clusters', 'clusterDelete', 'dialog'], true)
  }

  const shellCluster = (instanceId) => {
    const useRegion = region || defaultRegion;
    window.open(`https://${useRegion}.console.aws.amazon.com/systems-manager/session-manager/${instanceId}?region=${useRegion}`);
  }

  const ssmFilesystem = (instanceId) => {
    const useRegion = region || defaultRegion;
    let os = getIn(cluster.config, ['Image', 'Os'])
    let user = {"alinux2": "ec2-user",
      "ubuntu2004": "ubuntu",
      "ubuntu1804": "ubuntu",
      "centos7": "centos"}[os]
    const path = encodeURIComponent(`/home/${user}/`)
    window.open(`https://${useRegion}.console.aws.amazon.com/systems-manager/managed-instances/${instanceId}/file-system?region=${useRegion}&osplatform=Linux#%7B%22path%22%3A%22${path}%22%7D`);
  }

  const dcvConnect = (instance) => {
    let os = getIn(cluster.config, ['Image', 'Os'])
    let user = {"alinux2": "ec2-user",
      "ubuntu2004": "ubuntu",
      "ubuntu1804": "ubuntu",
      "centos7": "centos"}[os]
    let callback = (dcvInfo) => {
      window.open(`https://${instance.publicIpAddress}:${dcvInfo.port}?authToken=${dcvInfo.session_token}#${dcvInfo.session_id}`);
    }
    GetDcvSession(instance.instanceId, user, callback);
  }

  return <div style={{marginLeft: "20px"}}>
    <ClusterDeleteDialog clusterName={clusterName} />
    <ClusterStopDialog clusterName={clusterName} />
    <SpaceBetween direction="horizontal" size="xs">
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS' || clusterStatus === 'CREATE_FAILED'} variant="normal" onClick={editConfiguration} iconName={"edit"}> Edit</Button>
      {fleetStatus === "STOPPED" && <Button className="action" variant="normal" onClick={startFleet} iconName={"caret-right-filled"}> Start</Button>}
      {fleetStatus === "RUNNING" && <Button className="action" variant="normal" onClick={stopComputeFleet}>
        <div className="container">
          <CancelIcon /> Stop
        </div>
      </Button>}
      <Button className="action" disabled={clusterStatus === 'DELETE_IN_PROGRESS'} color="default" onClick={deleteCluster}>
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
