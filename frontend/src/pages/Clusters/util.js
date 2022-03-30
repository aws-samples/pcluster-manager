// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import jsyaml from 'js-yaml';

import { DescribeCluster, GetConfiguration } from '../../model'
import { setState } from '../../store'

export function selectCluster(clusterName)
{
    const name = clusterName;
    let config_path = ['clusters', 'index', name, 'config'];
    GetConfiguration(name, (configuration) => {
      setState(['clusters', 'index', name, 'configYaml'], configuration);
      setState(config_path, jsyaml.load(configuration))});
    DescribeCluster(name);
    setState(['app', 'clusters', 'selected'], name);
}
