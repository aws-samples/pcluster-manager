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
 * Hook used to update and show Cloudscape help system
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
 * const { updateHelpPanel } = useHelpPanel()
 * updateHelpPanel({ element: <HelpPanel .../>, open: true})
 * ```
 */

export const useHelpPanel = (initialPanel?: ReactElement) => {
  const [helpPanel, setHelpPanel] = useContext(HelpPanelContext)

  const updateHelpPanel = useCallback(
    ({element, open}: {element?: ReactElement; open?: boolean}) => {
      setHelpPanel({
        element: element || helpPanel.element,
        open: typeof open !== 'undefined' ? open : helpPanel.open,
      })
    },
    [setHelpPanel, helpPanel],
  )

  // This useEffect simplify the usage of the component
  // when displaying the help panel at page load
  // and avoid placing effects in the main page component
  useEffect(() => {
    if (initialPanel) {
      updateHelpPanel({element: initialPanel})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {...helpPanel, updateHelpPanel}
}
