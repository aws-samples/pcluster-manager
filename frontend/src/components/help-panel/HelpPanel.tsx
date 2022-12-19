import {HelpPanel} from '@cloudscape-design/components'
import {
  createContext,
  Dispatch,
  FunctionComponent,
  ReactElement,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

type PanelElement = string | ReactElement
type PanelContext = {
  element: string | ReactElement
  open: boolean
}

const DEFAULT_PANEL_CONTEXT = {
  element: <></>,
  open: false,
}

const HelpPanelContext = createContext<
  [PanelContext, Dispatch<SetStateAction<PanelContext>>]
>([DEFAULT_PANEL_CONTEXT, () => null])

export const HelpPanelProvider: FunctionComponent = ({children}) => {
  const helpPanelState = useState<PanelContext>(DEFAULT_PANEL_CONTEXT)
  return (
    <HelpPanelContext.Provider value={helpPanelState}>
      {children}
    </HelpPanelContext.Provider>
  )
}

export const useHelpPanel = (panelElement?: PanelElement) => {
  const [helpPanel, setHelpPanel] = useContext(HelpPanelContext)

  const setContent = useCallback(
    (panel: PanelElement) => {
      setHelpPanel({...helpPanel, element: panel})
    },
    [helpPanel, setHelpPanel],
  )

  const setVisible = useCallback(
    (visible: boolean) => {
      setHelpPanel({...helpPanel, open: visible})
    },
    [helpPanel, setHelpPanel],
  )

  useEffect(() => {
    if (panelElement) {
      setContent(panelElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {...helpPanel, setContent, setVisible}
}
