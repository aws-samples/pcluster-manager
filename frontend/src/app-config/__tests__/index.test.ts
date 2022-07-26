// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import { AxiosInstance } from "axios"
import { mock, MockProxy } from "jest-mock-extended"
import { getAppConfig } from ".."

describe('given a function to fetch the application configuration', () => {
  describe('and an axios instance', () => {
    let mockGet: jest.Mock;
    let mockAxiosInstance: MockProxy<AxiosInstance>;
    beforeEach(() => {
      mockGet = jest.fn()
      mockAxiosInstance = mock<AxiosInstance>()
    })
    describe('when the configuration is available', () => {
      beforeEach(() => {
        const mockAppConfig = {
          auth_path: 'some-path',
          client_id: 'some-id',
          scopes: 'some-list',
          redirect_url: 'some-url',
        }
        mockAxiosInstance.get.mockResolvedValueOnce({data: mockAppConfig})
      })
      it('should map the received configuration to the known AppConfig', async () => {
        const config = await getAppConfig(mockAxiosInstance)
        expect(config).toEqual({
          authPath: 'some-path',
          clientId: 'some-id',
          redirectUrl: 'some-url',
          scopes: 'some-list'
        })
      })
    })
  })
})