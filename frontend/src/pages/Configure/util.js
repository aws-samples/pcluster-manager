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

import { setState, getState } from '../../store'
import { LoadAwsConfig } from '../../model'
import { getIn } from '../../util'

function loadTemplateLazy(config, callback)
{
  const subnets = getState(['aws', 'subnets']) || [];
  const keypairs = getState(['aws', 'keypairs']) || [];
  const keypairNames = new Set(keypairs.map((kp) => kp.KeyName));
  const keypairPath = ['HeadNode', 'Ssh', 'KeyName'];
  if(getIn(config, ['Image', 'CustomAmi']))
    setState(['app', 'wizard', 'customAMI', 'enabled'], true)

  const subnetIndex = subnets.reduce((acc, subnet) => {acc[subnet.SubnetId] = subnet.VpcId; return acc}, {});

  if(getIn(config, ['HeadNode', 'Networking', 'SubnetId']))
  {
    const vpc = getIn(subnetIndex, [getIn(config, ['HeadNode', 'Networking', 'SubnetId'])]);
    if(vpc)
      setState(['app', 'wizard', 'vpc'], vpc);
  }

  // Don't override defaults
  setState(['app', 'wizard', 'loaded'], true);
  setState(['app', 'wizard', 'config'], config);
  if(keypairs.length > 0 && !keypairNames.has(getIn(config, keypairPath)))
    setState(['app', 'wizard', 'config', ...keypairPath], keypairs[0].KeyName);
  setState(['app', 'wizard', 'page'], 'cluster');
  callback && callback();
}

export default function loadTemplate(config, callback) {
  let defaultRegion = getState(['aws', 'region']) || "";
  const region = getState(['app', 'selectedRegion']) || defaultRegion;

  if(!getIn(config, ['Region']))
  {
    config['Region'] = region;
    loadTemplateLazy(config);
  }
  else
  {
    const chosenRegion = config.Region;
    setState(['app', 'wizard', 'config', 'Region'], chosenRegion);
    LoadAwsConfig(chosenRegion, () => loadTemplateLazy(config, callback));
  }

}


export { loadTemplate }
