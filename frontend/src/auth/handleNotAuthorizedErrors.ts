// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import { AxiosError } from 'axios';
import { AppConfig } from '../app-config/types';

export const handleNotAuthorizedErrors = ({authPath, clientId, scopes, redirectUrl}: AppConfig) => async (requestPromise: Promise<any>) => {
  return requestPromise.catch(
    error => {
      switch ((error as AxiosError).response?.status) {
        case 401:
        case 403:
          redirectToAuthServer(authPath, clientId, scopes, redirectUrl)
          return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  )
}

function redirectToAuthServer(authPath: string, clientId: string, scopes: string, redirectUrl: string) {
  const url = `${authPath}/login?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${redirectUrl}`
  window.location.replace(url)
}