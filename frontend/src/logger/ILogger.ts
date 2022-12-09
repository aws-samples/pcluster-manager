export interface ILogger {
  info(message: string, extra?: Record<string, unknown>): void

  warning(message: string, extra?: Record<string, unknown>): void

  debug(message: string, extra?: Record<string, unknown>): void

  error(message: string, extra?: Record<string, unknown>): void

  critical(message: string, extra?: Record<string, unknown>): void
}
