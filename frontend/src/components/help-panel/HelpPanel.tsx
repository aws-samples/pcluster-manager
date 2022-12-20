import {
  createContext,
  Dispatch,
  FunctionComponent,
  ReactElement,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
 * const { setContent, setVisible } = useHelpPanel()
 * setContent(<HelpPanel .../>)
 * setVisible(true)
 * ```
 */

export const useHelpPanel = (initialPanel?: ReactElement) => {
  const [helpPanel, setHelpPanel] = useContext(HelpPanelContext)
  // The ref is used to keep track of local changes made to the help panel properties,
  // otherwise triggering both a content and a visibility change will result in a partial object update,
  // meaning that if you call setContent() and setVisible(true) sequentially you can end up
  // with a visible help panel, but with the old panel content
  const panelRef = useRef(helpPanel)

  const setContent = useCallback(
    (panel: ReactElement) => {
      panelRef.current.element = panel
      setHelpPanel({...panelRef.current})
    },
    [setHelpPanel],
  )

  const setVisible = useCallback(
    (visible: boolean) => {
      panelRef.current.open = visible
      setHelpPanel({...panelRef.current})
    },
    [setHelpPanel],
  )

  // This useEffect simplify the usage of the component
  // when displaying the help panel at page load
  // and avoid placing effects in the main page component
  useEffect(() => {
    if (initialPanel) {
      setContent(initialPanel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {...helpPanel, setContent, setVisible}
}
