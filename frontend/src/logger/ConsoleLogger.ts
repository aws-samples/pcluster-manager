import {ILogger} from './ILogger'

export class ConsoleLogger implements ILogger {
  critical(message: string, extra?: Record<string, unknown>): void {
    console.error(this.formatMessage(message, extra))
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    console.debug(this.formatMessage(message, extra))
  }

  error(message: string, extra?: Record<string, unknown>): void {
    console.error(this.formatMessage(message, extra))
  }

  info(message: string, extra?: Record<string, unknown>): void {
    console.info(this.formatMessage(message, extra))
  }

  warning(message: string, extra?: Record<string, unknown>): void {
    console.warn(this.formatMessage(message, extra))
  }

  private formatMessage(
    message: string,
    extra: Record<string, unknown> | undefined,
  ) {
    return `${message}${extra ? `, extra: ${JSON.stringify(extra)}` : ''}`
  }
}
