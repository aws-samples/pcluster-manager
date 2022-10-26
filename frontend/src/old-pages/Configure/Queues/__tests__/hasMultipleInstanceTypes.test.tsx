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

import {Queue} from '../queues.types'
import {hasMultipleInstanceTypes} from '../SlurmMemorySettings'

describe('Given a function to validate if mutiple instance types have been selected', () => {
  describe('if at least a resource of a queue has multiple instance types selected', () => {
    const queues: Queue[] = [
      {
        Name: 'queue1',
        AllocationStrategy: 'capacity-optimized',
        ComputeResources: [
          {
            Name: 'cr1',
            MaxCount: 4,
            MinCount: 0,
            Instances: [
              {InstanceType: 'c5.small'},
              {InstanceType: 'c5.xlarge'},
            ],
          },
        ],
      },
      {
        Name: 'queue2',
        AllocationStrategy: 'capacity-optimized',
        ComputeResources: [
          {
            Name: 'cr2',
            MaxCount: 2,
            MinCount: 0,
            Instances: [{InstanceType: 'c4.small'}],
          },
        ],
      },
    ]
    it('should be valid', () => {
      expect(hasMultipleInstanceTypes(queues)).toBeTruthy()
    })
  })
  describe('if all the resources of every queue have one instance type selected', () => {
    const queues: Queue[] = [
      {
        Name: 'queue1',
        AllocationStrategy: 'lowest-price',
        ComputeResources: [
          {
            Name: 'cr1',
            MaxCount: 4,
            MinCount: 0,
            Instances: [{InstanceType: 't3.small'}],
          },
        ],
      },
      {
        Name: 'queue2',
        AllocationStrategy: 'lowest-price',
        ComputeResources: [
          {
            Name: 'cr2-a',
            MaxCount: 2,
            MinCount: 0,
            Instances: [{InstanceType: 't3.medium'}],
          },
          {
            Name: 'cr2-b',
            MaxCount: 3,
            MinCount: 1,
            Instances: [{InstanceType: 'c5.medium'}],
          },
        ],
      },
    ]
    it('should fail the validation', () => {
      expect(hasMultipleInstanceTypes(queues)).toBeFalsy()
    })
  })
  describe('if default values are selected', () => {
    const queues: Queue[] = [
      {
        Name: 'queue0',
        AllocationStrategy: 'capacity-optimized',
        ComputeResources: [
          {
            Name: 'cr0',
            MaxCount: 4,
            MinCount: 0,
            Instances: [{InstanceType: 'c5n.xlarge'}],
          },
        ],
      },
    ]
    it('should fail the validation', () => {
      expect(hasMultipleInstanceTypes(queues)).toBeFalsy()
    })
  })
})
