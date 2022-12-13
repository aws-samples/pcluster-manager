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
import {getCsrfToken} from '../getCsrfToken'

describe('given a function to fetch the CSRF token', () => {
  describe('and an axios instance', () => {
    let mockGet: jest.Mock
    let mockAxiosInstance: MockProxy<AxiosInstance>
    beforeEach(() => {
      mockGet = jest.fn()
      mockAxiosInstance = mock<AxiosInstance>()
    })

    describe('when the token is retrieved successfully', () => {
      beforeEach(() => {
        const mockResponse = {
          csrf_token: 'some-token',
        }
        mockAxiosInstance.get.mockResolvedValueOnce({data: mockResponse})
      })
      it('should return the token', async () => {
        const token = await getCsrfToken(mockAxiosInstance)
        expect(token).toBe('some-token')
      })
    })
  })
})
