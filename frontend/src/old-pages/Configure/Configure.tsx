// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React, {useCallback} from 'react'
import {useNavigate} from 'react-router-dom'

import {clearState, getState, setState, useState} from '../../store'
import {LoadAwsConfig} from '../../model'

import {
  Button,
  SpaceBetween,
  Wizard,
  WizardProps,
} from '@cloudscape-design/components'

import {Source, sourceValidate} from './Source'
import {Cluster, clusterValidate} from './Cluster'
import {HeadNode, headNodeValidate} from './HeadNode'
import {MultiUser, multiUserValidate} from './MultiUser'
import {Storage, storageValidate} from './Storage'
import {Queues, queuesValidate} from './Queues/Queues'
import {
  Create,
  createValidate,
  handleCreate as wizardHandleCreate,
  handleDryRun as wizardHandleDryRun,
} from './Create'

import {stopComputeFleet, StopDialog} from '../Clusters/StopDialog'
import {useTranslation} from 'react-i18next'
import Layout from '../Layout'
import {useWizardSectionChangeLog} from '../../navigation/useWizardSectionChangeLog'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import i18next from 'i18next'
import {pages, useWizardNavigation} from './useWizardNavigation'

const validators: {[key: string]: (...args: any[]) => boolean} = {
  source: sourceValidate,
  cluster: clusterValidate,
  headNode: headNodeValidate,
  storage: storageValidate,
  queues: queuesValidate,
  create: createValidate,
}
const validate = (page: string): boolean => validators[page]()

function wizardShow(navigate: any) {
  const editing = getState(['app', 'wizard', 'editing'])
  const page = getState(['app', 'wizard', 'page'])
  if (editing) {
    clearState(['app', 'wizard', 'config'])
    clearState(['app', 'wizard', 'clusterConfigYaml'])
    clearState(['app', 'wizard', 'loaded'])
    setState(['app', 'wizard', 'editing'], false)
    setState(['app', 'wizard', 'page'], 'source')
  }
  if (!page) setState(['app', 'wizard', 'page'], 'source')
  navigate('/configure')
}
const loadingPath = ['app', 'wizard', 'source', 'loading']

function clearWizardState(
  clearState: (path: any) => void,
  clearErrorsOnly: boolean,
) {
  if (!clearErrorsOnly) {
    clearState(['app', 'wizard', 'config'])
    clearState(['app', 'wizard', 'clusterConfigYaml'])
    clearState(['app', 'wizard', 'clusterName'])
    clearState(['app', 'wizard', 'loaded'])
    clearState(['app', 'wizard', 'page'])
    clearState(['app', 'wizard', 'vpc'])
    clearState(['app', 'wizard', 'multiUser'])
    clearState(['app', 'wizard', 'validated'])
    clearState(loadingPath)
  }
  clearState(['app', 'wizard', 'errors'])
}

function Configure() {
  const {t} = useTranslation()
  const open = useState(['app', 'wizard', 'dialog'])
  const clusterName = useState(['app', 'wizard', 'clusterName'])
  const editing = useState(['app', 'wizard', 'editing'])
  const currentPage = useState(['app', 'wizard', 'page']) || 'source'
  const [refreshing, setRefreshing] = React.useState(false)
  let navigate = useNavigate()

  const clusterPath = ['clusters', 'index', clusterName]
  const fleetStatus = useState([...clusterPath, 'computeFleetStatus'])

  const clearStateAndCloseWizard = useCallback(() => {
    clearWizardState(clearState, false)
    navigate('/clusters')
  }, [navigate])

  const descriptionElementRef = React.useRef(null)
  React.useEffect(() => {
    if (open) {
      const {current: descriptionElement} = descriptionElementRef
      if (descriptionElement !== null) {
        ;(descriptionElement as any).focus()
      }
    }
  }, [open])

  React.useEffect(() => {
    const close = (e: any) => {
      if (e.key === 'Escape') {
        clearStateAndCloseWizard()
      }
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [clearStateAndCloseWizard])

  useWizardSectionChangeLog()

  const handleSubmit = useCallback(() => {
    wizardHandleCreate(() => clearWizardState(clearState, false), navigate)
  }, [wizardHandleCreate, clearWizardState, navigate])

  const handleRefresh = () => {
    setRefreshing(true)
    let region = getState(['wizard', 'region'])
    let chosenRegion = region === 'Default' ? null : region
    LoadAwsConfig(chosenRegion, () => setRefreshing(false))
  }

  const navigateWizard = useWizardNavigation(validate)

  const handleOnNavigate: NonCancelableEventHandler<WizardProps.NavigateDetail> =
    useCallback(
      ({detail}) => {
        navigateWizard(detail.reason, detail.requestedStepIndex)
      },
      [navigateWizard],
    )

  const showSecondaryActions = () => {
    return (
      <SpaceBetween direction="horizontal" size="xs">
        {currentPage !== 'source' && currentPage !== 'create' && (
          <Button
            loading={refreshing}
            onClick={handleRefresh}
            iconName={'refresh'}
          >
            {t('wizard.actions.refreshConfig')}
          </Button>
        )}
        {editing && (
          <Button
            variant="normal"
            disabled={
              fleetStatus !== 'RUNNING' &&
              fleetStatus !== 'STOP_REQUESTED' &&
              fleetStatus !== 'STOPPING'
            }
            loading={
              fleetStatus === 'STOP_REQUESTED' || fleetStatus === 'STOPPING'
            }
            onClick={stopComputeFleet}
          >
            {t('wizard.actions.stopComputeFleet')}
          </Button>
        )}
        {currentPage === 'create' && (
          <Button onClick={wizardHandleDryRun}>
            {t('wizard.actions.dryRun')}
          </Button>
        )}
      </SpaceBetween>
    )
  }

  return (
    <Layout
      contentType="form"
      pageSlug={editing ? 'clusterUpdate' : 'clusterCreate'}
      slugOnClick={clearStateAndCloseWizard}
    >
      <StopDialog clusterName={clusterName} />
      <Wizard
        i18nStrings={{
          stepNumberLabel: stepNumber =>
            i18next.t('wizard.navigation.stepNumberLabel', {
              stepNumber: stepNumber,
            }),
          collapsedStepsLabel: (stepNumber, stepsCount) =>
            i18next.t('wizard.navigation.collapsedStepsLabel', {
              stepNumber: stepNumber,
              stepsCount: stepsCount,
            }),
          navigationAriaLabel: t('wizard.navigation.steps'),
          cancelButton: t('wizard.actions.cancel'),
          previousButton: t('wizard.actions.back'),
          nextButton: t('wizard.actions.next'),
          submitButton: editing
            ? t('wizard.actions.update')
            : t('wizard.actions.create'),
          optional: t('wizard.navigation.optional'),
        }}
        onNavigate={handleOnNavigate}
        onCancel={clearStateAndCloseWizard}
        onSubmit={handleSubmit}
        activeStepIndex={pages.indexOf(currentPage)}
        secondaryActions={showSecondaryActions()}
        isLoadingNextStep={refreshing}
        steps={[
          {
            title: t('wizard.source.title'),
            description: t('wizard.source.description'),
            content: <Source />,
          },
          {
            title: t('wizard.cluster.title'),
            description: t('wizard.cluster.description'),
            content: <Cluster />,
          },
          {
            title: t('wizard.headNode.title'),
            description: t('wizard.headNode.description'),
            content: <HeadNode />,
          },
          {
            title: t('wizard.storage.title'),
            description: t('wizard.storage.description'),
            content: <Storage />,
          },
          {
            title: t('wizard.queues.title'),
            description: t('wizard.queues.description'),
            content: <Queues />,
          },
          {
            title: i18next.t('wizard.create.title', {
              action: editing
                ? t('wizard.actions.update')
                : t('wizard.actions.create'),
            }),
            description: t('wizard.create.description'),
            content: <Create />,
          },
        ]}
      />
    </Layout>
  )
}

export {Configure as default, wizardShow}
