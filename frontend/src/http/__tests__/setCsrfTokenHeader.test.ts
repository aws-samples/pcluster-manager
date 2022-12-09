// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {AxiosInstance} from 'axios'
import {mock, MockProxy} from 'jest-mock-extended'
import {setCsrfTokenHeader} from '../setCsrfTokenHeader'

describe('given a function to set the X-CSRF-Token header ', () => {
  describe('and an axios instance', () => {
    let mockAxiosInstance: MockProxy<AxiosInstance>
    beforeEach(() => {
      mockAxiosInstance = mock<AxiosInstance>()
    })

    describe('when the token is retrieved successfully', () => {
      beforeEach(() => {
        mockAxiosInstance.defaults.headers = {}
      })
      it('should map the received configuration to the known AppConfig', async () => {
        setCsrfTokenHeader(mockAxiosInstance, 'some-token')
        expect(mockAxiosInstance.defaults.headers['X-CSRF-Token']).toBe(
          'some-token',
        )
      })
    })
  })
})
