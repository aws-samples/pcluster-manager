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

type PanelContext = {
  element: ReactElement
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

/*
 * Components used to update and show Cloudscape help system
 * https://cloudscape.design/patterns/general/help-system/
 *
 * Examples:
 *
 * Show the help panel when loading a page
 * ```
 * useHelpPanel(<HelpPanel .../>)
 * ```
 *
 * Update and show the help panel when tapping on an Info link
 * ```
 * const { setContent, setVisible } = useHelpPanel()
 * setContent(<HelpPanel .../>)
 * setVisible(true)
 * ```
 */

export const useHelpPanel = (panelElement?: ReactElement) => {
  const [helpPanel, setHelpPanel] = useContext(HelpPanelContext)

  const setContent = useCallback(
    (panel: ReactElement) => {
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

  // This useEffect simplify the usage of the component
  // when displaying the help panel at page load
  // and avoid placing effects in the main page component
  useEffect(() => {
    if (panelElement) {
      setContent(panelElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {...helpPanel, setContent, setVisible}
}
