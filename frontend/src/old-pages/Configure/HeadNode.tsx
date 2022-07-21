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

// Frameworks
import * as React from 'react';
import { Trans } from 'react-i18next';
import { useSelector } from 'react-redux';
import { findFirst, getIn } from '../../util'

// UI Elements
import {
  Box,
  Container,
  ExpandableSection,
  FormField,
  Header,
  Input,
  Select,
  SpaceBetween,
  Toggle,
} from "@awsui/components-react";

// State
import { setState, getState, useState, clearState, updateState, ssmPolicy } from '../../store'

// Components
import { ActionsEditor, InstanceSelect, RootVolume, SecurityGroups, SubnetSelect, IamPoliciesEditor } from './Components'
import HelpTooltip from '../../components/HelpTooltip'

// Constants
const headNodePath = ['app', 'wizard', 'config', 'HeadNode'];
const errorsPath = ['app', 'wizard', 'errors', 'headNode'];

function headNodeValidate() {
  const subnetPath = [...headNodePath, 'Networking', 'SubnetId'];
  const subnetValue = getState(subnetPath);

  const rootVolumeSizePath = [...headNodePath, 'LocalStorage', 'RootVolume', 'Size'];
  const rootVolumeValue = getState(rootVolumeSizePath);

  const instanceTypePath = [...headNodePath, 'InstanceType'];
  const instanceTypeValue = getState(instanceTypePath);

  const actionsPath = [...headNodePath, 'CustomActions'];

  const onStartPath = [...actionsPath, 'OnNodeStart'];
  const onStart = getState(onStartPath);

  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured'];
  const onConfigured = getState(onConfiguredPath);

  let valid = true;

  if(!subnetValue)
  {
    setState([...errorsPath, 'subnet'], 'You must select a Subnet.');
    valid = false;
  } else {
    clearState([...errorsPath, 'subnet']);
  }

  if(!instanceTypeValue)
  {
    setState([...errorsPath, 'instanceType'], 'You must select an instance type.');
    valid = false;
  } else {
    clearState([...errorsPath, 'instanceType']);
  }

  if(rootVolumeValue === '')
  {
    setState([...errorsPath, 'rootVolume'], 'You must set a RootVolume size.');
    valid = false;
  } else if(rootVolumeValue && (!Number.isInteger(rootVolumeValue) || rootVolumeValue < 35)) {
    setState([...errorsPath, 'rootVolume'], 'You must use an integer >= 35GB for Root Volume Size.');
    valid = false;
  } else {
    clearState([...errorsPath, 'rootVolume']);
  }

  if(onStart && getState([...onStartPath, 'Args']) && !getState([...onStartPath, 'Script']))
  {
    setState([...errorsPath, 'onStart'], 'You must specify a script path if you specify args.');
    valid = false;
  } else {
    clearState([...errorsPath, 'onStart']);
  }

  if(onConfigured && getState([...onConfiguredPath, 'Args']) && !getState([...onConfiguredPath, 'Script']))
  {
    setState([...errorsPath, 'onConfigured'], 'You must specify a script path if you specify args.');
    valid = false;
  } else {
    clearState([...errorsPath, 'onConfigured']);
  }

  setState([...errorsPath, 'validated'], true);


  const config = getState(['app', 'wizard', 'config']);
  //console.log(config);

  return valid;
}

function enableSsm(enable: any) {
  const iamPolicies = getState([...headNodePath, 'Iam', 'AdditionalIamPolicies']);
  const defaultRegion = getState(['aws', 'region']);
  const region = getState(['app', 'selectedRegion']) || defaultRegion;

  if(enable) {
    if(iamPolicies && findFirst(iamPolicies, isSsmPolicy))
      return;
    updateState([...headNodePath, 'Iam', 'AdditionalIamPolicies'], (existing: any) => {return [...(existing || []), {Policy: ssmPolicy(region)}]}
    )
  } else {
    if(!iamPolicies || (iamPolicies && !findFirst(iamPolicies, isSsmPolicy)))
      return;
    if(iamPolicies.length === 1)
      clearState([...headNodePath, 'Iam'])
    else {
      updateState([...headNodePath, 'Iam', 'AdditionalIamPolicies'], (existing: any) => existing.filter((p: any) => {return !isSsmPolicy(p)})
      )
    }
  }
}

function KeypairSelect() {
  const keypairs = useState(['aws', 'keypairs']) || [];
  const keypairPath = [...headNodePath, 'Ssh', 'KeyName']
  const keypair = useState(keypairPath) || "";
  const editing = useState(['app', 'wizard', 'editing']);
  const keypairToOption = (kp: any) => {
    if(kp === 'None' || kp === null || kp === undefined)
      return {label: "None", value: null}
    else
      return {label: kp.KeyName, value: kp.KeyName}
  }

  const keypairsWithNone = ['None', ...keypairs]

  const setKeyPair = (kpValue: any) => {
    if(kpValue)
      setState(keypairPath, kpValue);
    else
    {
      clearState([...headNodePath, 'Ssh']);
      enableSsm(true);
    }
  }

  return (
    <FormField
      label="Keypair"
      description="Keypair used to connect to HeadNode via SSH. If you don't specify an SSH keypair you can still connect to the cluster using SSM, make sure to turn on 'Remote Console' in order to do so.">
      <Select
        disabled={editing}
        selectedOption={keypairToOption(findFirst(keypairs, (x: any) => {return x.KeyName === keypair}))}
        onChange={({detail}) => {setKeyPair(detail.selectedOption.value);}}
        selectedAriaLabel="Selected"
        options={keypairsWithNone.map(keypairToOption)}
      />
    </FormField>
  );
}

function isSsmPolicy(p: any) {
  const region = getState(['app', 'selectedRegion']) || getState(['aws', 'region']);
  return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region);
}

function SsmSettings() {
  const dcvEnabled = useState([...headNodePath, 'Dcv', 'Enabled']) || false;

  const ssmEnabled = useSelector((state) => {
    const iamPolicies = getIn(state, [...headNodePath, 'Iam', 'AdditionalIamPolicies']);
    return findFirst(iamPolicies, isSsmPolicy) || false;
  })
  return <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
    <FormField label="Virtual Console" description="Allow connecting to HeadNode via SSM.">
      <Toggle checked={ssmEnabled} onChange={({detail}) => enableSsm(!ssmEnabled)} disabled={dcvEnabled}>Remote Console Enabled</Toggle>
    </FormField>
    <HelpTooltip>
      This setting will enable SSM which permits connecting to the head node via a virtual console.
    </HelpTooltip>
  </div>
}

function DcvSettings() {
  const dcvPath = [...headNodePath, 'Dcv', 'Enabled'];

  let dcvEnabled = useState(dcvPath) || false;
  let port = useState([...headNodePath, 'Dcv', 'Port']) || 8443;
  let allowedIps = useState([...headNodePath, 'Dcv', 'AllowedIps']) || '0.0.0.0/0';
  const editing = useState(['app', 'wizard', 'editing']);
  const toggleDcv = (event: any) => {
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

  return <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
    <FormField label="Virtual Desktop" description="Allow a virtual desktop session on the HeadNode via DCV. If you select this option, we suggest using a larger instance size.">
      <SpaceBetween direction="vertical" size="xxxs">
        <Toggle disabled={editing} checked={dcvEnabled} onChange={toggleDcv}>DCV Enabled</Toggle>
        <SpaceBetween direction="vertical" size="xs">
          {dcvEnabled &&
          <FormField label="Allowed IPs">
            <Input
              value={allowedIps}
              onChange={(({detail}) => {setState([...headNodePath, 'Dcv', 'AllowedIps'], detail.value)})} />
          </FormField>
          }
          {dcvEnabled &&
            <FormField label="Port">
              <Input
                inputMode="decimal"
                value={port}
                onChange={(({detail}) => setState([...headNodePath, 'Dcv', 'Port'], parseInt(detail.value)))} />
            </FormField>
          }
        </SpaceBetween>
      </SpaceBetween>
    </FormField>
    <HelpTooltip>
      Remote-Desktop into the headnode to visualize results.
    </HelpTooltip>
  </div>
}

function HeadNode() {
  const imdsSecuredPath = [...headNodePath, 'Imds', 'Secured'];
  const imdsSecured = useState(imdsSecuredPath);

  const subnetPath = [...headNodePath, 'Networking', 'SubnetId'];
  const instanceTypeErrors = useState([...errorsPath, 'instanceType'])
  const subnetErrors = useState([...errorsPath, 'subnet']);
  const subnetValue = useState(subnetPath) || "";
  const editing = useState(['app', 'wizard', 'editing']);
  const versionMinor = useState(['app', 'version', 'minor']);

  const toggleImdsSecured = () => {
    const setImdsSecured = !imdsSecured;
    if(setImdsSecured)
      setState(imdsSecuredPath, setImdsSecured);
    else
    {
      clearState(imdsSecuredPath);
      if(Object.keys(getState([...headNodePath, 'Imds'])).length === 0)
        clearState([...headNodePath, 'Imds']);
    }
  }

  const slurmSettingsPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmSettings'];
  const memoryBasedSchedulingEnabledPath = [...slurmSettingsPath, 'EnableMemoryBasedScheduling'];
  const memoryBasedSchedulingEnabled = useState(memoryBasedSchedulingEnabledPath);
  const toggleMemoryBasedSchedulingEnabled = () => {
    const setMemoryBasedSchedulingEnabled = !memoryBasedSchedulingEnabled;
    if(setMemoryBasedSchedulingEnabled)
      setState(memoryBasedSchedulingEnabledPath, setMemoryBasedSchedulingEnabled);
    else
    {
      clearState(memoryBasedSchedulingEnabledPath);
      if(Object.keys(getState([...slurmSettingsPath])).length === 0)
        clearState([...slurmSettingsPath]);
    }
  }

  return (
    <Container header={<Header variant="h2">Head Node Properties</Header>}>
      <SpaceBetween direction="vertical" size="s">
        <Box>
          <FormField
            errorText={instanceTypeErrors}
            label="Head Node Instance Type">
            <InstanceSelect disabled={editing} selectId="head-node" path={[...headNodePath, 'InstanceType']} />
          </FormField>
        </Box>
        <FormField
          label="Subnet ID"
          errorText={subnetErrors}
          description="Subnet ID for HeadNode.">
          <SubnetSelect disabled={editing} value={subnetValue} onChange={(subnetId: any) => setState(subnetPath, subnetId)}/>
        </FormField>
        <KeypairSelect />
        <RootVolume basePath={headNodePath} errorsPath={errorsPath} />
        <SsmSettings />
        <DcvSettings />
        <div key="imds-secured" style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <Toggle
            checked={imdsSecured || false} onChange={toggleImdsSecured}>IMDS Secured</Toggle>
          <HelpTooltip>
            If enabled, restrict access to IMDS (and thus instance credentials) to users with superuser permissions. For more information, see <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html#instance-metadata-v2-how-it-works'>How instance metadata service version 2 works</a> in the <i>Amazon EC2 User Guide for Linux Instances</i>.
          </HelpTooltip>
        </div>
        {
          (versionMinor && versionMinor >= 2) &&
          <div key="memory-based-scheduling-enabled" style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
            <Toggle
                  checked={memoryBasedSchedulingEnabled || false} onChange={toggleMemoryBasedSchedulingEnabled}><Trans i18nKey="wizard.headNode.memoryBasedSchedulingEnabled.label" />
            </Toggle>
            <HelpTooltip>
              <Trans i18nKey="wizard.headNode.memoryBasedSchedulingEnabled.help" >
                 <a rel="noopener noreferrer" target="_blank" href='https://slurm.schedmd.com/cgroup.conf.html#OPT_ConstrainRAMSpace'></a>
              </Trans>
            </HelpTooltip>
          </div>
        }
        <div key="sgs" style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <FormField label="Additional Security Groups">
            <SecurityGroups basePath={headNodePath} />
          </FormField>
          <HelpTooltip>
            Provides additional security groups for the HeadNode.
          </HelpTooltip>
        </div>
        <ExpandableSection header="Advanced options">
          <ActionsEditor basePath={headNodePath} errorsPath={errorsPath}/>
          <ExpandableSection header="IAM Policies">
            <IamPoliciesEditor basePath={headNodePath} />
          </ExpandableSection>
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  );
}

export { HeadNode, headNodeValidate }
