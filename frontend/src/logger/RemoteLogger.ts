import {HTTPMethod} from '../http/executeRequest'
import {AxiosError} from 'axios'
import {ILogger} from './ILogger'

enum LogLevel {
  info = 'INFO',
  warning = 'WARNING',
  debug = 'DEBUG',
  error = 'ERROR',
  critical = 'CRITICAL',
}

interface PostLogRequest {
  message: string
  level: LogLevel
  extra?: Record<string, unknown>
}

interface PostLogError {
  Code: number
  Message: string
}

type PostLogSuccess = {}

export class Logger implements ILogger {
  private readonly executeRequest

  constructor(
    executeRequest: (
      method: HTTPMethod,
      url: string,
      body?: any,
    ) => Promise<any>,
  ) {
    this.executeRequest = executeRequest
  }

  private log(
    logLevel: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<PostLogSuccess> {
    if (!extra) extra = {}
    extra['source'] = source || 'frontend'

    const logEntry = this.buildMessage(logLevel, message, extra)
    return this.executeRequest('post', '/logs', {logs: [logEntry]}).catch(
      (err: AxiosError<PostLogError>) =>
        console.warn('Unable to push log entry'),
    )
  }

  info(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<any> {
    return this.log(LogLevel.info, message, extra, source)
  }

  warning(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<any> {
    return this.log(LogLevel.warning, message, extra, source)
  }

  debug(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<any> {
    return this.log(LogLevel.debug, message, extra, source)
  }

  error(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<any> {
    return this.log(LogLevel.error, message, extra, source)
  }

  critical(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): Promise<any> {
    return this.log(LogLevel.critical, message, extra, source)
  }

  private buildMessage(
    level: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
  ): PostLogRequest {
    return {message, level, extra}
  }
}
