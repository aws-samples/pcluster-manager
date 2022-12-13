import React, {useContext} from 'react'
import {ILogger} from './ILogger'
import {executeRequest} from '../http/executeRequest'
import {ConsoleLogger} from './ConsoleLogger'
import {Logger} from './RemoteLogger'

export const logger: ILogger =
  process.env.NODE_ENV !== 'production'
    ? new ConsoleLogger()
    : new Logger(executeRequest)

const LoggerContext = React.createContext<ILogger>(logger)

export function useLogger(): ILogger {
  return useContext(LoggerContext)
}

export function LoggerProvider(props: any) {
  return (
    <LoggerContext.Provider value={logger}>
      {props.children}
    </LoggerContext.Provider>
  )
}
