import axios from 'axios'
import {AppConfig} from '../app-config/types'
import {handleNotAuthorizedErrors} from '../auth/handleNotAuthorizedErrors'
import identityFn from 'lodash/identity'

export const axiosInstance = axios.create({
  baseURL: getHost(),
})

function getHost() {
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:5001/'
  return '/'
}

export type HTTPMethod = 'get' | 'put' | 'post' | 'patch' | 'delete'

export function executeRequest(
  method: HTTPMethod,
  url: string,
  body?: any,
  appConfig?: AppConfig,
) {
  const requestFunc = axiosInstance[method]

  const headers = {'Content-Type': 'application/json'}
  const handle401and403 = appConfig
    ? handleNotAuthorizedErrors(appConfig)
    : identityFn<Promise<any>>

  return handle401and403(requestFunc(url, body, {headers}))
}
