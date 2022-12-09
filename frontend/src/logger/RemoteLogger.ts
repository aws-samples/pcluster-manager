import {AppConfig} from '../app-config/types'
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
  private appConfig: AppConfig | undefined

  constructor(
    executeRequest: (
      method: HTTPMethod,
      url: string,
      body?: any,
      _appConfig?: AppConfig,
    ) => Promise<any>,
    appConfig?: AppConfig,
  ) {
    this.executeRequest = executeRequest
    this.appConfig = appConfig
  }

  private log(
    logLevel: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
  ): Promise<PostLogSuccess> {
    const logEntry = this.buildMessage(logLevel, message, extra)
    return this.executeRequest('post', '/logs', logEntry, this.appConfig).catch(
      (err: AxiosError<PostLogError>) =>
        console.warn('Unable to push log entry'),
    )
  }

  info(message: string, extra?: Record<string, unknown>): Promise<any> {
    return this.log(LogLevel.info, message, extra)
  }

  warning(message: string, extra?: Record<string, unknown>): Promise<any> {
    return this.log(LogLevel.warning, message, extra)
  }

  debug(message: string, extra?: Record<string, unknown>): Promise<any> {
    return this.log(LogLevel.debug, message, extra)
  }

  error(message: string, extra?: Record<string, unknown>): Promise<any> {
    return this.log(LogLevel.error, message, extra)
  }

  critical(message: string, extra?: Record<string, unknown>): Promise<any> {
    return this.log(LogLevel.critical, message, extra)
  }

  private buildMessage(
    level: LogLevel,
    message: string,
    extra?: Record<string, unknown>,
  ): PostLogRequest {
    return {message, level, extra}
  }
}
