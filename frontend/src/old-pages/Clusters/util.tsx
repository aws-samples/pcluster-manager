// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml';

import { DescribeCluster, GetConfiguration } from '../../model'
import { clearState, getState, setState } from '../../store'

export function selectCluster(clusterName: any, navigate: any)
{
  const oldClusterName = getState(['app', 'clusters', 'selected']);
  const name = clusterName;
  let config_path = ['clusters', 'index', name, 'config'];
  clearState(['clusters', 'index', name]);
  GetConfiguration(name, (configuration: any) => {
    setState(['clusters', 'index', name, 'configYaml'], configuration);
    setState(config_path, jsyaml.load(configuration))});
  DescribeCluster(name, () => {navigate && navigate('/clusters')});
  if(oldClusterName !== clusterName)
    setState(['app', 'clusters', 'selected'], name);
}
