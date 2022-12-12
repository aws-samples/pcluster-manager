import axios, {AxiosInstance} from 'axios'
import {mock} from 'jest-mock-extended'
import {ILogger} from '../../logger/ILogger'
import {enableHttpLogs} from '../httpLogs'

describe('Given a logger and an axios instance', () => {
  let axiosInstance: AxiosInstance
  let logger: ILogger

  beforeEach(() => {
    axiosInstance = axios.create()
    logger = mock<ILogger>()
    enableHttpLogs(axiosInstance, logger)
  })

  describe('when a log request is started or received', () => {
    it('it should not be logged', () => {
      const requestHandler = (axiosInstance as any).interceptors.request
        .handlers[0].fulfilled
      const responseHandler = (axiosInstance as any).interceptors.response
        .handlers[0].fulfilled
      const responseHandlerRejected = (axiosInstance as any).interceptors
        .response.handlers[0].rejected

      requestHandler({
        url: '/logs',
      })
      responseHandler({
        config: {
          url: '/logs',
        },
        status: 200,
      })
      try {
        responseHandlerRejected({
          config: {
            url: '/logs',
          },
          response: {
            status: 401,
          },
        })
      } catch {}

      expect(logger.info).not.toHaveBeenCalled()
    })
  })

  describe('when a generic request is started', () => {
    it('should be logged', () => {
      const requestHandler = (axiosInstance as any).interceptors.request
        .handlers[0].fulfilled
      requestHandler({
        url: '/clusters',
      })

      expect(logger.info).toHaveBeenCalledWith(expect.any(String), {
        url: '/clusters',
      })
    })
  })

  describe('when a generic request is successful', () => {
    it('should be logged', () => {
      const responseHandler = (axiosInstance as any).interceptors.response
        .handlers[0].fulfilled
      responseHandler({
        config: {
          url: '/clusters',
        },
        status: 200,
      })

      expect(logger.info).toHaveBeenCalledWith(expect.any(String), {
        url: '/clusters',
        statusCode: 200,
      })
    })
  })

  describe('when a generic request is not successful', () => {
    it('should be logged', () => {
      const responseHandler = (axiosInstance as any).interceptors.response
        .handlers[0].rejected
      try {
        responseHandler({
          config: {
            url: '/clusters',
          },
          response: {
            status: 401,
          },
        })
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(expect.any(String), {
          url: '/clusters',
          statusCode: 401,
        })
      }
    })
  })
})
