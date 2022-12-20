import {Link} from '@cloudscape-design/components'
import {ReactElement} from 'react'
import {useTranslation} from 'react-i18next'
import {useHelpPanel} from './help-panel/HelpPanel'

interface InfoLinkProps {
  ariaLabel: string
  helpPanel: ReactElement
}

function InfoLink({ariaLabel, helpPanel}: InfoLinkProps) {
  const {setContent, setVisible} = useHelpPanel()
  const {t} = useTranslation()

  const setHelpPanel = () => {
    setContent(helpPanel)
    setVisible(true)
  }

  return (
    <Link variant="info" onFollow={setHelpPanel} ariaLabel={ariaLabel}>
      {t('infoLink.label')}
    </Link>
  )
}

export default InfoLink
