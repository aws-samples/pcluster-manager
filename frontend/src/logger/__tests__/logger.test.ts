import {ILogger} from '../ILogger'
import {Logger} from '../RemoteLogger'

const mockedExecuteRequest = jest.fn()

describe('Given a RemoteLogger', () => {
  beforeEach(() => {
    mockedExecuteRequest.mockClear()
    mockedExecuteRequest.mockResolvedValue({status: 200})
  })

  describe('when buffering is not enabled', () => {
    let logger: ILogger
    beforeEach(() => {
      logger = new Logger(mockedExecuteRequest, {size: 1, window: 0})
    })

    const expectedMethod = 'post'
    const expectedPath = '/logs'

    it('should successfully push a log entry', () => {
      logger.info('info message')

      const expectedLogEntry = {
        logs: [
          {
            message: 'info message',
            level: 'INFO',
            extra: {
              source: 'frontend',
            },
          },
        ],
      }
      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })

    it('should successfully push the trace when message is an Error', () => {
      logger.error(new Error('some-message'))

      const expectedLogEntry = {
        logs: [
          {
            message: 'some-message',
            level: 'ERROR',
            extra: {
              source: 'frontend',
              trace: expect.any(String),
            },
          },
        ],
      }
      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })

    it('should successfully push an undefined message', () => {
      logger.info(undefined as unknown as string)

      const expectedLogEntry = {
        logs: [
          {
            message: 'This log entry has no message.',
            level: 'INFO',
            extra: {
              source: 'frontend',
            },
          },
        ],
      }
      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })

    it('should successfully push a non-string message', () => {
      logger.info({somekey: 'some-value'} as unknown as string)

      const expectedLogEntry = {
        logs: [
          {
            message: '{"somekey":"some-value"}',
            level: 'INFO',
            extra: {
              source: 'frontend',
            },
          },
        ],
      }
      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })

    it('should successfully push a log entry with extra parameters', () => {
      logger.error('error message', {
        extra1: 'value1',
        extra2: 'value2',
      })

      const expectedLogEntry = {
        logs: [
          {
            message: 'error message',
            level: 'ERROR',
            extra: {
              extra1: 'value1',
              extra2: 'value2',
              source: 'frontend',
            },
          },
        ],
      }

      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })

    it('should successfully push a log entry with a `source` parameter', () => {
      logger.error(
        'error message',
        {
          extra1: 'value1',
          extra2: 'value2',
        },
        'different-source',
      )

      const expectedLogEntry = {
        logs: [
          {
            message: 'error message',
            level: 'ERROR',
            extra: {
              extra1: 'value1',
              extra2: 'value2',
              source: 'different-source',
            },
          },
        ],
      }

      expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      expect(mockedExecuteRequest).toHaveBeenCalledWith(
        expectedMethod,
        expectedPath,
        expectedLogEntry,
      )
    })
  })

  describe('when buffering is enabled', () => {
    let subject: ILogger
    beforeEach(() => {
      jest.useFakeTimers()
      subject = new Logger(mockedExecuteRequest, {size: 2, window: 1 * 1000})
    })
    afterEach(() => jest.useRealTimers())
    describe('when the items logged are less than the buffer size', () => {
      it('should not send the logs', () => {
        subject.info('Test log')

        expect(mockedExecuteRequest).not.toHaveBeenCalled()
      })
    })

    describe('when the items logged are more than the buffer size', () => {
      it('should flush the buffer', () => {
        subject.info('Test log')
        subject.warning('Warning log')

        expect(mockedExecuteRequest).toHaveBeenCalledWith('post', '/logs', {
          logs: [
            expect.objectContaining({message: 'Test log'}),
            expect.objectContaining({message: 'Warning log'}),
          ],
        })
      })
    })

    describe('when the items logged are less than the buffer size but the window time has passed', () => {
      it('should flush the buffer', () => {
        subject.info('Test log')
        jest.advanceTimersByTime(1100)

        expect(mockedExecuteRequest).toHaveBeenCalledWith('post', '/logs', {
          logs: [expect.objectContaining({message: 'Test log'})],
        })
      })
    })

    describe('when the window time has passed but the buffer is empty', () => {
      it('should not perform any calls', () => {
        subject.info('Test log')
        subject.warning('Warning log')
        jest.advanceTimersByTime(1100)

        expect(mockedExecuteRequest).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the logging call fails', () => {
      beforeEach(() => {
        jest.useRealTimers()
        mockedExecuteRequest.mockReset()
        mockedExecuteRequest.mockRejectedValue({
          Code: 400,
          Message: 'Error message',
        })
      })
      it('should try to send logs at the next log call', async () => {
        subject.info('Test log')
        subject.warning('Warning log')
        await new Promise(resolve => setTimeout(resolve, 1))
        subject.info('New log')

        expect(mockedExecuteRequest).toHaveBeenCalledTimes(2)
        expect(mockedExecuteRequest).toHaveBeenCalledWith('post', '/logs', {
          logs: [
            expect.objectContaining({message: 'Test log'}),
            expect.objectContaining({message: 'Warning log'}),
            expect.objectContaining({message: 'New log'}),
          ],
        })
      })
    })
  })
})
