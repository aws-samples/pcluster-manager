import {useRouter} from 'next/router'
import {useEffect} from 'react'

export default function WizardIndex() {
  const router = useRouter()
  useEffect(() => {
    router.push('/wizard/1')
  }, [router])
  return null
}
