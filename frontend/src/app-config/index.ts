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
import {AppConfig} from './types'

interface RawAppConfig {
  auth_url: string
  client_id: string
  scopes: string
  redirect_uri: string
}

function mapAppConfig(data: RawAppConfig): AppConfig {
  return {
    authUrl: data.auth_url,
    clientId: data.client_id,
    redirectUri: data.redirect_uri,
    scopes: data.scopes,
  }
}

export async function getAppConfig(
  axiosInstance: AxiosInstance,
): Promise<AppConfig | {}> {
  const {data} = await axiosInstance.get('manager/get_app_config')
  return data ? mapAppConfig(data) : {}
}
