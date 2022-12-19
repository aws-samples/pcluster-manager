import {useTranslation} from 'react-i18next'
import TitleDescriptionHelpPanel from './TitleDescriptionHelpPanel'

export const DefaultHelpPanel = () => {
  const {t} = useTranslation()
  return (
    <TitleDescriptionHelpPanel
      title={t('helpPanel.default.title')}
      description={t('helpPanel.default.description')}
    />
  )
}
