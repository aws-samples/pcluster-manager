import axios from 'axios'
import {AppConfig} from '../app-config/types'
import {handleNotAuthorizedErrors} from '../auth/handleNotAuthorizedErrors'
import identityFn from 'lodash/identity'
import {requestWithCSRF} from './csrf'

export const axiosInstance = axios.create({
  baseURL: getHost(),
})

function getHost() {
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:5001/'
  return '/'
}

export type HTTPMethod = 'get' | 'put' | 'post' | 'patch' | 'delete'

export type RequestParams = [
  method: HTTPMethod,
  url: string,
  body?: any,
  headers?: Record<string, string>,
  appConfig?: AppConfig,
]

export function internalExecuteRequest(...params: RequestParams) {
  const [method, url, body, headers, appConfig] = params
  const requestFunc = axiosInstance[method]

  const headersToSend = {'Content-Type': 'application/json', ...headers}
  const handle401and403 = appConfig
    ? handleNotAuthorizedErrors(appConfig)
    : identityFn<Promise<any>>

  const promise =
    method === 'get' || method === 'delete'
      ? requestFunc(url, {headers: headersToSend})
      : requestFunc(url, body, {headers: headersToSend})

  return handle401and403(promise)
}

export const executeRequest = (...params: RequestParams) =>
  requestWithCSRF(internalExecuteRequest, ...params)
