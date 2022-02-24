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
import { useSelector } from 'react-redux'
import { findFirst, getIn } from '../../util'

// UI Elements
import {
  ColumnLayout,
  FormField,
  Header,
  Select,
  SpaceBetween,
  Toggle,
} from "@awsui/components-react";

// State / Model
import { getState, setState, useState, clearState } from '../../store'
import { LoadAwsConfig } from '../../model'

// Components
import { LabeledIcon, CustomAMISettings } from './Components'

// Constants
const errorsPath = ['app', 'wizard', 'errors', 'cluster'];

const selectQueues = state => getState(state, ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues']);
const selectVpc = state => getState(state, ['app', 'wizard', 'vpc']);
const selectAwsSubnets = state => getState(state, ['aws', 'subnets']);

function clusterValidate() {
  const vpc = getState(['app', 'wizard', 'vpc']);
  const editing = getState(['app', 'wizard', 'editing']);
  const customAmiEnabled = getState(['app', 'wizard', 'customAMI', 'enabled']);
  const customAmi = getState(['app', 'wizard', 'config', 'Image', 'CustomAmi']);
  let valid = true;

  setState([...errorsPath, 'validated'], true);

  if(!editing && !vpc)
  {
    setState([...errorsPath, 'vpc'], 'You must select a VPC.');
    valid = false;
  } else {
    clearState([...errorsPath, 'vpc']);
  }

  if(customAmiEnabled && !customAmi)
  {
    setState([...errorsPath, 'customAmi'], 'You must select an AMI ID if you enable Custom AMI.');
    valid = false;
  } else {
    clearState([...errorsPath, 'customAmi']);
  }

  return valid;
}

function itemToOption(item) {
  if(!item)
    return;
  const [value, title, icon] = item;
  return {label: icon ? <div style={{minWidth: "200px"}}><LabeledIcon icon={icon} label={title} /></div> : <div style={{minWidth: "200px"}}>{title}</div>,
    value: value}
}

function RegionSelect() {
  const region = useState(['app', 'wizard', 'config', 'Region']) || "Please select a region.";
  const queues = useSelector(selectQueues);
  const editing = useState(['app', 'wizard', 'editing']);

  const handleChange = ({ detail }) => {
    const chosenRegion = detail.selectedOption.value === "Default" ? null : detail.selectedOption.value;
    LoadAwsConfig(chosenRegion);
    setState(['app', 'wizard', 'vpc'], null)
    setState(['app', 'wizard', 'headNode', 'subnet'], null)
    if(queues)
      queues.forEach((queue, i) => {
        clearState(['app', 'wizard', 'queues', i, "subnet"]);
      })
    setState(['app', 'wizard', 'config', 'Region'], chosenRegion);
  };

  const supportedRegions = [
    ["af-south-1", "af-south-1", "flags/af.svg"],
    ["ap-east-1", "ap-east-1", "flags/cn.svg"],
    ["ap-northeast-1", "ap-northeast-1", "flags/jp.svg"],
    ["ap-northeast-2", "ap-northeast-2", "flags/kr.svg"],
    ["ap-south-1", "ap-south-1", "flags/in.svg"],
    ["ap-southeast-1", "ap-southeast-1", "flags/sg.svg"],
    ["ap-southeast-2", "ap-southeast-2", "flags/au.svg"],
    ["ca-central-1", "ca-central-1", "flags/ca.svg"],
    ["cn-north-1", "cn-north-1", "flags/cn.svg"],
    ["cn-northwest-1", "cn-northwest-1", "flags/cn.svg"],
    ["eu-central-1", "eu-central-1", "flags/de.svg"],
    ["eu-north-1", "eu-north-1", "flags/se.svg"],
    ["eu-south-1", "eu-south-1", "flags/it.svg"],
    ["eu-west-1", "eu-west-1", "flags/ie.svg"],
    ["eu-west-2", "eu-west-2", "flags/gb.svg"],
    ["eu-west-3", "eu-west-3", "flags/fr.svg"],
    ["me-south-1", "me-south-1", "flags/bh.svg"],
    ["sa-east-1", "sa-east-1", "flags/br.svg"],
    ["us-east-1", "us-east-1", "flags/us.svg"],
    ["us-east-2", "us-east-2", "flags/us.svg"],
    ["us-gov-east-1", "us-gov-east-1", "flags/us.svg"],
    ["us-gov-west-1", "us-gov-west-1", "flags/us.svg"],
    ["us-west-1", "us-west-1", "flags/us.svg"],
    ["us-west-2", "us-west-2", "flags/us.svg"],
  ];

  return (
    <>
      <Header variant="h4" description="Region where the cluster will be created."
        actions={
          <Select
            disabled={editing}
            selectedOption={itemToOption(findFirst(supportedRegions, x => {return x[0] === region}))}
            onChange={handleChange}
            options={supportedRegions.map(itemToOption)}
            selectedAriaLabel="Selected"/>
        }
      >Region</Header>
    </>
  );
}

function SchedulerSelect() {
  const schedulers = [["slurm", "Slurm"], ["batch", "AWS Batch"]];
  const scheduler = useState(['app', 'wizard', 'scheduler']) || "slurm";
  const editing = useState(['app', 'wizard', 'editing']);

  return (
    <>
      <Header variant="h4"
        description="Scheduler that will be used to manage applications."
        actions={
          <Select
            disabled={editing}
            selectedOption={itemToOption(findFirst(schedulers, x => {return x[0] === scheduler}))}
            onChange={({detail}) => {setState(['app', 'wizard', 'scheduler'], detail.selectedOption.value)}}
            options={schedulers.map(itemToOption)}
            selectedAriaLabel="Selected"
          />
        }
      >Scheduler</Header>
    </>
  );
}

function OsSelect() {
  const oses = [
    ["alinux2", "Amazon Linux 2", "/img/aws.svg"],
    ["centos7", "CentOS 7", "/img/centos.svg"],
    ["ubuntu1804", "Ubuntu 18.04", "/img/ubuntu.svg"],
    ["ubuntu2004", "Ubuntu 20.04", "/img/ubuntu.svg"],
  ];
  const osPath = ['app', 'wizard', 'config', 'Image', 'Os'];
  const os = useState(osPath) || "alinux2";
  const editing = useState(['app', 'wizard', 'editing']);
  return (
    <>
      <Header variant="h4" description="OS installed on the cluster nodes."
        actions={
          <Select
            disabled={editing}
            selectedOption={itemToOption(findFirst(oses, x => {return x[0] === os}))}
            onChange={({detail}) => setState(osPath, detail.selectedOption.value)}
            options={oses.map(itemToOption)}
            selectedAriaLabel="Selected"
          />
        }
      >Operating System</Header>
    </>
  );
}


function VpcSelect() {
  const vpcs = useState(['aws', 'vpcs']) || [];
  const vpc = useSelector(selectVpc) || "";
  const error = useState([...errorsPath, 'vpc']);
  const subnets = useSelector(selectAwsSubnets);
  const queues = useSelector(selectQueues);
  const editing = useState(['app', 'wizard', 'editing']);

  const VpcName = (vpc) => {
    if(!vpc)
      return null;
    var tags = vpc.Tags;
    if(!tags) {
      return null;
    }
    tags = vpc.Tags.filter((t) => {return t.Key === "Name"})
    return (tags.length > 0) ? tags[0].Value : null
  }

  const vpcToDisplayOption = vpc => {return  vpc ?
      {label: <div style={{minWidth: "200px"}}>{VpcName(vpc) ? VpcName(vpc) : vpc.VpcId}</div>, value: vpc.VpcId}
      : {label: <div style={{minWidth: "200px"}}>Select a VPC</div>, value: null}}

  const vpcToOption = vpc => {return vpc ?
      {label: <div style={{minWidth: "200px"}}>{vpc.VpcId} {VpcName(vpc) && `(${VpcName(vpc)})`}</div>, value: vpc.VpcId} 
      : {label: <div style={{minWidth: "200px"}}>Select a VPC</div>, value: null}}

  const setVpc = (vpcId) => {
    setState(['app', 'wizard', 'vpc'], vpcId);
    setState([...errorsPath, 'vpc'], null);
    const headNodeSubnetPath = ['app', 'wizard', 'config', 'HeadNode', 'Networking', 'SubnetId'];

    const filteredSubnets = subnets && subnets.filter((s) => {return s.VpcId === vpcId})
    if(filteredSubnets.length > 0) {
      const subnetSet = new Set(filteredSubnets);
      var subnet = filteredSubnets[0];
      if(!subnetSet.has(getState(headNodeSubnetPath)))
        setState(headNodeSubnetPath, subnet.SubnetId);
      if(queues)
        queues.forEach((queue, i) => {
          const queueSubnetPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues', i, "Networking", "SubnetIds"];
          if(!subnetSet.has(getState(queueSubnetPath)))
            setState(queueSubnetPath, [subnet.SubnetId]);
        })
    }
  }

  return (<FormField errorText={error}>
    <Header variant="h4" description="VPC where the cluster instances will reside."
      actions={
        <Select
          disabled={editing}
          selectedOption={vpcToDisplayOption(findFirst(vpcs, x => {return x.VpcId === vpc}))}
          onChange={({detail}) => {setVpc(detail.selectedOption.value)}}
          options={vpcs.map(vpcToOption)}
          selectedAriaLabel="Selected"
        />
      }
    >VPC</Header>
  </FormField>);
}

function Cluster() {
  const editing = useState(['app', 'wizard', 'editing']);
  const configPath = ['app', 'wizard', 'config'];
  let config = useState(configPath);
  let clusterConfig = useState(['app', 'wizard', 'clusterConfigYaml']) || "";
  let wizardLoaded = useState(['app', 'wizard', 'loaded']);
  let multiUserEnabled = useState(['app', 'wizard', 'multiUser']) || false;
  let awsConfig = useState(['aws']);
  let keypairs = useState(['aws', 'keypairs']) || [];
  let defaultRegion = useState(['aws', 'region']) || "";
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  let versionMinor = useState(['app', 'version', 'minor']);

  React.useEffect(() => {
    const configPath = ['app', 'wizard', 'config'];
    // Don't overwrite the config if we go back, still gets overwritten
    // after going forward so need to consider better way of handling this
    if(clusterConfig)
      return;

    // Load these values once when creating the component
    if(!wizardLoaded) {
      setState(['app', 'wizard', 'loaded'], true);
      if(!config)
      {
        const customAMIEnabled = getIn(config, ['Image', 'CustomAmi']) ? true : false;
        setState(['app', 'wizard', 'customAMI', 'enabled'], customAMIEnabled);
        setState([...configPath, 'HeadNode', 'InstanceType'], 't2.micro');
        setState([...configPath, 'Scheduling', 'Scheduler'], 'slurm');
        setState([...configPath, 'Region'], region);
        setState([...configPath, 'Image', 'Os'], 'alinux2');
        setState([...configPath, 'Scheduling', 'SlurmQueues'], [{Name: 'queue0', ComputeResources: [{Name: "queue0-t2-micro", MinCount: 0, MaxCount: 4, InstanceType: 't2.micro'}]}]);
      }
    }

    // Load these values when we get a new config as well (e.g. changing region)
    if(awsConfig && awsConfig.keypairs && awsConfig.keypairs.length > 0)
    {
      const keypairs = getState(['aws', 'keypairs']) || [];
      const keypairNames = new Set(keypairs.map((kp) => kp.KeyName));
      const headNodeKPPath = [...configPath, 'HeadNode', 'Ssh', 'KeyName'];
      if(keypairs.length > 0 && !keypairNames.has(getState(headNodeKPPath)))
      {
        setState(headNodeKPPath, awsConfig.keypairs[0].KeyName);
      }
    }
  }, [region, config, awsConfig, clusterConfig, wizardLoaded]);

  return (
      <SpaceBetween direction="vertical" size="xs">
        <ColumnLayout columns={2} borders="vertical">
          <RegionSelect />
          <SchedulerSelect />
          <OsSelect />
          <VpcSelect />
          {versionMinor && versionMinor >= 1 && true &&
          <FormField>
            <Header variant="h4" description="Enable Multi-User cluster through Active Directory integration.">Multi User</Header>
            <Toggle disabled={editing} checked={multiUserEnabled} onChange={() => setState(['app', 'wizard', 'multiUser'], !multiUserEnabled)}>Multi User Cluster</Toggle>
          </FormField>
          }
          <CustomAMISettings basePath={configPath} appPath={['app', 'wizard']} errorsPath={errorsPath} validate={clusterValidate}/>
        </ColumnLayout>
      </SpaceBetween>
  )
}

export { Cluster, clusterValidate }
