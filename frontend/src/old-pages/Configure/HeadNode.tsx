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

// Frameworks
import * as React from 'react'
import i18next from 'i18next'
import {Trans, useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import {findFirst, getIn} from '../../util'

// UI Elements
import {
  Box,
  ColumnLayout,
  Container,
  ExpandableSection,
  FormField,
  Header,
  Input,
  Select,
  SpaceBetween,
  Toggle,
} from '@awsui/components-react'

// State
import {
  setState,
  getState,
  useState,
  clearState,
  updateState,
  ssmPolicy,
} from '../../store'

// Components
import {
  ActionsEditor,
  InstanceSelect,
  RootVolume,
  SecurityGroups,
  SubnetSelect,
  IamPoliciesEditor,
} from './Components'
import HelpTooltip from '../../components/HelpTooltip'
import {useFeatureFlag} from '../../feature-flags/useFeatureFlag'
import {
  SlurmSettings,
  validateSlurmSettings,
} from './SlurmSettings/SlurmSettings'

// Constants
const headNodePath = ['app', 'wizard', 'config', 'HeadNode']
const errorsPath = ['app', 'wizard', 'errors', 'headNode']

function headNodeValidate() {
  const subnetPath = [...headNodePath, 'Networking', 'SubnetId']
  const subnetValue = getState(subnetPath)

  const rootVolumeSizePath = [
    ...headNodePath,
    'LocalStorage',
    'RootVolume',
    'Size',
  ]
  const rootVolumeValue = getState(rootVolumeSizePath)

  const instanceTypePath = [...headNodePath, 'InstanceType']
  const instanceTypeValue = getState(instanceTypePath)

  const actionsPath = [...headNodePath, 'CustomActions']

  const onStartPath = [...actionsPath, 'OnNodeStart']
  const onStart = getState(onStartPath)

  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured']
  const onConfigured = getState(onConfiguredPath)

  let valid = true

  if (!subnetValue) {
    setState(
      [...errorsPath, 'subnet'],
      i18next.t('wizard.headNode.validation.selectSubnet'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'subnet'])
  }

  if (!instanceTypeValue) {
    setState(
      [...errorsPath, 'instanceType'],
      i18next.t('wizard.headNode.validation.selectInstanceType'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'instanceType'])
  }

  if (rootVolumeValue === '') {
    setState(
      [...errorsPath, 'rootVolume'],
      i18next.t('wizard.headNode.validation.setRootVolumeSize'),
    )
    valid = false
  } else if (
    rootVolumeValue &&
    (!Number.isInteger(rootVolumeValue) || rootVolumeValue < 35)
  ) {
    setState(
      [...errorsPath, 'rootVolume'],
      i18next.t('wizard.headNode.validation.rootVolumeMinimum'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'rootVolume'])
  }

  if (
    onStart &&
    getState([...onStartPath, 'Args']) &&
    !getState([...onStartPath, 'Script'])
  ) {
    setState(
      [...errorsPath, 'onStart'],
      i18next.t('wizard.headNode.validation.scriptWithArgs'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'onStart'])
  }

  if (
    onConfigured &&
    getState([...onConfiguredPath, 'Args']) &&
    !getState([...onConfiguredPath, 'Script'])
  ) {
    setState(
      [...errorsPath, 'onConfigured'],
      i18next.t('wizard.headNode.validation.scriptWithArgs'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'onConfigured'])
  }

  valid = validateSlurmSettings()

  setState([...errorsPath, 'validated'], true)

  return valid
}

function enableSsm(enable: any) {
  const iamPolicies = getState([
    ...headNodePath,
    'Iam',
    'AdditionalIamPolicies',
  ])
  const defaultRegion = getState(['aws', 'region'])
  const region = getState(['app', 'selectedRegion']) || defaultRegion

  if (enable) {
    if (iamPolicies && findFirst(iamPolicies, isSsmPolicy)) return
    updateState(
      [...headNodePath, 'Iam', 'AdditionalIamPolicies'],
      (existing: any) => {
        return [...(existing || []), {Policy: ssmPolicy(region)}]
      },
    )
  } else {
    if (!iamPolicies || (iamPolicies && !findFirst(iamPolicies, isSsmPolicy)))
      return
    if (iamPolicies.length === 1) clearState([...headNodePath, 'Iam'])
    else {
      updateState(
        [...headNodePath, 'Iam', 'AdditionalIamPolicies'],
        (existing: any) =>
          existing.filter((p: any) => {
            return !isSsmPolicy(p)
          }),
      )
    }
  }
}

function KeypairSelect() {
  const {t} = useTranslation()
  const keypairs = useState(['aws', 'keypairs']) || []
  const keypairPath = [...headNodePath, 'Ssh', 'KeyName']
  const keypair = useState(keypairPath) || ''
  const editing = useState(['app', 'wizard', 'editing'])
  const keypairToOption = (kp: any) => {
    if (kp === 'None' || kp === null || kp === undefined)
      return {label: 'None', value: null}
    else return {label: kp.KeyName, value: kp.KeyName}
  }

  const keypairsWithNone = ['None', ...keypairs]

  const setKeyPair = (kpValue: any) => {
    if (kpValue) setState(keypairPath, kpValue)
    else {
      clearState([...headNodePath, 'Ssh'])
      enableSsm(true)
    }
  }

  return (
    <FormField
      label={t('wizard.headNode.keypair.label')}
      description={t('wizard.headNode.keypair.description')}
    >
      <Select
        disabled={editing}
        selectedOption={keypairToOption(
          findFirst(keypairs, (x: any) => {
            return x.KeyName === keypair
          }),
        )}
        onChange={({detail}) => {
          setKeyPair(detail.selectedOption.value)
        }}
        selectedAriaLabel="Selected"
        options={keypairsWithNone.map(keypairToOption)}
      />
    </FormField>
  )
}

function isSsmPolicy(p: any) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region)
}

function SsmSettings() {
  const {t} = useTranslation()
  const dcvEnabled = useState([...headNodePath, 'Dcv', 'Enabled']) || false

  const ssmEnabled = useSelector(state => {
    const iamPolicies = getIn(state, [
      ...headNodePath,
      'Iam',
      'AdditionalIamPolicies',
    ])
    return findFirst(iamPolicies, isSsmPolicy) || false
  })
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <FormField
        label={t('wizard.headNode.Ssm.title')}
        description={t('wizard.headNode.Ssm.description')}
      >
        <Toggle
          checked={ssmEnabled}
          onChange={({detail}) => enableSsm(!ssmEnabled)}
          disabled={dcvEnabled}
        >
          <Trans i18nKey="wizard.headNode.Ssm.label" />
        </Toggle>
      </FormField>
      <HelpTooltip>
        <Trans i18nKey="wizard.headNode.Ssm.help" />
      </HelpTooltip>
    </div>
  )
}

function DcvSettings() {
  const {t} = useTranslation()
  const dcvPath = [...headNodePath, 'Dcv', 'Enabled']

  let dcvEnabled = useState(dcvPath) || false
  let port = useState([...headNodePath, 'Dcv', 'Port']) || 8443
  let allowedIps =
    useState([...headNodePath, 'Dcv', 'AllowedIps']) || '0.0.0.0/0'
  const editing = useState(['app', 'wizard', 'editing'])
  const toggleDcv = (event: any) => {
    const value = !dcvEnabled
    if (value) {
      enableSsm(value)
      if (allowedIps === null)
        setState([...headNodePath, 'Dcv', 'AllowedIps'], '0.0.0.0/0')
      if (port === null) setState([...headNodePath, 'Dcv', 'Port'], 8443)
      setState(dcvPath, value)
    } else {
      clearState([...headNodePath, 'Dcv'])
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <FormField
        label={t('wizard.headNode.Dcv.label')}
        description={t('wizard.headNode.Dcv.description')}
      >
        <SpaceBetween direction="vertical" size="xxxs">
          <Toggle disabled={editing} checked={dcvEnabled} onChange={toggleDcv}>
            DCV Enabled
          </Toggle>
          <SpaceBetween direction="vertical" size="xs">
            {dcvEnabled && (
              <FormField label="Allowed IPs">
                <Input
                  value={allowedIps}
                  onChange={({detail}) => {
                    setState(
                      [...headNodePath, 'Dcv', 'AllowedIps'],
                      detail.value,
                    )
                  }}
                />
              </FormField>
            )}
            {dcvEnabled && (
              <FormField label="Port">
                <Input
                  inputMode="decimal"
                  value={port}
                  onChange={({detail}) =>
                    setState(
                      [...headNodePath, 'Dcv', 'Port'],
                      parseInt(detail.value),
                    )
                  }
                />
              </FormField>
            )}
          </SpaceBetween>
        </SpaceBetween>
      </FormField>
      <HelpTooltip>
        <Trans i18nKey="wizard.headNode.Dcv.help" />
      </HelpTooltip>
    </div>
  )
}

function HeadNode() {
  const {t} = useTranslation()
  const imdsSecuredPath = [...headNodePath, 'Imds', 'Secured']
  const imdsSecured = useState(imdsSecuredPath)

  const subnetPath = [...headNodePath, 'Networking', 'SubnetId']
  const instanceTypeErrors = useState([...errorsPath, 'instanceType'])
  const subnetErrors = useState([...errorsPath, 'subnet'])
  const subnetValue = useState(subnetPath) || ''
  const editing = useState(['app', 'wizard', 'editing'])
  let isSlurmAccountingActive = useFeatureFlag('slurm_accounting')

  const toggleImdsSecured = () => {
    const setImdsSecured = !imdsSecured
    if (setImdsSecured) setState(imdsSecuredPath, setImdsSecured)
    else {
      clearState(imdsSecuredPath)
      if (Object.keys(getState([...headNodePath, 'Imds'])).length === 0)
        clearState([...headNodePath, 'Imds'])
    }
  }

  return (
    <ColumnLayout columns={1}>
      <Container header={<Header variant="h2">Head Node Properties</Header>}>
        <SpaceBetween direction="vertical" size="s">
          <Box>
            <FormField
              errorText={instanceTypeErrors}
              label={t('wizard.headNode.instanceType.label')}
            >
              <InstanceSelect
                disabled={editing}
                selectId="head-node"
                path={[...headNodePath, 'InstanceType']}
              />
            </FormField>
          </Box>
          <FormField
            label={t('wizard.headNode.subnetId.label')}
            errorText={subnetErrors}
            description={t('wizard.headNode.subnetId.description')}
          >
            <SubnetSelect
              disabled={editing}
              value={subnetValue}
              onChange={(subnetId: any) => setState(subnetPath, subnetId)}
            />
          </FormField>
          <KeypairSelect />
          <RootVolume basePath={headNodePath} errorsPath={errorsPath} />
          <SsmSettings />
          <DcvSettings />
          <div
            key="imds-secured"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Toggle checked={imdsSecured || false} onChange={toggleImdsSecured}>
              <Trans i18nKey="wizard.headNode.imdsSecured.label" />
            </Toggle>
            <HelpTooltip>
              <Trans i18nKey="wizard.headNode.imdsSecured.help">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html#instance-metadata-v2-how-it-works"
                ></a>
              </Trans>
            </HelpTooltip>
          </div>
          <div
            key="sgs"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormField label={t('wizard.headNode.securityGroups.label')}>
              <SecurityGroups basePath={headNodePath} />
            </FormField>
            <HelpTooltip>
              <Trans i18nKey="wizard.headNode.securityGroups.help" />
            </HelpTooltip>
          </div>
          <ExpandableSection header="Advanced options">
            <ActionsEditor basePath={headNodePath} errorsPath={errorsPath} />
            <ExpandableSection header="IAM Policies">
              <IamPoliciesEditor basePath={headNodePath} />
            </ExpandableSection>
          </ExpandableSection>
        </SpaceBetween>
      </Container>
      <SlurmSettings />
    </ColumnLayout>
  )
}

export {HeadNode, headNodeValidate}
