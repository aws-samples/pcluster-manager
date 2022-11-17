import {merge} from 'lodash'
import {useRouter} from 'next/router'
import {createContext, FunctionComponent, useCallback, useState} from 'react'

export const WizardContext = createContext<any>([null, () => null])

export type UpdateConfig<T> = (config: Partial<T>) => void

export const WizardProvider: FunctionComponent = ({children}) => {
  const [config, updateConfig] = useState(null)
  const router = useRouter()
  const mergeConfig = useCallback(
    newConfig => {
      updateConfig(merge(config, newConfig))
      const currentStep = parseInt(router.query.step as string)
      router.push(`/wizard/${currentStep + 1}`)
    },
    [config, router],
  )

  return (
    <WizardContext.Provider value={[config, mergeConfig]}>
      {children}
    </WizardContext.Provider>
  )
}
