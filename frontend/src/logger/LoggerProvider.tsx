import React, {useContext} from 'react'
import {ILogger} from './ILogger'
import {AppConfig} from '../app-config/types'
import {useState} from '../store'
import {executeRequest} from '../http/executeRequest'
import {ConsoleLogger} from './ConsoleLogger'
import {Logger} from './RemoteLogger'

const consoleLogger = new ConsoleLogger()
const LoggerContext = React.createContext<ILogger<any>>(consoleLogger)

export function useLogger(): ILogger<any> {
  return useContext(LoggerContext)
}

const appConfigPath = ['app', 'appConfig']

function makeLogger(appConfig?: AppConfig): ILogger<any> {
  if (process.env.NODE_ENV !== 'production') return consoleLogger
  return new Logger(executeRequest, appConfig)
}

export function LoggerProvider(props: any) {
  const [logger, setLogger] = React.useState<ILogger<any>>(consoleLogger)
  const appConfig: AppConfig | undefined = useState(appConfigPath)

  React.useEffect(() => {
    const _logger = makeLogger(appConfig)
    setLogger(_logger)
  }, [appConfig, setLogger])

  return (
    <LoggerContext.Provider value={logger}>
      {props.children}
    </LoggerContext.Provider>
  )
}
