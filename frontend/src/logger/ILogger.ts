export interface ILogger {
  info(message: string, extra?: Record<string, unknown>, source?: string): void

  warning(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void

  debug(message: string, extra?: Record<string, unknown>, source?: string): void

  error(
    message: Error | string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void

  critical(
    message: string,
    extra?: Record<string, unknown>,
    source?: string,
  ): void
}
