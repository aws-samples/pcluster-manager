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

// UI Elements
import {
  Autosuggest,
  Select,
} from "@awsui/components-react";

// State / Model
import { setState, getState, useState } from '../../store'

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
    console.log(item);
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

export { SubnetSelect, InstanceSelect, LabeledIcon }
