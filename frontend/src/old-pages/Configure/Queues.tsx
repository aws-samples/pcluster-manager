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
import i18next from 'i18next'
import {findFirst} from '../../util'

// UI Elements
import {
  Button,
  Box,
  Container,
  ColumnLayout,
  ExpandableSection,
  FormField,
  Header,
  Input,
  Select,
  SpaceBetween,
  Toggle,
} from '@awsui/components-react'

// State
import {setState, getState, useState, clearState} from '../../store'

// Components
import {
  ActionsEditor,
  CustomAMISettings,
  InstanceSelect,
  LabeledIcon,
  RootVolume,
  SubnetSelect,
  SecurityGroups,
  IamPoliciesEditor,
  HelpTextInput,
} from './Components'
import HelpTooltip from '../../components/HelpTooltip'
import {Trans, useTranslation} from 'react-i18next'
import {SlurmMemorySettings} from './SlurmMemorySettings'
import {useFeatureFlag} from '../../feature-flags/useFeatureFlag'

// Constants
const queuesPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues']
const queuesErrorsPath = ['app', 'wizard', 'errors', 'queues']
const defaultInstanceType = 'c5n.large'

// Helper Functions
// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
function itemToIconOption([value, label, icon]) {
  return {value: value, label: label, ...(icon ? {iconUrl: icon} : {})}
}

// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
function itemToDisplayIconOption([value, label, icon]) {
  return {
    value: value,
    label: icon ? <LabeledIcon label={label} icon={icon} /> : label,
  }
}

function queueValidate(queueIndex: any) {
  let valid = true
  const queueSubnet = getState([
    ...queuesPath,
    queueIndex,
    'Networking',
    'SubnetIds',
    0,
  ])
  const computeResources = getState([
    ...queuesPath,
    queueIndex,
    'ComputeResources',
  ])

  const errorsPath = [...queuesErrorsPath, queueIndex]

  const actionsPath = [...queuesPath, queueIndex, 'CustomActions']

  const onStartPath = [...actionsPath, 'OnNodeStart']
  const onStart = getState(onStartPath)

  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured']
  const onConfigured = getState(onConfiguredPath)

  const customAmiEnabled = getState([
    'app',
    'wizard',
    'queues',
    queueIndex,
    'customAMI',
    'enabled',
  ])
  const customAmi = getState([...queuesPath, queueIndex, 'Image', 'CustomAmi'])

  const rootVolumeSizePath = [
    ...queuesPath,
    queueIndex,
    'ComputeSettings',
    'LocalStorage',
    'RootVolume',
    'Size',
  ]
  const rootVolumeValue = getState(rootVolumeSizePath)

  if (rootVolumeValue === '') {
    setState(
      [...errorsPath, 'rootVolume'],
      i18next.t('wizard.queues.validation.setRootVolumeSize'),
    )
    valid = false
  } else if (
    rootVolumeValue &&
    (!Number.isInteger(rootVolumeValue) || rootVolumeValue < 35)
  ) {
    setState(
      [...errorsPath, 'rootVolume'],
      i18next.t('wizard.queues.validation.rootVolumeMinimum'),
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
      i18next.t('wizard.queues.validation.rootVolumeMinimum'),
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
      i18next.t('wizard.queues.validation.scriptWithArgs'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'onConfigured'])
  }

  if (customAmiEnabled && !customAmi) {
    setState(
      [...errorsPath, 'customAmi'],
      i18next.t('wizard.queues.validation.customAmiSelect'),
    )
    valid = false
  } else {
    clearState([...errorsPath, 'customAmi'])
  }

  if (!queueSubnet) {
    setState(
      [...errorsPath, 'subnet'],
      i18next.t('wizard.queues.validation.selectSubnet'),
    )
    valid = false
  } else {
    setState([...errorsPath, 'subnet'], null)
  }

  let seenInstances = new Set()
  for (let i = 0; i < computeResources.length; i++) {
    let computeResource = computeResources[i]
    if (seenInstances.has(computeResource.InstanceType)) {
      setState(
        [...errorsPath, 'computeResource', i, 'type'],
        i18next.t('wizard.queues.validation.instanceTypeUnique'),
      )
      valid = false
    } else {
      seenInstances.add(computeResource.InstanceType)
      setState([...errorsPath, 'computeResource', i, 'type'], null)
    }
  }

  return valid
}

function queuesValidate() {
  let valid = true
  const config = getState(['app', 'wizard', 'config'])
  console.log(config)

  setState([...queuesErrorsPath, 'validated'], true)

  const queues = getState([...queuesPath])
  for (let i = 0; i < queues.length; i++) {
    let queueValid = queueValidate(i)
    valid &&= queueValid
  }

  return valid
}

function ComputeResource({index, queueIndex, computeResource}: any) {
  const parentPath = [...queuesPath, queueIndex]
  const queue = useState(parentPath)
  const computeResources = useState([...parentPath, 'ComputeResources'])
  const path = [...parentPath, 'ComputeResources', index]
  const errorsPath = [...queuesErrorsPath, queueIndex, 'computeResource', index]
  const typeError = useState([...errorsPath, 'type'])

  const tInstances = new Set<string>(['t2.micro', 't2.medium'])
  const gravitonInstances = new Set<string>([])

  const instanceTypePath = [...path, 'InstanceType']
  const instanceType: string = useState(instanceTypePath)
  const memoryBasedSchedulingEnabledPath = [
    'app',
    'wizard',
    'config',
    'Scheduling',
    'SlurmSettings',
    'EnableMemoryBasedScheduling',
  ]
  const enableMemoryBasedScheduling = useState(memoryBasedSchedulingEnabledPath)

  const disableHTPath = [...path, 'DisableSimultaneousMultithreading']
  const disableHT = useState(disableHTPath)

  const efaPath = [...path, 'Efa']

  const efaInstances = new Set(useState(['aws', 'efa_instance_types']))
  const enableEFAPath = [...path, 'Efa', 'Enabled']
  const enableEFA = useState(enableEFAPath) || false

  const enablePlacementGroupPath = [
    ...parentPath,
    'Networking',
    'PlacementGroup',
    'Enabled',
  ]

  const enableGPUDirectPath = [...path, 'Efa', 'GdrSupport'] || false
  const enableGPUDirect = useState(enableGPUDirectPath)

  const instanceSupportsGdr = instanceType === 'p4d.24xlarge'

  const minCount = useState([...path, 'MinCount'])
  const maxCount = useState([...path, 'MaxCount'])

  const {t} = useTranslation()

  const remove = () => {
    setState(
      [...parentPath, 'ComputeResources'],
      [
        ...computeResources.slice(0, index),
        ...computeResources.slice(index + 1),
      ],
    )
  }

  const setMinCount = (staticCount: any) => {
    const dynamicCount = maxCount - minCount
    if (staticCount > 0)
      setState([...path, 'MinCount'], !isNaN(staticCount) ? staticCount : 0)
    else clearState([...path, 'MinCount'])
    setState(
      [...path, 'MaxCount'],
      (!isNaN(staticCount) ? staticCount : 0) +
        (!isNaN(dynamicCount) ? dynamicCount : 0),
    )
  }

  const setMaxCount = (dynamicCount: any) => {
    const staticCount = minCount
    setState(
      [...path, 'MaxCount'],
      (!isNaN(staticCount) ? staticCount : 0) +
        (!isNaN(dynamicCount) ? dynamicCount : 0),
    )
  }

  const setSchedulableMemory = (
    schedulableMemoryPath: string[],
    schedulableMemory: string,
  ) => {
    let schedulableMemoryNumber = parseInt(schedulableMemory)
    if (enableMemoryBasedScheduling && !isNaN(schedulableMemoryNumber)) {
      setState(schedulableMemoryPath, schedulableMemoryNumber)
    } else {
      clearState(schedulableMemoryPath)
    }
  }

  const setDisableHT = (disable: any) => {
    if (disable) setState(disableHTPath, disable)
    else clearState(disableHTPath)
  }

  const setEnableEFA = (enable: any) => {
    if (enable) {
      setState(enableEFAPath, enable)
      setState(enablePlacementGroupPath, enable)
    } else {
      clearState(efaPath)
      clearState(enablePlacementGroupPath)
    }
  }

  const setEnableGPUDirect = (enable: any) => {
    if (enable) setState(enableGPUDirectPath, enable)
    else clearState(enableGPUDirectPath)
  }

  const setInstanceType = (instanceType: any) => {
    // setting the instance type on the queue happens in the component
    // this updates the name which is derived from the instance type
    setState(
      [...path, 'Name'],
      `${queue.Name}-${instanceType.replace('.', '')}`,
    )

    if (!getState(enableEFAPath) && efaInstances.has(instanceType))
      setEnableEFA(true)
    else if (getState(enableEFAPath) && !efaInstances.has(instanceType))
      setEnableEFA(false)
  }

  React.useEffect(() => {
    if (!instanceType)
      setState(
        [...queuesPath, queueIndex, 'ComputeResources', index, 'InstanceType'],
        defaultInstanceType,
      )
  }, [queueIndex, index, instanceType])

  return (
    <div className="compute-resource">
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <Box margin={{top: 'xs'}} textAlign="right">
          {index > 0 && <Button onClick={remove}>Remove Resource</Button>}
        </Box>
        <ColumnLayout columns={2}>
          <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
            <FormField label={t('wizard.queues.computeResource.staticNodes')}>
              <Input
                value={computeResource.MinCount || 0}
                type="number"
                onChange={({detail}) => setMinCount(parseInt(detail.value))}
              />
            </FormField>
            <FormField label={t('wizard.queues.computeResource.dynamicNodes')}>
              <Input
                value={Math.max(
                  (computeResource.MaxCount || 0) -
                    (computeResource.MinCount || 0),
                  0,
                ).toString()}
                type="number"
                onChange={({detail}) => setMaxCount(parseInt(detail.value))}
              />
            </FormField>
          </div>
          <FormField
            label={t('wizard.queues.computeResource.instanceType')}
            errorText={typeError}
          >
            <InstanceSelect
              path={instanceTypePath}
              callback={setInstanceType}
            />
          </FormField>
          {enableMemoryBasedScheduling && (
            <HelpTextInput
              name={t('wizard.queues.schedulableMemory.name')}
              path={path}
              errorsPath={errorsPath}
              configKey={'SchedulableMemory'}
              onChange={({detail}) =>
                setSchedulableMemory(
                  [...path, 'SchedulableMemory'],
                  detail.value,
                )
              }
              description={t('wizard.queues.schedulableMemory.description')}
              placeholder={t('wizard.queues.schedulableMemory.placeholder')}
              help={t('wizard.queues.schedulableMemory.help')}
              type="number"
            />
          )}
        </ColumnLayout>
        <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
          <Toggle
            disabled={
              tInstances.has(instanceType) ||
              gravitonInstances.has(instanceType)
            }
            checked={disableHT}
            onChange={_e => {
              setDisableHT(!disableHT)
            }}
          >
            <Trans i18nKey="wizard.queues.computeResource.disableHT" />
          </Toggle>
          <Toggle
            disabled={!efaInstances.has(instanceType)}
            checked={enableEFA}
            onChange={_e => {
              setEnableEFA(!enableEFA)
            }}
          >
            <Trans i18nKey="wizard.queues.computeResource.enableEfa" />
          </Toggle>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Toggle
              disabled={!instanceSupportsGdr}
              checked={enableGPUDirect}
              onChange={_e => {
                setEnableGPUDirect(!enableGPUDirect)
              }}
            >
              <Trans i18nKey="wizard.queues.computeResource.enableGpuDirect" />
            </Toggle>
            <HelpTooltip>
              <Trans i18nKey="wizard.queues.Gdr.help">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://docs.aws.amazon.com/parallelcluster/latest/ug/Scheduling-v3.html#yaml-Scheduling-SlurmQueues-ComputeResources-Efa-GdrSupport"
                ></a>
              </Trans>
            </HelpTooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComputeResources({queue, index}: any) {
  return (
    <Container>
      {queue.ComputeResources.map((computeResource: any, i: any) => (
        <ComputeResource
          queue={queue}
          computeResource={computeResource}
          index={i}
          queueIndex={index}
          key={i}
        />
      ))}
    </Container>
  )
}

function Queue({index}: any) {
  const {t} = useTranslation()
  const queues = useState(queuesPath)
  const [editingName, setEditingName] = React.useState(false)
  const queue = useState([...queuesPath, index])
  const enablePlacementGroupPath = [
    ...queuesPath,
    index,
    'Networking',
    'PlacementGroup',
    'Enabled',
  ]
  const enablePlacementGroup = useState(enablePlacementGroupPath)

  const errorsPath = [...queuesErrorsPath, index]
  const subnetError = useState([...errorsPath, 'subnet'])

  const capacityTypes: [string, string, string][] = [
    ['ONDEMAND', 'On-Demand', '/img/od.svg'],
    ['SPOT', 'Spot', '/img/spot.svg'],
  ]
  const capacityTypePath = [...queuesPath, index, 'CapacityType']
  const capacityType: string = useState(capacityTypePath) || 'ONDEMAND'

  const subnetPath = [...queuesPath, index, 'Networking', 'SubnetIds']
  const subnetValue = useState([...subnetPath, 0]) || ''

  const remove = () => {
    setState(
      [...queuesPath],
      [...queues.slice(0, index), ...queues.slice(index + 1)],
    )
  }
  const addComputeResource = () => {
    setState([...queuesPath, index], {
      ...queue,
      ComputeResources: [
        ...(queue.ComputeResources || []),
        {
          Name: `queue${index}-${defaultInstanceType.replace('.', '')}`,
          InstanceType: defaultInstanceType,
          MinCount: 0,
          MaxCount: 4,
        },
      ],
    })
  }

  const setEnablePG = (enable: any) => {
    setState(enablePlacementGroupPath, enable)
  }

  const renameQueue = (newName: any) => {
    const computeResources = getState([
      ...queuesPath,
      index,
      'ComputeResources',
    ])
    for (let i = 0; i < computeResources.length; i++) {
      const cr = computeResources[i]
      const crName = `${newName}-${cr.InstanceType.replace('.', '')}`
      setState([...queuesPath, index, 'ComputeResources', i, 'Name'], crName)
    }
    setState([...queuesPath, index, 'Name'], newName)
  }

  return (
    <div className="queue">
      <div className="queue-properties">
        <Box margin={{bottom: 'xs'}}>
          <Header
            // @ts-expect-error TS(2322) FIXME: Type '"h4"' is not assignable to type 'Variant | u... Remove this comment to see the full error message
            variant="h4"
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  disabled={queue.ComputeResources.length >= 3}
                  onClick={addComputeResource}
                >
                  Add Resource
                </Button>
                {index > 0 && <Button onClick={remove}>Remove Queue</Button>}
              </SpaceBetween>
            }
          >
            <SpaceBetween direction="horizontal" size="xs">
              {editingName ? (
                <Input
                  value={queue.Name}
                  onKeyDown={e => {
                    if (e.detail.key === 'Enter' || e.detail.key === 'Escape') {
                      setEditingName(false)
                      e.stopPropagation()
                    }
                  }}
                  onChange={({detail}) => renameQueue(detail.value)}
                />
              ) : (
                <span>
                  Queue: {queue.Name}{' '}
                  <Button
                    variant="icon"
                    onClick={_e => setEditingName(true)}
                    iconName={'edit'}
                  ></Button>
                </span>
              )}
            </SpaceBetween>
          </Header>
        </Box>
        <ColumnLayout columns={2}>
          <FormField
            label={t('wizard.queues.subnet.label')}
            errorText={subnetError}
          >
            <SubnetSelect
              value={subnetValue}
              onChange={(subnetId: any) => {
                setState(subnetPath, [subnetId])
                queueValidate(index)
              }}
            />
          </FormField>
          <FormField label={t('wizard.queues.purchaseType.label')}>
            <Select
              selectedOption={itemToDisplayIconOption(
                findFirst(capacityTypes, x => x[0] === capacityType) || [
                  '',
                  '',
                  null,
                ],
              )}
              onChange={({detail}) => {
                setState(capacityTypePath, detail.selectedOption.value)
              }}
              options={capacityTypes.map(itemToIconOption)}
            />
          </FormField>
          <Toggle
            checked={enablePlacementGroup}
            onChange={_e => {
              setEnablePG(!enablePlacementGroup)
            }}
          >
            <Trans i18nKey="wizard.queues.placementGroup.label" />
          </Toggle>
          <div className="spacer"></div>
        </ColumnLayout>
        <ComputeResources queue={queue} index={index} />
        <ExpandableSection header="Advanced options">
          <SpaceBetween direction="vertical" size="s">
            <FormField label={t('wizard.queues.securityGroups.label')}>
              <SecurityGroups basePath={[...queuesPath, index]} />
            </FormField>
            <ActionsEditor
              basePath={[...queuesPath, index]}
              errorsPath={errorsPath}
            />
            <CustomAMISettings
              basePath={[...queuesPath, index]}
              appPath={['app', 'wizard', 'queues', index]}
              errorsPath={errorsPath}
              validate={queuesValidate}
            />
            <RootVolume
              basePath={[...queuesPath, index, 'ComputeSettings']}
              errorsPath={errorsPath}
            />
            <ExpandableSection header={t('wizard.queues.IamPolicies.label')}>
              <IamPoliciesEditor basePath={[...queuesPath, index]} />
            </ExpandableSection>
          </SpaceBetween>
        </ExpandableSection>
      </div>
    </div>
  )
}

function QueuesView() {
  const queues = useState(queuesPath) || []
  return (
    <SpaceBetween direction="vertical" size="l">
      {queues.map((queue: any, i: any) => (
        <Queue queue={queue} index={i} key={i} />
      ))}
    </SpaceBetween>
  )
}

function Queues() {
  const {t} = useTranslation()
  const isMemoryBasedSchedulingActive = useFeatureFlag(
    'memory_based_scheduling',
  )
  let queues = useState(queuesPath) || []

  const addQueue = () => {
    setState(
      [...queuesPath],
      [
        ...(queues || []),
        {
          Name: `queue${queues.length}`,
          ComputeResources: [
            {
              Name: `queue${queues.length}-${defaultInstanceType.replace(
                '.',
                '',
              )}`,
              MinCount: 0,
              MaxCount: 4,
              InstanceType: defaultInstanceType,
            },
          ],
        },
      ],
    )
  }

  return (
    <ColumnLayout>
      {isMemoryBasedSchedulingActive && <SlurmMemorySettings />}
      <Container
        header={
          <Header variant="h2">{t('wizard.queues.container.title')}</Header>
        }
      >
        <div>
          <QueuesView />
        </div>
        <div className="wizard-compute-add">
          <Button
            disabled={queues.length >= 5}
            onClick={addQueue}
            iconName={'add-plus'}
          >
            {t('wizard.queues.addQueueButton.label')}
          </Button>
        </div>
      </Container>
    </ColumnLayout>
  )
}

export {Queues, queuesValidate}
