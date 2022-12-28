// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {AvailableFeature} from './types'

const versionToFeaturesMap: Record<string, AvailableFeature[]> = {
  '3.1.0': ['multiuser_cluster'],
  '3.2.0': [
    'fsx_ontap',
    'fsx_openzsf',
    'lustre_persistent2',
    'memory_based_scheduling',
    'multiuser_cluster',
    'slurm_queue_update_strategy',
  ],
  '3.3.0': ['slurm_accounting', 'queues_multiple_instance_types'],
  '3.4.0': ['on_node_updated'],
}

function composeFlagsListByVersion(currentVersion: string): AvailableFeature[] {
  let features: Set<AvailableFeature> = new Set([])

  for (let version in versionToFeaturesMap) {
    if (currentVersion >= version) {
      features = new Set([...features, ...versionToFeaturesMap[version]])
    }
  }

  return Array.from(features)
}

export function featureFlagsProvider(version: string): AvailableFeature[] {
  const features: AvailableFeature[] = []

  return features.concat(composeFlagsListByVersion(version))
}
