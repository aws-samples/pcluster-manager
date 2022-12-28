import {Logger} from '../RemoteLogger'

const mockedExecuteRequest = jest.fn()

describe('given the application config', () => {
  beforeEach(() => {
    mockedExecuteRequest.mockClear()
  })

  describe('and the executeRequest function', () => {
    const response = {status: 200}
    mockedExecuteRequest.mockResolvedValue(response)

    describe('and a PCM Logger instance', () => {
      let logger = new Logger(mockedExecuteRequest)

      const expectedMethod = 'post'
      const expectedPath = '/logs'

      it('should successfully push a log entry', async () => {
        const response = await logger.info('info message')

        const expectedLogEntry = {
          message: 'info message',
          level: 'INFO',
          extra: {
            source: 'frontend',
          },
        }
        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
        expect(mockedExecuteRequest).toHaveBeenCalledWith(
          expectedMethod,
          expectedPath,
          expectedLogEntry,
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
            source: 'frontend',
          },
        }

        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
        expect(mockedExecuteRequest).toHaveBeenCalledWith(
          expectedMethod,
          expectedPath,
          expectedLogEntry,
        )
        expect(response.status).toBe(200)
      })

      it('should successfully push a log entry with a `source` parameter', async () => {
        const response = await logger.error(
          'error message',
          {
            extra1: 'value1',
            extra2: 'value2',
          },
          'different-source',
        )

        const expectedLogEntry = {
          message: 'error message',
          level: 'ERROR',
          extra: {
            extra1: 'value1',
            extra2: 'value2',
            source: 'different-source',
          },
        }

        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
        expect(mockedExecuteRequest).toHaveBeenCalledWith(
          expectedMethod,
          expectedPath,
          expectedLogEntry,
        )
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
          source: 'frontend',
        })

        expect(logSpy).toHaveBeenCalledWith('Unable to push log entry')
      })
    })
  })
})
