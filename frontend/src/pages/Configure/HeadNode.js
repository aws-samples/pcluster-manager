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

// Fameworks
import * as React from 'react';
import { useSelector } from 'react-redux';
import { findFirst, getIn } from '../../util'

// UI Elements
import {
  Box,
  ColumnLayout,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Toggle,
} from "@awsui/components-react";

// State
import { setState, getState, useState, clearState, updateState } from '../../store'

// Components
import { SubnetSelect, InstanceSelect } from './Components'
import HelpTooltip from '../../components/HelpTooltip'

// Constants
const headNodePath = ['app', 'wizard', 'config', 'HeadNode'];
const errorsPath = ['app', 'wizard', 'errors', 'headNode'];

function headNodeValidate() {
  const subnetPath = [...headNodePath, 'Networking', 'SubnetId'];
  const subnetValue = getState(subnetPath);
  let valid = true;

  if(!subnetValue)
  {
    setState([...errorsPath, 'subnet'], 'You must select a Subnet.');
    valid = false;
  } else {
    clearState([...errorsPath, 'subnet']);
  }

  setState([...errorsPath, 'validated'], true);

  const config = getState(['app', 'wizard', 'config']);
  console.log(config);

  return valid;
}

function KeypairSelect() {
  const keypairs = useState(['aws', 'keypairs']);
  const keypairPath = [...headNodePath, 'Ssh', 'KeyName']
  const keypair = useState(keypairPath) || "";
  const keypairToOption = kp => {
    if(kp)
      return {label: kp.KeyName, value: kp.KeyName}
    else
      return {label: "Please select a Keypair."}
  }

  return (<FormField
    label="Keypair"
    description="Keypair used to connect to HeadNode via SSH.">
    <Select
      selectedOption={keypairToOption(findFirst(keypairs, x => {return x.KeyName === keypair}))}
      onChange={({detail}) => {setState(keypairPath, detail.selectedOption.value)}}
      selectedAriaLabel="Selected"
      options={keypairs.map(keypairToOption)}
    />
  </FormField>);
}

const ssmPolicy = 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore';
function isSsmPolicy(p) {
  return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy;
}

function enableSsm(enable) {
  const iamPolicies = getState([...headNodePath, 'Iam', 'AdditionalIamPolicies']);
  if(enable) {
    if(iamPolicies && findFirst(iamPolicies, isSsmPolicy))
      return;
    updateState([...headNodePath, 'Iam', 'AdditionalIamPolicies'], (existing) =>
      {return [...(existing || []), {Policy: ssmPolicy}]}
    )
  } else {
    if(!iamPolicies || (iamPolicies && !findFirst(iamPolicies, isSsmPolicy)))
      return;
    if(iamPolicies.length === 1)
      clearState([...headNodePath, 'Iam'])
    else {
      updateState([...headNodePath, 'Iam', 'AdditionalIamPolicies'], (existing) =>
        existing.filter(p => {return !isSsmPolicy(p)})
      )
    }
  }
}

function SsmSettings() {
  const dcvEnabled = useState([...headNodePath, 'Dcv', 'Enabled']) || false;

  const ssmEnabled = useSelector((state) => {
    const iamPolicies = getIn(state, [...headNodePath, 'Iam', 'AdditionalIamPolicies']);
    return findFirst(iamPolicies, isSsmPolicy) || false;
  })
  return (
      <FormField label="Virtual Console" description="Allow connecting to HeadNode via SSM.">
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <Toggle checked={ssmEnabled} onChange={({detail}) => enableSsm(!ssmEnabled)} disabled={dcvEnabled}>Remote Console Enabled</Toggle>
          <HelpTooltip>
            This setting will enable SSM which permits connecting to the head node via a virtual console.
          </HelpTooltip>
        </div>
      </FormField>
  )
}

function DcvSettings() {
  const dcvPath = [...headNodePath, 'Dcv', 'Enabled'];

  let dcvEnabled = useState(dcvPath) || false;
  let port = useState([...headNodePath, 'Dcv', 'Port']) || 8443;
  let allowedIps = useState([...headNodePath, 'Dcv', 'AllowedIps']) || '0.0.0.0/0';
  const editing = useState(['app', 'wizard', 'editing']);
  const toggleDcv = (event) => {
    const value = !dcvEnabled;
    if(value)
    {
      enableSsm(value);
      if(allowedIps === null)
        setState([...headNodePath, 'Dcv', 'AllowedIps'], '0.0.0.0/0');
      if(port === null)
        setState([...headNodePath, 'Dcv', 'Port'], 8443);
      setState(dcvPath, value);
    } else {
      clearState([...headNodePath, 'Dcv'])
    }
  }

  return (
    <FormField label="Virtual Desktop" description="Allow a virtual desktop session on the HeadNode via DCV. If you select this option, we suggest using a larger instance size.">
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <SpaceBetween direction="vertical" size="xxxs">
          <Toggle disabled={editing} checked={dcvEnabled} onChange={toggleDcv}>DCV Enabled</Toggle>
          <SpaceBetween direction="vertical" size="xs">
            {dcvEnabled &&
            <FormField label="Allowed IPs">
              <Input
                value={allowedIps}
                onChange={(({detail}) => {setState([...headNodePath, 'Dcv', 'allowedIps'], detail.value)})} />
            </FormField>
            }
            {dcvEnabled &&
              <FormField label="Port">
                <Input
                  inputMode="decimal"
                  value={port}
                  onChange={(({detail}) => setState([...headNodePath, 'Dcv', 'port'], parseInt(detail.value)))} />
              </FormField>
            }
          </SpaceBetween>
        </SpaceBetween>
        <HelpTooltip>
          Remote-Desktop into the headnode to visualize results.
        </HelpTooltip>
      </div>
    </FormField>
  )
}

function HeadNode() {
  const rootVolumePath = [...headNodePath, 'LocalStorage', 'RootVolume', 'Size'];
  let rootVolumeSize = useState(rootVolumePath);

  const subnetPath = [...headNodePath, 'Networking', 'SubnetId'];
  const subnetErrors = useState([...errorsPath, 'subnet']);
  const subnetValue = useState(subnetPath) || "";
  const editing = useState(['app', 'wizard', 'editing']);
  return (
    <SpaceBetween direction="vertical" size="xs">
      <ColumnLayout columns={2} borders="vertical">
        <Box>
          <FormField label="Head Node Instance Type">
            <InstanceSelect disabled={editing} selectId="head-node" path={[...headNodePath, 'InstanceType']} />
          </FormField>
        </Box>
        <FormField
          label="Subnet ID"
          errorText={subnetErrors}
          description="Subnet ID for HeadNode.">
          <SubnetSelect disabled={editing} value={subnetValue} onChange={(subnetId) => setState(subnetPath, subnetId)}/>
        </FormField>
        <KeypairSelect />

        <FormField
          label="Root Volume Size (GB)"
          description="Typically users will use a shared storage option for application data so a smaller root volume size is suitable.">
          <Input
            disabled={editing}
            value={rootVolumeSize || 35}
            inputMode="decimal"
            onChange={(({detail}) => setState(rootVolumePath, parseInt(detail.value)))} />
        </FormField>
        <DcvSettings />
        <SsmSettings />
      </ColumnLayout>
    </SpaceBetween>
  )
}

export { HeadNode, headNodeValidate }
