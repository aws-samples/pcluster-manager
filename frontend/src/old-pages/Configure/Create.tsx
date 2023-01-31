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
import * as React from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {
  CreateCluster,
  UpdateCluster,
  ListClusters,
  DescribeCluster,
  notify,
} from '../../model'

// UI Elements
import {
  Container,
  Header,
  Checkbox,
  Spinner,
} from '@cloudscape-design/components'

// Components
import ValidationErrors from '../../components/ValidationErrors'
import ConfigView from '../../components/ConfigView'

// State
import {setState, getState, useState} from '../../store'
import {NavigateFunction} from 'react-router-dom'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'
import {useHelpPanel} from '../../components/help-panel/HelpPanel'

// Constants
const configPath = ['app', 'wizard', 'clusterConfigYaml']

function handleWarnings(resp: any) {
  if (!resp.validationMessages) return

  resp.validationMessages.forEach((message: any) => {
    notify(message.message, 'warning')
  })
}

function handleCreate(
  clearWizardState: () => void,
  navigate: NavigateFunction,
) {
  const clusterName = getState(['app', 'wizard', 'clusterName'])
  const editing = getState(['app', 'wizard', 'editing'])
  const disableRollback =
    getState(['app', 'wizard', 'disableRollback']) || false
  const forceUpdate = getState(['app', 'wizard', 'forceUpdate'])
  const clusterConfig = getState(configPath) || ''
  const dryRun = false
  const region = getState(['app', 'wizard', 'config', 'Region'])
  const selectedRegion = getState(['app', 'selectedRegion'])
  var errHandler = (err: any) => {
    setState(['app', 'wizard', 'errors', 'create'], err)
    setState(['app', 'wizard', 'pending'], false)
  }
  var successHandler = (resp: any) => {
    let href = `/clusters/${clusterName}/stack-events`
    handleWarnings(resp)

    setState(['app', 'wizard', 'pending'], false)
    DescribeCluster(clusterName)
    setState(['app', 'clusters', 'selected'], clusterName)
    ListClusters()
    clearWizardState()
    navigate(href)
  }
  setState(['app', 'wizard', 'errors', 'create'], null)

  if (editing) {
    setState(['app', 'wizard', 'pending'], 'Update')
    UpdateCluster(
      clusterName,
      clusterConfig,
      dryRun,
      forceUpdate,
      successHandler,
      errHandler,
    )
  } else {
    setState(['app', 'wizard', 'pending'], 'Create')
    CreateCluster(
      clusterName,
      clusterConfig,
      region,
      selectedRegion,
      disableRollback,
      dryRun,
      successHandler,
      errHandler,
    )
  }
}

function handleDryRun() {
  const clusterName = getState(['app', 'wizard', 'clusterName'])
  const editing = getState(['app', 'wizard', 'editing'])
  const forceUpdate = getState(['app', 'wizard', 'forceUpdate'])
  const clusterConfig = getState(configPath) || ''
  const region = getState(['app', 'wizard', 'config', 'Region'])
  const selectedRegion = getState(['app', 'selectedRegion'])
  const disableRollback = false
  const dryRun = true
  var errHandler = (err: any) => {
    setState(['app', 'wizard', 'errors', 'create'], err)
    setState(['app', 'wizard', 'pending'], false)
  }
  var successHandler = (resp: any) => {
    handleWarnings(resp)
    setState(['app', 'wizard', 'pending'], false)
  }
  setState(['app', 'wizard', 'pending'], 'Dry Run')
  setState(['app', 'wizard', 'errors', 'create'], null)
  if (editing)
    UpdateCluster(
      clusterName,
      clusterConfig,
      dryRun,
      forceUpdate,
      successHandler,
      errHandler,
    )
  else
    CreateCluster(
      clusterName,
      clusterConfig,
      region,
      selectedRegion,
      disableRollback,
      dryRun,
      successHandler,
      errHandler,
    )
}

function createValidate() {
  return true
}

const CreateReviewHelpPanel = () => {
  const {t} = useTranslation()
  const footerLinks = React.useMemo(
    () => [
      {
        title: t('wizard.create.helpPanel.link.title'),
        href: t('wizard.create.helpPanel.link.href'),
      },
    ],
    [t],
  )
  return (
    <TitleDescriptionHelpPanel
      title={t('wizard.create.helpPanel.title')}
      description={<Trans i18nKey="wizard.create.helpPanel.description" />}
      footerLinks={footerLinks}
    />
  )
}

const EditReviewHelpPanel = () => {
  const {t} = useTranslation()
  const footerLinks = React.useMemo(
    () => [
      {
        title: t('wizard.update.helpPanel.link.title'),
        href: t('wizard.update.helpPanel.link.href'),
      },
    ],
    [t],
  )
  return (
    <TitleDescriptionHelpPanel
      title={t('wizard.update.helpPanel.title')}
      description={<Trans i18nKey="wizard.update.helpPanel.description" />}
      footerLinks={footerLinks}
    />
  )
}

function Create() {
  const {t} = useTranslation()
  const clusterConfig = useState(configPath)
  const forceUpdate = useState(['app', 'wizard', 'forceUpdate']) || false
  const disableRollback =
    useState(['app', 'wizard', 'disableRollback']) || false
  const errors = useState(['app', 'wizard', 'errors', 'create'])
  const pending = useState(['app', 'wizard', 'pending'])
  const editing = getState(['app', 'wizard', 'editing'])

  const HelpPanelComponent = editing
    ? EditReviewHelpPanel
    : CreateReviewHelpPanel

  useHelpPanel(<HelpPanelComponent />)

  return (
    <Container>
      <ConfigView
        config={clusterConfig}
        pending={!clusterConfig}
        onChange={({detail}: any) => {
          setState(configPath, detail.value)
        }}
      />
      {errors && <ValidationErrors errors={errors} />}
      {pending && (
        <div>
          <Spinner size="normal" />{' '}
          {t('wizard.create.configuration.pending', {action: pending})}
        </div>
      )}
      {editing && (
        <Checkbox
          checked={forceUpdate}
          onChange={() =>
            setState(['app', 'wizard', 'forceUpdate'], !forceUpdate)
          }
        >
          {t('wizard.create.configuration.forceUpdate')}
        </Checkbox>
      )}
      {!editing && (
        <Checkbox
          checked={disableRollback}
          onChange={() =>
            setState(['app', 'wizard', 'disableRollback'], !disableRollback)
          }
        >
          {t('wizard.create.configuration.disableRollback')}
        </Checkbox>
      )}
    </Container>
  )
}

export {
  Create,
  EditReviewHelpPanel,
  CreateReviewHelpPanel,
  createValidate,
  handleCreate,
  handleDryRun,
}
