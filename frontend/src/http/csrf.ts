import {RequestParams} from './executeRequest'

export const requestWithCSRF = async (
  internalRequest: (...params: RequestParams) => Promise<any>,
  ...params: RequestParams
) => {
  const [method, url, body, headers, appConfig] = params

  if (method === 'get') {
    return internalRequest(...params)
  }
  const {data} = (await internalRequest(
    'get',
    '/csrf',
    null,
    {},
    appConfig,
  )) as {
    data: {csrf_token: string}
  }
  const tokenHeader = {
    'X-CSRF-Token': data.csrf_token,
  }
  return internalRequest(
    method,
    url,
    body,
    {...headers, ...tokenHeader},
    appConfig,
  )
}
