import {AxiosError, AxiosInstance} from 'axios'
import {ILogger} from '../logger/ILogger'

export const enableHttpLogs = (
  axiosInstance: AxiosInstance,
  logger: ILogger,
) => {
  const requestInterceptor = axiosInstance.interceptors.request.use(config => {
    if (!isLogEndpoint(config.url)) {
      logger.info('HTTP request started', {
        url: config.url,
      })
    }
    return config
  })
  const responseInterceptor = axiosInstance.interceptors.response.use(
    response => {
      if (!isLogEndpoint(response.config?.url)) {
        logger.info('HTTP response received', {
          url: response.config?.url,
          statusCode: response.status,
        })
      }
      return response
    },
    (error: AxiosError) => {
      if (!isLogEndpoint(error.config?.url)) {
        logger.info('HTTP response received', {
          url: error.config?.url,
          statusCode: error.response?.status,
        })
      }
      return Promise.reject(error)
    },
  )
  return () => {
    axiosInstance.interceptors.request.eject(requestInterceptor)
    axiosInstance.interceptors.response.eject(responseInterceptor)
  }
}

const isLogEndpoint = (url: string | undefined) =>
  url && url.indexOf('/logs') > -1
