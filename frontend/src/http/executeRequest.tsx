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

export type RequestParams = [
  method: HTTPMethod,
  url: string,
  body?: any,
  headers?: Record<string, string>,
  appConfig?: AppConfig,
]

export function executeRequest(...params: RequestParams) {
  const [method, url, body, headers, appConfig] = params
  const requestFunc = axiosInstance[method]

  const defaultHeaders = {'Content-Type': 'application/json'}
  const handle401and403 = appConfig
    ? handleNotAuthorizedErrors(appConfig)
    : identityFn<Promise<any>>

  return handle401and403(
    requestFunc(url, body, {headers: {...defaultHeaders, ...headers}}),
  )
}
