import {AppConfig} from '../../app-config/types'
import {Logger} from '../logger'
import axios from 'axios'

const mockedAxios = axios as jest.Mocked<typeof axios>
jest.mock('axios')

describe('given the application config', () => {
  let mockAppConfig: AppConfig

  beforeEach(() => {
    mockAppConfig = {
      authUrl: 'http://somepath.com',
      clientId: 'some-id',
      redirectUri: 'some-uri',
      scopes: 'some-list',
    }

    mockedAxios.post.mockClear()
  })

  describe('and an axios instance', () => {
    const response = {status: 200}
    mockedAxios.post.mockResolvedValue(response)

    describe('and a PCM Logger instance', () => {
      let logger = new Logger(mockedAxios, mockAppConfig)

      const expectedPath = '/logs'
      const expectedConfig = {headers: {'Content-Type': 'application/json'}}

      it('should successfully push a log entry', async () => {
        const response = await logger.info('info message')

        const expectedLogEntry = {
          message: 'info message',
          level: 'INFO',
        }

        expect(mockedAxios.post).toHaveBeenCalledTimes(1)
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expectedPath,
          expectedLogEntry,
          expectedConfig,
        )
        expect(response.status).toBe(200)
      })

      it('should successfully push a log entry with extra parameters', async () => {
        const response = await logger.error('error message', {
          extra1: 'value1',
          extra2: 'value2',
        })

        const expectedLogEntry = {
          message: 'error message',
          level: 'ERROR',
          extra: {
            extra1: 'value1',
            extra2: 'value2',
          },
        }

        expect(mockedAxios.post).toHaveBeenCalledTimes(1)
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expectedPath,
          expectedLogEntry,
          expectedConfig,
        )
        expect(response.status).toBe(200)
      })

      it('logs an error to stderr when incorrect data is passed', async () => {
        const logSpy = jest.spyOn(console, 'warn')
        mockedAxios.post.mockRejectedValueOnce({
          Code: 400,
          Message: 'Error message',
        })

        const response = await logger.error('error message', {
          extra1: 'value1',
          extra2: 'value2',
        })

        expect(response.status).toBe(400)
        expect(response.message).toBe('Error message')
      })
    })
  })
})
