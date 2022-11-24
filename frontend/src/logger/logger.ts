import {AxiosInstance} from 'axios'
import {AppConfig} from '../app-config/types'
import {handleNotAuthorizedErrors} from '../auth/handleNotAuthorizedErrors'
import identityFn from 'lodash/identity'

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

interface PostLogResponse {
  Code?: number
  Message?: string
}

export class Logger {
  private readonly post
  private readonly handle401and403

  constructor(axios: AxiosInstance, appConfig?: AppConfig) {
    this.post = axios.post
    this.handle401and403 = appConfig
      ? handleNotAuthorizedErrors(appConfig)
      : identityFn<Promise<any>>
  }

  log(logLevel: LogLevel, message: string, extra?: {[key: string]: string}) {
    const logEntry = this.buildMessage(logLevel, message, extra)
    return this.handle401and403(
      this.post('/logs', logEntry, {
        headers: {'Content-Type': 'application/json'},
      }),
    ).catch(({Code, Message}: PostLogResponse) => ({
      status: Code,
      message: Message,
    }))
  }

  info(message: string, extra?: {[key: string]: string}) {
    return this.log(LogLevel.info, message, extra)
  }

  warning(message: string, extra?: {[key: string]: string}) {
    return this.log(LogLevel.warning, message, extra)
  }

  debug(message: string, extra?: {[key: string]: string}) {
    return this.log(LogLevel.debug, message, extra)
  }

  error(message: string, extra?: {[key: string]: string}) {
    return this.log(LogLevel.error, message, extra)
  }

  critical(message: string, extra?: {[key: string]: string}) {
    return this.log(LogLevel.critical, message, extra)
  }

  private buildMessage(
    level: LogLevel,
    message: string,
    extra?: {[p: string]: string},
  ): PostLogRequest {
    return {message, level, extra}
  }
}
