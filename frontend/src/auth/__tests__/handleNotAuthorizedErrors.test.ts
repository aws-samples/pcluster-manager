// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import { AppConfig } from '../../app-config/types';
import { handleNotAuthorizedErrors } from "../handleNotAuthorizedErrors"

delete (global.window as any).location;
global.window.location = { replace: jest.fn() } as any;

describe('given the application config', () => {
  let mockAppConfig: AppConfig

  beforeEach(() => {
    mockAppConfig = {
      authPath: 'some-path',
      clientId: 'some-id',
      redirectUrl: 'some-url',
      scopes: 'some-list'
    }
  })

  describe('and an HTTP request promise', () => {
    let mockRequestPromise: Promise<any>
    let rejectPromise: any

    describe('when the request fails with 401', () => {
      beforeEach(() => {
        mockRequestPromise = new Promise((resolve, reject) => {
          rejectPromise = reject
        })
      })
      it('should redirect to the authorization server', () => {
        handleNotAuthorizedErrors(mockAppConfig)(mockRequestPromise).catch(() => {
            expect(global.window.location.replace).toHaveBeenCalledTimes(1)
            expect(global.window.location.replace).toHaveBeenCalledWith('some-path/login?response_type=code&client_id=some-id&scope=some-list&redirect_uri=some-url')
          })

        rejectPromise({ response: { status: 401 } })
      })
    })
  })
})