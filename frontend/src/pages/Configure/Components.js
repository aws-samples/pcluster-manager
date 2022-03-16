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
import { findFirst } from '../../util'

// State / Model
import { setState, getState, useState, updateState, clearState } from '../../store'

// UI Elements
import {
  Autosuggest,
  Button,
  FormField,
  Input,
  SpaceBetween,
  Toggle,
  TokenGroup,
  Select,
} from "@awsui/components-react";

// Components
import HelpTooltip from '../../components/HelpTooltip'

// Selectors
const selectVpc = state => getState(state, ['app', 'wizard', 'vpc']);
const selectAwsSubnets = state => getState(state, ['aws', 'subnets']);

function LabeledIcon({label, icon}) {
  return (
    <div style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
      <img style={{width: "30px", height: "30px"}} src={icon} alt={label}/><div style={{marginLeft: "20px", minWidth: "150px"}}>{label}</div>
    </div>
  );
}

function SubnetSelect({value, onChange, disabled}) {
  const subnets = useSelector(selectAwsSubnets);
  const vpc = useSelector(selectVpc);
  var filteredSubnets = subnets && subnets.filter((s) => { return (vpc ?  s.VpcId === vpc : true)})
  if(!subnets) {return <div>No Subnets Found.</div>}

  const SubnetName = (subnet) => {
    if(!subnet)
      return null;
    var tags = subnet.Tags;
    if(!tags) {
      return null;
    }
    tags = subnet.Tags.filter((t) => {return t.Key === "Name"})
    return (tags.length > 0) ? tags[0].Value : null
  }

  const itemToOption = item => {
    return {value: item.SubnetId, label: item.SubnetId,
    description: item.AvailabilityZone + ` - ${item.AvailabilityZoneId}` + (SubnetName(item) ? ` (${SubnetName(item)})` : "")
  }}

  return (
    <Select
      disabled={disabled}
      selectedOption={findFirst(filteredSubnets, x => {return x.SubnetId === value}) ? itemToOption(findFirst(filteredSubnets, x => {return x.SubnetId === value})) : {label: "Please Select A Subnet"}}
      onChange={({detail}) => {onChange && onChange(detail.selectedOption.value)}}
      selectedAriaLabel="Selected"
      options={filteredSubnets.map(itemToOption)}
    />
  );
}

function InstanceSelect({path, selectId, callback, disabled}) {
  const value = useState(path) || "";

  const generalPurposeInstances = [
    ["t2.micro", "1 vcpus, 1GB memory", "/img/od.svg"],
    ["t2.medium", "2 vcpus, 2GB memory", "/img/od.svg"],
  ]

  const computeInstances = [
    ["c5n.large", "2 vcpus, 5.25GB memory", "/img/c5n.svg"],
    ["c5n.xlarge", "4 vcpus, 10.5GB memory", "/img/c5n.svg"],
    ["c5n.2xlarge", "8 vcpus, 21GB memory", "/img/c5n.svg"],
    ["c5n.4xlarge", "16 vcpus, 42GB memory", "/img/c5n.svg"],
    ["c5n.9xlarge", "36 vcpus, 96GB memory", "/img/c5n.svg"],
    ["c5n.18xlarge", "72 vcpus, 192GB memory", "/img/c5n.svg"],
    ["c5n.metal", "72 vcpus, 192GB memory", "/img/c5n.svg"],
    ["c5.large", "2 vcpus, 4GB memory", "/img/c5.svg"],
    ["c5.xlarge", "4 vcpus, 8GB memory", "/img/c5.svg"],
    ["c5.2xlarge", "8 vcpus, 16GB memory", "/img/c5.svg"],
    ["c5.4xlarge", "16 vcpus, 32GB memory", "/img/c5.svg"],
    ["c5.9xlarge", "36 vcpus, 72GB memory", "/img/c5.svg"],
    ["c5.12xlarge", "48 vcpus, 96GB memory", "/img/c5.svg"],
    ["c5.18xlarge", "72 vcpus, 144GB memory", "/img/c5.svg"],
    ["c5.24xlarge", "96 vcpus, 192GB memory", "/img/c5.svg"],
    ["c6i.large", "2 vcpus, 4GB memory", "/img/od.svg"],
    ["c6i.xlarge", "4 vcpus, 8GB memory", "/img/od.svg"],
    ["c6i.2xlarge", "8 vcpus, 16GB memory", "/img/od.svg"],
    ["c6i.4xlarge", "16 vcpus, 32GB memory", "/img/od.svg"],
    ["c6i.8xlarge", "36 vcpus, 64GB memory", "/img/od.svg"],
    ["c6i.12xlarge", "48 vcpus, 96GB memory", "/img/od.svg"],
    ["c6i.16xlarge", "64 vcpus, 128GB memory", "/img/od.svg"],
    ["c6i.24xlarge", "96 vcpus, 192GB memory", "/img/od.svg"],
    ["c6i.32xlarge", "128 vcpus, 256GB memory", "/img/od.svg"],
    ["c6i.metal", "128 vcpus, 256GB memory", "/img/od.svg"],
  ];

  const hpcInstances = [
    ["hpc6a.48xlarge", "96 cores, 384GB memory", "/img/od.svg"]
  ];

  const mixedInstances = [
    ["m6i.large", "2 vcpus, 8GB memory", "/img/c5.svg"],
    ["m6i.xlarge", "4 vcpus, 16GB memory", "/img/c5.svg"],
    ["m6i.2xlarge", "8 vcpus, 32GB memory", "/img/c5.svg"],
    ["m6i.4xlarge", "16 vcpus, 64GB memory", "/img/c5.svg"],
    ["m6i.8xlarge", "32 vcpus, 128GB memory", "/img/c5.svg"],
    ["m6i.12xlarge", "48 vcpus, 192GB memory", "/img/c5.svg"],
    ["m6i.16xlarge", "64 vcpus, 256GB memory", "/img/c5.svg"],
    ["m6i.24xlarge", "96 vcpus, 384GB memory", "/img/c5.svg"],
    ["m6i.32xlarge", "128 vcpus, 256GB memory", "/img/c5.svg"],
  ];

  const gpuInstances = [
    ["p3.2xlarge", "1 x Tesla V100,  8 vcpus, 61GB memory", "/img/p3.svg"],
    ["p3.8xlarge", "4 x Tesla V100,  32 vcpus, 244GB memory", "/img/p3.svg"],
    ["p3.16xlarge", "8 x Tesla V100,  64 vcpus, 488GB memory", "/img/p3.svg"],
    ["p3dn.24xlarge", "8 x Tesla V100,  96 vcpus, 768GB memory", "/img/p3.svg"],
    ["p4d.24xlarge", "8 x Tensor A100,  96 vcpus, 1152GB memory", "/img/p3.svg"],
    ["g4dn.xlarge", "1 x NVIDIA T4,  4 vcpus, 16GB memory", "/img/od.svg"],
    ["g4dn.2xlarge", "1 x NVIDIA T4,  8 vcpus, 32GB memory", "/img/od.svg"],
    ["g4dn.4xlarge", "1 x NVIDIA T4,  16 vcpus, 64GB memory", "/img/od.svg"],
    ["g4dn.8xlarge", "1 x NVIDIA T4,  32 vcpus, 128GB memory", "/img/od.svg"],
    ["g4dn.16xlarge", "1 x NVIDIA T4,  64 vcpus, 256GB memory", "/img/od.svg"],
    ["g4dn.12xlarge", "4 x NVIDIA T4,  48 vcpus, 192GB memory", "/img/od.svg"],
    ["g4dn.metal", "8 x NVIDIA T4,  96 vcpus, 384GB memory", "/img/od.svg"],
  ];

  const groups = [
    ["General Purpose", generalPurposeInstances],
    ["Compute", computeInstances],
    ["HPC", hpcInstances],
    ["Mixed", mixedInstances],
    ["GPU", gpuInstances]
  ];

  const instanceToOption = ([value, label, icon]) => {
    return {label: value,
      iconUrl: icon,
      description: label,
      value: value}}

  return (
    <Autosuggest
      value={value}
      disabled={disabled}
      onChange={({ detail }) => {
        if(detail.value !== value)
        {
          setState(path, detail.value);
          callback && callback(detail.value);
        }
      }}
      enteredTextLabel={(newValue) => {
        if(newValue !== value)
        {
          setState(path, newValue);
          callback && callback(newValue);
        }
      }}
      ariaLabel="Instance Selector"
      placeholder="Instance Type"
      empty="No matches found"
      options={groups.map(([label, instances]) => {
        return {
          label: label,
          options: instances.map(instanceToOption)}})}/>

  )
}

function CustomAMISettings({basePath, appPath, errorsPath, validate}) {
  const editing = useState(['app', 'wizard', 'editing']);
  const customImages = useState(['app', 'wizard', 'customImages']) || [];
  const officialImages = useState(['app', 'wizard', 'officialImages']) || [];
  const error = useState([...errorsPath, 'customAmi']);

  const customAmiPath = [...basePath, 'Image', 'CustomAmi'];
  const customAmi = useState(customAmiPath);
  const customAmiEnabled = useState([...appPath, 'customAMI', 'enabled']) || false;

  const osPath = ['app', 'wizard', 'config', 'Image', 'Os'];
  const os = useState(osPath) || "alinux2";

  var suggestions = [];
  for(let image of customImages)
  {
    suggestions.push({
      value: image.ec2AmiInfo.amiId,
      description: `${image.ec2AmiInfo.amiId} (${image.imageId})`
    })
  }

  for(let image of officialImages)
    if(image.os === os)
    {
      suggestions.push({
        value: image.amiId,
        description: `${image.amiId} (${image.name})`
      })
    }

  const toggleCustomAmi = (event) => {
    const value = !customAmiEnabled;
    setState([...appPath, 'customAMI', 'enabled'], value);
    if(!value)
    {
      clearState(customAmiPath);
      if(Object.keys(getState([...basePath, 'Image'])).length === 0)
        clearState([...basePath, 'Image']);
    }
  }

  return (
    <>
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <Toggle disabled={editing} checked={customAmiEnabled} onChange={toggleCustomAmi}>Use Custom AMI?</Toggle>
        <HelpTooltip>Custom AMI's provide a way to customize the cluster. See the <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/pcluster.build-image-v3.html'>Image section</a> of the documentation for more information.</HelpTooltip>
      </div>
      {customAmiEnabled &&
        <FormField label="Custom AMI ID"
          errorText={error}>
          <Autosuggest
            onChange={({ detail }) => {if(detail.value !== customAmi){setState(customAmiPath, detail.value);}}}
            value={customAmi || ""}
            enteredTextLabel={value => {if(value !== customAmi){setState(customAmiPath, value);}}}
            ariaLabel="Custom AMI Selector"
            placeholder="AMI ID"
            empty="No matches found"
            options={suggestions}
          />
        </FormField>
      }
     </>
  )
}

function cleanEmptyNest(path, depth){
  if(depth === 0)
    return;

  let parentPath = path.slice(0, -1)
  if(Object.keys(getState(parentPath)).length === 0)
  {
    clearState(parentPath);
    cleanEmptyNest(parentPath, depth - 1)
  }
}

function ArgEditor({path, i}) {
  const args = useState(path);
  const arg = useState([...path, i]);
  const remove = () => {
    if(args.length > 1)
      setState([...path], [...args.slice(0, i), ...args.slice(i + 1)]);
    else
      clearState(path);

    cleanEmptyNest(path, 3);
  }
  return <div>
    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
      <span>Arg {i}: </span>
      <Input value={arg} onChange={({detail}) => {setState([...path, i], detail.value)}} />
      <Button onClick={remove}>Remove</Button>
    </div>
  </div>;
}

function ActionsEditor({basePath, errorsPath}) {
  const actionsPath = [...basePath, 'CustomActions'];
  const onStartPath = [...actionsPath, 'OnNodeStart'];
  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured'];

  const onStart = useState([...onStartPath, 'Script']) || '';
  const onStartArgs = useState([...onStartPath, 'Args']) || [];
  const onStartErrors = useState([...errorsPath, 'onStart']);

  const onConfigured = useState([...onConfiguredPath, 'Script']) || '';
  const onConfiguredArgs = useState([...onConfiguredPath, 'Args']) || [];
  const onConfiguredErrors = useState([...errorsPath, 'onConfigured']);

  const addArg = (path) => {
    updateState(path, (old) => [...(old || []), '']);
  }

  const editScript = (path, val) => {
    if(val !== '')
      setState(path, val);
    else
      clearState(path);
    cleanEmptyNest(path, 3);
  }

  return <>
    <SpaceBetween direction="vertical" size="xs">
      <FormField label="On Start" errorText={onStartErrors}>
        <SpaceBetween direction="vertical" size="xs">
          <div key="on-configured" style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            <div style={{flexGrow: 1}}>
              <Input
                placeholder="/home/ec2-user/start.sh"
                value={onStart}
                onChange={({detail}) => editScript([...onStartPath, 'Script'], detail.value)} />
            </div>
            <div style={{flexShrink: 1}}>
              <Button onClick={() => addArg([...onStartPath, 'Args'])}>+ Arg</Button>
            </div>
          </div>
          <SpaceBetween direction="vertical" size="xxs">
            {onStartArgs.map((a, i) => <ArgEditor key={`osa${i}`}arg={a} i={i} path={[...onStartPath, 'Args']} />)}
          </SpaceBetween>
        </SpaceBetween>
      </FormField>
      <FormField label="On Configured" errorText={onConfiguredErrors}>
        <SpaceBetween direction="vertical" size="xs">
          <div key="on-start" style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            <div style={{flexGrow: 1}}>
              <Input
                placeholder="/home/ec2-user/start.sh"
                value={onConfigured}
                onChange={({detail}) => {editScript([...onConfiguredPath, 'Script'], detail.value)}} />
            </div>
            <div style={{flexShrink: 1}}>
              <Button onClick={() => addArg([...onConfiguredPath, 'Args'])}>+ Arg</Button>
            </div>
          </div>
          <SpaceBetween direction="vertical" size="xxs">
            {onConfiguredArgs.map((a, i) => <ArgEditor key={`oca${i}`} arg={a} i={i} path={[...onConfiguredPath, 'Args']} />)}
          </SpaceBetween>
        </SpaceBetween>
      </FormField>
    </SpaceBetween>
  </>
}

function SecurityGroups({basePath}) {
  const sgPath = [...basePath, 'Networking', 'AdditionalSecurityGroups'];
  const selectedSgs = useState(sgPath) || [];
  const sgSelected = useState(['app', 'wizard', 'sg-selected']);

  const sgs = useState(['aws', 'security_groups']) || [];
  const sgMap = sgs.reduce((acc, s) => {acc[s.GroupId] = s.GroupName; return acc}, {})
  console.log(useState(basePath));

  const itemToOption = item => {return {value: item.GroupId, label: item.GroupId, description: item.GroupName}}
  const removeSg = (i) => {
    setState(sgPath, [...selectedSgs.slice(0, i), ...selectedSgs.slice(i + 1)]);
    if(getState(sgPath).length === 0)
      clearState(sgPath);
  }
  return <SpaceBetween direction="vertical" size="xs">
    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap:"16px"}}>
      <Select
        selectedOption={(sgSelected && findFirst(sgs, x => x.GroupId === sgSelected.value)) ? itemToOption(findFirst(sgs, x => x.GroupId === sgSelected.value)) : {label: "Please Select A Security Group"}}
        onChange={({detail}) => {setState(['app', 'wizard', 'sg-selected'], detail.selectedOption)}}
        triggerVariant={'option'}
        options={sgs.map(itemToOption)}
      />
      <Button disabled={!sgSelected} onClick={() => setState(sgPath, [...selectedSgs, sgSelected.value])}>Add</Button>
    </div>
    <TokenGroup
      onDismiss={({ detail: { itemIndex } }) => {removeSg(itemIndex)}}
      items={selectedSgs.map((s) => {return {label: s, dismissLabel: `Remove ${s}`, description: sgMap[s]}})}
    />
  </SpaceBetween>
}

export { SubnetSelect, SecurityGroups, InstanceSelect, LabeledIcon, ActionsEditor, CustomAMISettings }
