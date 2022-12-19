// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {MockProxy} from 'jest-mock-extended'
import {mapComputeResources} from '../queues.mapper'
import {
  MultiInstanceComputeResource,
  SingleInstanceComputeResource,
} from '../queues.types'

describe('given a mapper to import the ComputeResources section of the Scheduling config', () => {
  let mockVersion: string

  describe('when the application supports multiple instance types', () => {
    beforeEach(() => {
      mockVersion = '3.3.0'
    })

    describe('when the configuration was created with the single instance type format', () => {
      let mockComputeResources: MockProxy<SingleInstanceComputeResource[]>

      beforeEach(() => {
        mockComputeResources = [
          {
            Name: 'some-name',
            MinCount: 0,
            MaxCount: 1,
            InstanceType: 'some-instance',
          },
        ]
      })
      it('should convert the configuration into the flexible instance typs format', () => {
        const expected = [
          {
            Name: 'some-name',
            MinCount: 0,
            MaxCount: 1,
            Instances: [
              {
                InstanceType: 'some-instance',
              },
            ],
          },
        ]
        expect(mapComputeResources(mockVersion, mockComputeResources)).toEqual(
          expected,
        )
      })
    })
    describe('when the configuration was created with the flexible instance types format', () => {
      let mockComputeResources: MockProxy<MultiInstanceComputeResource[]>

      beforeEach(() => {
        mockComputeResources = [
          {
            Name: 'some-name',
            MinCount: 0,
            MaxCount: 1,
            Instances: [
              {
                InstanceType: 'some-instance',
              },
            ],
          },
        ]
      })
      it('should leave the configuration as is', () => {
        expect(mapComputeResources(mockVersion, mockComputeResources)).toEqual(
          mockComputeResources,
        )
      })
    })
  })

  describe('when the application does not support multiple instance types', () => {
    let mockComputeResources: MockProxy<SingleInstanceComputeResource[]>

    beforeEach(() => {
      mockVersion = '3.2.0'
      mockComputeResources = [
        {
          Name: 'some-name',
          MinCount: 0,
          MaxCount: 1,
          InstanceType: 'some-instance',
        },
      ]
    })

    it('should leave the configuration as is', () => {
      expect(mapComputeResources(mockVersion, mockComputeResources)).toEqual(
        mockComputeResources,
      )
    })
  })
})
