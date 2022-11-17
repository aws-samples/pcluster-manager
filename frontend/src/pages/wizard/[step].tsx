import {useRouter} from 'next/router'
import {FunctionComponent} from 'react'
import WIZARD_MAPPING_3_3 from '../../components/wizard/3.3'

const MAPPING_FOR_VERSION: Record<string, FunctionComponent[]> = {
  '3.3': WIZARD_MAPPING_3_3,
}

const VERSION = '3.3.0'

export default function Step() {
  const router = useRouter()
  const {step} = router.query
  if (step) {
    const stepToLoad = parseInt(step as string) - 1
    const versionToLoad = VERSION.substring(0, VERSION.lastIndexOf('.'))
    const WizardComponent = MAPPING_FOR_VERSION[versionToLoad][stepToLoad]
    return <WizardComponent />
  }
  return null
}
