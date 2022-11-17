import {merge} from 'lodash'
import { useRouter } from 'next/router'
import {createContext, FunctionComponent, useCallback, useState} from 'react'
import {PClusterConfig} from '../3.3/schema'

export const WizardContext = createContext<
  [PClusterConfig | null, (config: Partial<PClusterConfig>) => void]
>([null, () => null])

export const WizardProvider: FunctionComponent = ({children}) => {
  const [config, updateConfig] = useState<PClusterConfig | null>(null)
  const router = useRouter();
  const mergeConfig = useCallback(
    newConfig => {
      updateConfig(merge(config, newConfig))
      const currentStep = parseInt(router.query.step as string);
      router.push(`/wizard/${currentStep + 1}`);
    },
    [config, router],
  )

  return (
    <WizardContext.Provider value={[config, mergeConfig]}>
      {children}
    </WizardContext.Provider>
  )
}
