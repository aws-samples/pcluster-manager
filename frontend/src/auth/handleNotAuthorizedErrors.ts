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

export const handleNotAuthorizedErrors = ({authUrl, clientId, scopes, redirectUri}: AppConfig) => async (requestPromise: Promise<any>) => {
  return requestPromise.catch(
    error => {
      switch ((error as AxiosError).response?.status) {
        case 401:
        case 403:
          redirectToAuthServer(authUrl, clientId, scopes, redirectUri)
          return Promise.reject(error)
      }
      return Promise.reject(error)
    }
  )
}

function redirectToAuthServer(authUrl: string, clientId: string, scopes: string, redirectUri: string) {
  const url = `${authUrl}?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${redirectUri}&state=${oauth2StateParameter()}`
  window.location.replace(url)
}

function oauth2StateParameter(length = 16): string {
    return Math.random().toString(20).substring(2, length)
}