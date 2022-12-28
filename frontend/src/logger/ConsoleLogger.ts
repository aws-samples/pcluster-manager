import {ILogger} from './ILogger'

export class ConsoleLogger implements ILogger {
  critical(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void {
    console.error(this.formatMessage(message, extra, source))
  }

  debug(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void {
    console.debug(this.formatMessage(message, extra, source))
  }

  error(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void {
    console.error(this.formatMessage(message, extra, source))
  }

  info(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void {
    console.info(this.formatMessage(message, extra, source))
  }

  warning(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void {
    console.warn(this.formatMessage(message, extra, source))
  }

  private formatMessage(
    message: string,
    extra: Record<string, unknown> | undefined,
    source?: string,
  ) {
    if (!extra) extra = {}

    extra['source'] ||= source
    return `${message}, extra: ${JSON.stringify(extra)}`
  }
}
