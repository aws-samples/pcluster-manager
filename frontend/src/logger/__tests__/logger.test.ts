import {AppConfig} from '../../app-config/types'
import {Logger} from '../RemoteLogger'

const mockedExecuteRequest = jest.fn()

describe('given the application config', () => {
  let mockAppConfig: AppConfig = {
    authUrl: 'http://somepath.com',
    clientId: 'some-id',
    redirectUri: 'some-uri',
    scopes: 'some-list',
  }

  beforeEach(() => {
    mockedExecuteRequest.mockClear()
  })

  describe('and the executeRequest function', () => {
    const response = {status: 200}
    mockedExecuteRequest.mockResolvedValue(response)

    describe('and a PCM Logger instance', () => {
      let logger = new Logger(mockedExecuteRequest, mockAppConfig)

      const expectedMethod = 'post'
      const expectedPath = '/logs'

      it('should successfully push a log entry', async () => {
        const response = await logger.info('info message')

        const expectedLogEntry = {
          message: 'info message',
          level: 'INFO',
        }
        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
        expect(mockedExecuteRequest).toHaveBeenCalledWith(
          expectedMethod,
          expectedPath,
          expectedLogEntry,
          mockAppConfig,
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

        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
        expect(mockedExecuteRequest).toHaveBeenCalledWith(
          expectedMethod,
          expectedPath,
          expectedLogEntry,
          mockAppConfig,
        )
        expect(response.status).toBe(200)
      })

      it('logs a warning about the impossiblity to push the log entry', async () => {
        const logSpy = jest.spyOn(console, 'warn')
        mockedExecuteRequest.mockRejectedValueOnce({
          Code: 400,
          Message: 'Error message',
        })

        await logger.error('error message', {
          extra1: 'value1',
          extra2: 'value2',
        })

        expect(logSpy).toHaveBeenCalledWith('Unable to push log entry')
      })
    })
  })
})
