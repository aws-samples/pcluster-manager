import {getState, setState, updateState, useState} from '../../store'
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml'

const pages = [
  'source',
  'cluster',
  'multiUser',
  'headNode',
  'storage',
  'queues',
  'create',
]

export const useWizardNavigation = (validate: (page: string) => boolean) => {
  const currentPage = useState(['app', 'wizard', 'page']) || 'source'
  const isMultiUserEnabled = useState(['app', 'wizard', 'multiUser'])
  const source = useState(['app', 'wizard', 'source', 'type'])

  return (reason: string, requestedStepIndex: number) => {
    switch (reason) {
      case 'next':
        handleNext(currentPage, isMultiUserEnabled, validate)
        break
      case 'previous':
        handlePrev(currentPage, source, isMultiUserEnabled)
        break
      case 'step':
        handleStep(currentPage, pages[requestedStepIndex], validate)
        break
      default:
        setPage('source')
    }
  }
}

const handleNext = (
  currentPage: string,
  isMultiUserEnabled: boolean,
  validate: (page: string) => boolean,
) => {
  if (validate(currentPage))
    updateState(['app', 'wizard', 'validated'], (existing: any) =>
      (existing || new Set()).add(currentPage),
    )
  else return

  if (currentPage === 'cluster') {
    if (isMultiUserEnabled) {
      setPage('multiUser')
      return
    } else {
      setPage('headNode')
      return
    }
  }
  const nextPage = pages[pages.indexOf(currentPage) + 1]
  setPage(nextPage)
}

const handlePrev = (
  currentPage: string,
  source: string,
  isMultiUserEnabled: boolean,
) => {
  setState(['app', 'wizard', 'errors'], null)

  // Special case where the user uploaded a file, hitting "back"
  // goes back to the upload screen rather than through the wizard
  if (currentPage === 'create' && source === 'upload') {
    setPage('source')
    return
  }
  if (currentPage === 'headNode') {
    if (isMultiUserEnabled) {
      setPage('multiUser')
      return
    } else {
      setPage('cluster')
      return
    }
  }
  const prevPage = pages[pages.indexOf(currentPage) - 1]
  setPage(prevPage)
}

const handleStep = (
  currentPage: string,
  requestedPage: string,
  validate: (page: string) => boolean,
) => {
  if (
    pages.indexOf(requestedPage) < pages.indexOf(currentPage) ||
    validate(currentPage)
  ) {
    setPage(requestedPage)
  }
}

function setPage(page: string) {
  const config = getState(['app', 'wizard', 'config'])
  if (page === 'create') {
    console.log(jsyaml.dump(config))
    setState(['app', 'wizard', 'clusterConfigYaml'], jsyaml.dump(config))
  }
  setState(['app', 'wizard', 'page'], page)
}

export {pages}
