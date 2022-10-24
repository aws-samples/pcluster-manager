// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {featureFlagsProvider} from '../featureFlagsProvider'

describe('given a feature flags provider and a list of rules', () => {
  const subject = featureFlagsProvider

  describe('when the features list is retrieved', () => {
    it('should return the list', async () => {
      const features = await subject('0.0.0')
      expect(features).toEqual([])
    })
  })

  describe('when the version is between 3.1.0 and 3.2.0', () => {
    it('should return the list of available features', async () => {
      const features = await subject('3.1.5')
      expect(features).toEqual(['multiuser_cluster'])
    })
  })

  describe('when the version is between 3.2.0 and 3.3.0', () => {
    it('should return the list of available features', async () => {
      const features = await subject('3.2.5')
      expect(features).toEqual([
        'multiuser_cluster',
        'fsx_ontap',
        'fsx_openzsf',
        'lustre_persistent2',
        'memory_based_scheduling',
        'slurm_queue_update_strategy',
      ])
    })
  })

  describe('when the version is above 3.3.0', () => {
    it('should return the list of available features', async () => {
      const features = await subject('3.3.2')
      expect(features).toEqual([
        'multiuser_cluster',
        'fsx_ontap',
        'fsx_openzsf',
        'lustre_persistent2',
        'memory_based_scheduling',
        'slurm_queue_update_strategy',
        'slurm_accounting',
        'queues_multiple_instance_types',
      ])
    })
  })
})
