export interface ILogger<T> {
  info(message: string, extra?: Record<string, unknown>): T

  warning(message: string, extra?: Record<string, unknown>): T

  debug(message: string, extra?: Record<string, unknown>): T

  error(message: string, extra?: Record<string, unknown>): T

  critical(message: string, extra?: Record<string, unknown>): T
}
