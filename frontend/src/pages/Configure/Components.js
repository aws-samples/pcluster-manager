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

  const instanceTypes = useState(['aws', 'instanceTypes']) || [];

  let groupNames = ['General Purpose', 'Compute', 'HPC', 'High Memory', 'Graviton', 'Mixed', 'GPU'];

  let groups = {};

  for(let instance of instanceTypes)
  {
    let group = 'General Purpose';
    let img = '/img/od.svg'
    if(instance.InstanceType.startsWith('c6g')) {
      group = 'Graviton';
    } else if(instance.InstanceType.startsWith('c'))
    {
      img = '/img/c5.svg'
      if(instance.InstanceType.startsWith('c5n'))
        img = '/img/c5n.svg'
      group = 'Compute';
    } else if(instance.InstanceType.startsWith('hpc')) {
      group = 'HPC';
    } else if(instance.InstanceType.startsWith('m')) {
      group = 'Mixed';
    } else if(instance.InstanceType.startsWith('r')) {
      group = 'High Memory';
    } else if(instance.InstanceType.startsWith('p') || instance.InstanceType.startsWith('g')) {
      if(instance.InstanceType.startsWith('p3'))
        img = '/img/p3.svg'
      group = 'GPU';
    }

    if(!(group in groups))
      groups[group] = []

    let desc = `${instance.VCpuInfo.DefaultVCpus} vcpus, ${instance.MemoryInfo.SizeInMiB / 1024}GB memory`

    if(Object.keys(instance.GpuInfo).length > 0)
      desc = `${instance.GpuInfo.Count} x ${instance.GpuInfo.Name}, ${desc}`

    groups[group].push([instance.InstanceType, desc, img])
  }

  groupNames = groupNames.filter(name => name in groups);

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
      options={groupNames.map((groupName) => {
        return {
          label: groupName,
          options: groups[groupName].map(instanceToOption)}})}/>
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
