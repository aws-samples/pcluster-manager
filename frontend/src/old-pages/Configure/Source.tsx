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

import React, {useMemo} from 'react'
import i18next from 'i18next'
import {Trans, useTranslation} from 'react-i18next'
import {useState, setState, getState, clearState} from '../../store'
import {loadTemplate} from './util'
import {findFirst} from '../../util'
import {GetConfiguration} from '../../model'

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml'

// UI Elements
import {
  Box,
  Container,
  FormField,
  Header,
  Input,
  RadioGroup,
  Select,
  SpaceBetween,
} from '@cloudscape-design/components'

// Components
import {HiddenUploader} from '../../components/FileChooser'
import Loading from '../../components/Loading'

// Types
import {ClusterInfoSummary, ClusterStatus} from '../../types/clusters'
import {useHelpPanel} from '../../components/help-panel/HelpPanel'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'
import InfoLink from '../../components/InfoLink'

// Constants
const sourcePath = ['app', 'wizard', 'source']
const sourceErrorsPath = ['app', 'wizard', 'errors', 'source']

function copyFrom(sourceClusterName: any) {
  const loadingPath = ['app', 'wizard', 'source', 'loading']
  GetConfiguration(sourceClusterName, (configuration: any) => {
    loadTemplate(jsyaml.load(configuration), () => setState(loadingPath, false))
  })
}

function sourceValidate(suppressUpload = false) {
  let clusterName = getState(['app', 'wizard', 'clusterName'])
  const clusters = getState(['clusters', 'list']) || []
  let clusterNames = new Set(clusters.map((c: any) => c.clusterName))
  let sourceClusterName = getState([
    'app',
    'wizard',
    'source',
    'selectedCluster',
  ])
  let upload = getState([...sourcePath, 'upload'])
  let source = getState([...sourcePath, 'type'])
  let valid = true
  const loadingPath = ['app', 'wizard', 'source', 'loading']

  setState([...sourceErrorsPath, 'validated'], true)

  if (!clusterName || clusterName === '') {
    setState(
      [...sourceErrorsPath, 'clusterName'],
      i18next.t('wizard.source.validation.cannotBeBlank'),
    )
    valid = false
  } else if (clusterNames.has(clusterName)) {
    setState(
      [...sourceErrorsPath, 'clusterName'],
      i18next.t('wizard.source.validation.alreadyExists', {
        clusterName: clusterName,
      }),
    )
    valid = false
  } else if (!/^[a-zA-Z][a-zA-Z0-9-]+$/.test(clusterName)) {
    setState(
      [...sourceErrorsPath, 'clusterName'],
      i18next.t('wizard.source.validation.doesntMatchRegex', {
        clusterName: clusterName,
      }),
    )
    valid = false
  } else {
    clearState([...sourceErrorsPath, 'clusterName'])
  }

  if (
    source === 'cluster' &&
    (!sourceClusterName || sourceClusterName === '')
  ) {
    setState(
      [...sourceErrorsPath, 'sourceClusterName'],
      i18next.t('wizard.source.validation.specifySourceCopy'),
    )
    valid = false
  } else {
    clearState([...sourceErrorsPath, 'sourceClusterName'])
  }

  // Returning false here tells the wizard not to advance
  // which allows us to explicitly control the page if the
  // user selects a file (or stay here if they do not)
  if (valid && source === 'template' && !suppressUpload) {
    upload()
    return false
  }

  if (valid && source === 'cluster' && !suppressUpload) {
    setState(loadingPath, true)
    copyFrom(sourceClusterName)
    return false
  }

  return valid
}

function checkMinorVersion(v1: string, v2: string) {
  return v1.split('.', 2).join('.') === v2.split('.', 2).join('.')
}

function ClusterSelect() {
  const selectedPath = ['app', 'wizard', 'source', 'selectedCluster']
  const apiVersion = useState(['app', 'version', 'full'])
  const clusters = useState(['clusters', 'list']) || []
  const selectableClusters = clusters
    .filter(
      (cluster: ClusterInfoSummary) =>
        cluster.clusterStatus != ClusterStatus.DeleteInProgress,
    )
    .filter((cluster: ClusterInfoSummary) =>
      checkMinorVersion(cluster.version, apiVersion),
    )

  const selected = useState(selectedPath)
  const errors = useState([...sourceErrorsPath, 'sourceClusterName'])
  let source = useState([...sourcePath, 'type'])
  let validated = useState([...sourceErrorsPath, 'validated'])

  const itemToOption = (item: ClusterInfoSummary) => ({
    label: item.clusterName,
    value: item.clusterName,
  })

  return (
    <FormField errorText={errors}>
      <Select
        disabled={source !== 'cluster'}
        selectedOption={
          selected
            ? itemToOption(
                findFirst(selectableClusters, (x: any) => {
                  return x.clusterName === selected
                }),
              )
            : null
        }
        onChange={({detail}) => {
          setState(selectedPath, detail.selectedOption.value)
          validated && sourceValidate(true)
        }}
        placeholder={i18next.t('wizard.source.clusterSelect.placeholder')}
        selectedAriaLabel="Selected"
        options={selectableClusters.map(itemToOption)}
        empty={i18next.t('wizard.source.sourceOptions.cluster.empty')}
      />
    </FormField>
  )
}

const SourceHelpPanel = () => {
  const {t} = useTranslation()
  const footerLinks = useMemo(
    () => [
      {
        title: t('wizard.source.helpPanel.link.title'),
        href: t('wizard.source.helpPanel.link.href'),
      },
    ],
    [t],
  )
  return (
    <TitleDescriptionHelpPanel
      title={<Trans i18nKey="wizard.source.helpPanel.title" />}
      description={<Trans i18nKey="wizard.source.helpPanel.description" />}
      footerLinks={footerLinks}
    />
  )
}

function Source() {
  const {t} = useTranslation()
  let clusterName = useState(['app', 'wizard', 'clusterName']) || ''
  let source = useState([...sourcePath, 'type'])
  let validated = useState([...sourceErrorsPath, 'validated'])
  let clusterNameError = useState([...sourceErrorsPath, 'clusterName'])
  const loadingPath = ['app', 'wizard', 'source', 'loading']
  const loading = useState(loadingPath)

  useHelpPanel(<SourceHelpPanel />)

  React.useEffect(() => {
    if (!getState([...sourcePath, 'type']))
      setState([...sourcePath, 'type'], 'wizard')
  }, [])

  const handleUpload = (data: any) => {
    if (source === 'template') {
      loadTemplate(jsyaml.load(data))
    }
  }

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <SpaceBetween direction="vertical" size="m">
          <SpaceBetween direction="vertical" size="xxs" key="cluster-name">
            <Header
              variant="h2"
              description={t('wizard.source.clusterName.description')}
            >
              <Trans i18nKey="wizard.source.clusterName.label" />
            </Header>
            <FormField errorText={clusterNameError}>
              <Input
                onChange={({detail}) => {
                  setState(['app', 'wizard', 'clusterName'], detail.value)
                  validated && sourceValidate(true)
                }}
                value={clusterName}
                placeholder={t('wizard.source.clusterName.placeholder')}
              />
            </FormField>
          </SpaceBetween>
          <Container
            header={
              <Header
                variant="h2"
                description={t('wizard.source.configurationSource.description')}
              ></Header>
            }
          >
            <SpaceBetween direction="vertical" size="xxs" key="source">
              <RadioGroup
                onChange={({detail}) =>
                  setState([...sourcePath, 'type'], detail.value)
                }
                value={source}
                items={[
                  {
                    value: 'wizard',
                    label: t('wizard.source.sourceOptions.wizard.label'),
                    description: t(
                      'wizard.source.sourceOptions.wizard.description',
                    ),
                  },
                  {
                    value: 'template',
                    label: t('wizard.source.sourceOptions.template.label'),
                    description: t(
                      'wizard.source.sourceOptions.template.description',
                    ),
                  },
                  {
                    value: 'cluster',
                    label: t('wizard.source.sourceOptions.cluster.label'),
                    description: (
                      <Box margin={{bottom: 'xs'}}>
                        <SpaceBetween direction="vertical" size="xxs">
                          <FormField
                            description={t(
                              'wizard.source.sourceOptions.cluster.description',
                            )}
                          >
                            <ClusterSelect />
                          </FormField>
                        </SpaceBetween>
                      </Box>
                    ),
                  },
                ]}
              />
              <HiddenUploader
                callbackPath={['app', 'wizard', 'source', 'upload']}
                handleData={handleUpload}
              />
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      )}
    </div>
  )
}

export {Source, SourceHelpPanel, sourceValidate}
