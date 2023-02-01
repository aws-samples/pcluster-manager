import {getState, setState, updateState, useState} from '../../store'
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml'

const pages = ['source', 'cluster', 'headNode', 'storage', 'queues', 'create']

export const useWizardNavigation = (validate: (page: string) => boolean) => {
  const currentPage = useState(['app', 'wizard', 'page']) || 'source'

  return (reason: string, requestedStepIndex: number) => {
    switch (reason) {
      case 'next':
        handleNext(currentPage, validate)
        break
      case 'previous':
        handlePrev(currentPage)
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
  validate: (page: string) => boolean,
) => {
  if (validate(currentPage))
    updateState(['app', 'wizard', 'validated'], (existing: any) =>
      (existing || new Set()).add(currentPage),
    )
  else return

  const nextPage = pages[pages.indexOf(currentPage) + 1]
  setPage(nextPage)
}

const handlePrev = (currentPage: string) => {
  setState(['app', 'wizard', 'errors'], null)

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
