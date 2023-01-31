import {Link} from '@cloudscape-design/components'
import {ReactElement, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useHelpPanel} from './help-panel/HelpPanel'

type InfoLinkProps = {
  helpPanel: ReactElement
  ariaLabel?: string
}

function InfoLink({ariaLabel, helpPanel}: InfoLinkProps) {
  const {updateHelpPanel} = useHelpPanel()
  const {t} = useTranslation()

  const setHelpPanel = useCallback(() => {
    updateHelpPanel({element: helpPanel, open: true})
  }, [updateHelpPanel, helpPanel])

  return (
    <Link
      variant="info"
      onFollow={setHelpPanel}
      ariaLabel={ariaLabel || t('infoLink.ariaLabel')}
    >
      {t('infoLink.label')}
    </Link>
  )
}

export default InfoLink
