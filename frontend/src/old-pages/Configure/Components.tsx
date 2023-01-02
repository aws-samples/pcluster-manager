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

// Fameworks
import React, {useCallback, useMemo} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useSelector} from 'react-redux'
import {findFirst} from '../../util'

// State / Model
import {
  setState,
  getState,
  useState,
  updateState,
  clearState,
  clearEmptyNest,
  ssmPolicy,
} from '../../store'

// UI Elements
import {
  Autosuggest,
  Button,
  FormField,
  Input,
  SpaceBetween,
  Toggle,
  TokenGroup,
  Select,
  InputProps,
} from '@cloudscape-design/components'

// Components
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'
import InfoLink from '../../components/InfoLink'
import {subnetName} from './util'

// Helper Functions
function strToOption(str: any) {
  return {value: str, label: str}
}

type Extension = {
  name: string
  path: string
  description: string
  args: {name: string; default?: string}[]
}

type ActionsEditorProps = {
  basePath: string[]
  errorsPath: string[]
}

// Selectors
const selectVpc = (state: any) => getState(state, ['app', 'wizard', 'vpc'])
const selectAwsSubnets = (state: any) => getState(state, ['aws', 'subnets'])

function LabeledIcon({label, icon}: any) {
  return (
    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      {/* eslint-disable-next-line @next/next/no-img-element*/}
      <img style={{width: '30px', height: '30px'}} src={icon} alt={label} />
      <div style={{marginLeft: '20px', minWidth: '150px'}}>{label}</div>
    </div>
  )
}

function SubnetSelect({value, onChange, disabled}: any) {
  const subnets = useSelector(selectAwsSubnets)
  const vpc = useSelector(selectVpc)
  var filteredSubnets =
    subnets &&
    subnets.filter((s: any) => {
      return vpc ? s.VpcId === vpc : true
    })
  if (!subnets) {
    return <div>No Subnets Found.</div>
  }

  const itemToOption = (item: any) => {
    return {
      value: item.SubnetId,
      label: item.SubnetId,
      description:
        item.AvailabilityZone +
        ` - ${item.AvailabilityZoneId}` +
        (subnetName(item) ? ` (${subnetName(item)})` : ''),
    }
  }

  return (
    <Select
      disabled={disabled}
      selectedOption={
        findFirst(filteredSubnets, (x: any) => {
          return x.SubnetId === value
        })
          ? itemToOption(
              findFirst(filteredSubnets, (x: any) => {
                return x.SubnetId === value
              }),
            )
          : {label: 'Please Select A Subnet'}
      }
      onChange={({detail}) => {
        onChange && onChange(detail.selectedOption.value)
      }}
      selectedAriaLabel="Selected"
      options={filteredSubnets.map(itemToOption)}
    />
  )
}

// instance type, description, image
type InstanceGroup = [string, string, string][]

export function useInstanceGroups(): Record<string, InstanceGroup> {
  const instanceTypes = useState(['aws', 'instanceTypes']) || []

  let groups: {[key: string]: [string, string, string][]} = {}

  for (let instance of instanceTypes) {
    let group = 'General Purpose'
    let img = '/img/od.svg'
    if (instance.InstanceType.startsWith('c6g')) {
      group = 'Graviton'
    } else if (instance.InstanceType.startsWith('c')) {
      img = '/img/c5.svg'
      if (instance.InstanceType.startsWith('c5n')) img = '/img/c5n.svg'
      group = 'Compute'
    } else if (instance.InstanceType.startsWith('hpc')) {
      group = 'HPC'
    } else if (instance.InstanceType.startsWith('m')) {
      group = 'Mixed'
    } else if (instance.InstanceType.startsWith('r')) {
      group = 'High Memory'
    } else if (
      instance.InstanceType.startsWith('p') ||
      instance.InstanceType.startsWith('g')
    ) {
      if (instance.InstanceType.startsWith('p3')) img = '/img/p3.svg'
      group = 'GPU'
    }

    if (!(group in groups)) groups[group] = []

    let desc = `${instance.VCpuInfo.DefaultVCpus} vcpus, ${
      instance.MemoryInfo.SizeInMiB / 1024
    }GB memory`

    if (Object.keys(instance.GpuInfo).length > 0)
      desc = `${instance.GpuInfo.Count} x ${instance.GpuInfo.Name}, ${desc}`

    groups[group].push([instance.InstanceType, desc, img])
  }
  return groups
}

function InstanceSelect({path, selectId, callback, disabled}: any) {
  const value = useState(path) || ''
  const instanceGroups = useInstanceGroups()

  // @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
  const instanceToOption = ([value, label, icon]) => {
    return {label: value, iconUrl: icon, description: label, value: value}
  }

  return (
    <Autosuggest
      value={value}
      disabled={disabled}
      onChange={({detail}) => {
        if (detail.value !== value) {
          setState(path, detail.value)
          callback && callback(detail.value)
        }
      }}
      // @ts-expect-error TS(2322) FIXME: Type '(newValue: string) => void' is not assignabl... Remove this comment to see the full error message
      enteredTextLabel={newValue => {
        if (newValue !== value) {
          setState(path, newValue)
          callback && callback(newValue)
        }
      }}
      ariaLabel="Instance Selector"
      placeholder="Instance Type"
      empty="No matches found"
      options={Object.keys(instanceGroups).map(groupName => {
        return {
          label: groupName,
          options: instanceGroups[groupName].map(instanceToOption),
        }
      })}
    />
  )
}

function CustomAMISettings({basePath, appPath, errorsPath, validate}: any) {
  const editing = useState(['app', 'wizard', 'editing'])
  const customImages = useState(['app', 'wizard', 'customImages']) || []
  const officialImages = useState(['app', 'wizard', 'officialImages']) || []
  const error = useState([...errorsPath, 'customAmi'])

  const customAmiPath = useMemo(
    () => [...basePath, 'Image', 'CustomAmi'],
    [basePath],
  )
  const customAmi = useState(customAmiPath)
  const customAmiEnabled =
    useState([...appPath, 'customAMI', 'enabled']) || false

  const osPath = ['app', 'wizard', 'config', 'Image', 'Os']
  const os = useState(osPath) || 'alinux2'

  const {t} = useTranslation()

  var suggestions = []
  for (let image of customImages) {
    suggestions.push({
      value: image.ec2AmiInfo.amiId,
      description: `${image.ec2AmiInfo.amiId} (${image.imageId})`,
    })
  }

  for (let image of officialImages)
    if (image.os === os) {
      suggestions.push({
        value: image.amiId,
        description: `${image.amiId} (${image.name})`,
      })
    }

  const toggleCustomAmi = () => {
    const value = !customAmiEnabled
    setState([...appPath, 'customAMI', 'enabled'], value)
    if (!value) {
      clearState(customAmiPath)
      if (Object.keys(getState([...basePath, 'Image'])).length === 0)
        clearState([...basePath, 'Image'])
    }
  }

  const selectText = useCallback(
    (value: string) => {
      if (value !== customAmi) {
        setState(customAmiPath, value)
      }
      return value
    },
    [customAmi, customAmiPath],
  )

  return (
    <>
      <SpaceBetween direction="horizontal" size={'xxs'}>
        <Toggle
          disabled={editing}
          checked={customAmiEnabled}
          onChange={toggleCustomAmi}
        >
          <Trans i18nKey="wizard.components.customAmi.label" />
        </Toggle>
        <InfoLink
          ariaLabel={t('wizard.components.customAmi.ariaLabel')}
          helpPanel={
            <TitleDescriptionHelpPanel
              title={t('wizard.components.customAmi.helpPanel.title')}
              description={
                <Trans i18nKey="wizard.components.customAmi.helpPanel.description">
                  <a
                    rel="noreferrer"
                    target="_blank"
                    href={t('wizard.components.customAmi.helpPanel.link')}
                  />
                </Trans>
              }
            />
          }
        />
      </SpaceBetween>
      {customAmiEnabled && (
        <FormField
          label={t('wizard.components.customAmi.suggestLabel')}
          errorText={error}
        >
          <Autosuggest
            onChange={({detail}) => {
              if (detail.value !== customAmi) {
                setState(customAmiPath, detail.value)
              }
            }}
            value={customAmi || ''}
            enteredTextLabel={selectText}
            ariaLabel="Custom AMI Selector"
            placeholder="AMI ID"
            empty="No matches found"
            options={suggestions}
          />
        </FormField>
      )}
    </>
  )
}

function ArgEditor({path, i}: any) {
  const {t} = useTranslation()
  const args = useState(path)
  const arg = useState([...path, i])
  const remove = () => {
    if (args.length > 1)
      setState([...path], [...args.slice(0, i), ...args.slice(i + 1)])
    else clearState(path)

    clearEmptyNest(path, 3)
  }

  return (
    <SpaceBetween direction="horizontal" size="s">
      <div style={{marginLeft: '25px', width: '120px'}}>Arg:</div>
      <div style={{width: '440px'}}>
        <Input
          value={arg}
          onChange={({detail}) => {
            setState([...path, i], detail.value)
          }}
        />
      </div>
      <Button onClick={remove}>{t('wizard.actions.remove')}</Button>
    </SpaceBetween>
  )
}

function ActionEditor({label, actionKey, errorPath, path}: any) {
  const script = useState([...path, 'Script']) || ''
  const args = useState([...path, 'Args']) || []

  const addArg = (path: any) => {
    updateState(path, (old: any) => [...(old || []), ''])
  }

  const editScript = (path: any, val: any) => {
    if (val !== '') setState(path, val)
    else clearState(path)
    clearEmptyNest(path, 3)
  }

  return (
    <FormField label={label} errorText={errorPath}>
      <SpaceBetween direction="vertical" size="xs">
        <div
          key={actionKey}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{flexGrow: 1}}>
            <Input
              placeholder="/home/ec2-user/start.sh"
              value={script}
              onChange={({detail}) =>
                editScript([...path, 'Script'], detail.value)
              }
            />
          </div>
          <div style={{flexShrink: 1}}>
            <Button onClick={() => addArg([...path, 'Args'])}>+ Arg</Button>
          </div>
        </div>
        <SpaceBetween direction="vertical" size="xxs">
          {args.map((a: any, i: any) => (
            <ArgEditor key={`osa${i}`} arg={a} i={i} path={[...path, 'Args']} />
          ))}
        </SpaceBetween>
      </SpaceBetween>
    </FormField>
  )
}

function ActionsEditor({basePath, errorsPath}: ActionsEditorProps) {
  const actionsPath = [...basePath, 'CustomActions']
  const onStartPath = [...actionsPath, 'OnNodeStart']
  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured']

  const onStartErrors = useState([...errorsPath, 'onStart'])
  const onConfiguredErrors = useState([...errorsPath, 'onConfigured'])

  return (
    <SpaceBetween direction="vertical" size="xs">
      <ActionEditor
        label="On Start"
        errorPath={onStartErrors}
        path={onStartPath}
      />
      <ActionEditor
        label="On Configured"
        errorPath={onConfiguredErrors}
        path={onConfiguredPath}
      />
    </SpaceBetween>
  )
}

function HeadNodeActionsEditor({basePath, errorsPath}: ActionsEditorProps) {
  const actionsPath = [...basePath, 'CustomActions']
  const onStartPath = [...actionsPath, 'OnNodeStart']
  const onConfiguredPath = [...actionsPath, 'OnNodeConfigured']
  const onUpdatedPath = [...actionsPath, 'OnNodeUpdated']

  const onStartErrors = useState([...errorsPath, 'onStart'])
  const onConfiguredErrors = useState([...errorsPath, 'onConfigured'])
  const onUpdatedErrors = useState([...errorsPath, 'onUpdated'])

  return (
    <SpaceBetween direction="vertical" size="xs">
      <ActionEditor
        label="On Start"
        errorPath={onStartErrors}
        path={onStartPath}
      />
      <ActionEditor
        label="On Configured"
        errorPath={onConfiguredErrors}
        path={onConfiguredPath}
      />
      <ActionEditor
        label="On Updated"
        errorPath={onUpdatedErrors}
        path={onUpdatedPath}
      />
    </SpaceBetween>
  )
}

function SecurityGroups({basePath}: any) {
  const sgPath = [...basePath, 'Networking', 'AdditionalSecurityGroups']
  const selectedSgs = useState(sgPath) || []
  const sgSelected = useState(['app', 'wizard', 'sg-selected'])

  const sgs = useState(['aws', 'security_groups']) || []
  const sgMap = sgs.reduce((acc: any, s: any) => {
    acc[s.GroupId] = s.GroupName
    return acc
  }, {})

  const itemToOption = (item: any) => {
    return {
      value: item.GroupId,
      label: item.GroupId,
      description: item.GroupName,
    }
  }
  const removeSg = (i: any) => {
    setState(sgPath, [...selectedSgs.slice(0, i), ...selectedSgs.slice(i + 1)])
    if (getState(sgPath).length === 0) clearState(sgPath)
  }
  return (
    <SpaceBetween direction="vertical" size="xs">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Select
          selectedOption={
            sgSelected &&
            findFirst(sgs, (x: any) => x.GroupId === sgSelected.value)
              ? itemToOption(
                  findFirst(sgs, (x: any) => x.GroupId === sgSelected.value),
                )
              : {label: 'Please Select A Security Group'}
          }
          onChange={({detail}) => {
            setState(['app', 'wizard', 'sg-selected'], detail.selectedOption)
          }}
          triggerVariant={'option'}
          options={sgs.map(itemToOption)}
        />
        <Button
          disabled={!sgSelected}
          onClick={() => setState(sgPath, [...selectedSgs, sgSelected.value])}
        >
          Add
        </Button>
      </div>
      <TokenGroup
        onDismiss={({detail: {itemIndex}}) => {
          removeSg(itemIndex)
        }}
        items={selectedSgs.map((s: any) => {
          return {label: s, dismissLabel: `Remove ${s}`, description: sgMap[s]}
        })}
      />
    </SpaceBetween>
  )
}

function RootVolume({basePath, errorsPath}: any) {
  const {t} = useTranslation()
  const rootVolumeSizePath = [...basePath, 'LocalStorage', 'RootVolume', 'Size']
  const rootVolumeSize = useState(rootVolumeSizePath)

  const rootVolumeEncryptedPath = [
    ...basePath,
    'LocalStorage',
    'RootVolume',
    'Encrypted',
  ]
  const rootVolumeEncrypted = useState(rootVolumeEncryptedPath)

  const rootVolumeTypePath = useMemo(
    () => [...basePath, 'LocalStorage', 'RootVolume', 'VolumeType'],
    [basePath],
  )
  const rootVolumeType = useState(rootVolumeTypePath)
  const defaultRootVolumeType = 'gp3'
  const volumeTypes = ['gp3', 'gp2', 'io1', 'io2', 'sc1', 'st1', 'standard']

  const rootVolumeErrors = useState([...errorsPath, 'rootVolume'])
  const editing = useState(['app', 'wizard', 'editing'])

  const setRootVolume = (size: any) => {
    if (size === '') clearState(rootVolumeSizePath)
    else setState(rootVolumeSizePath, parseInt(size))
    clearEmptyNest(rootVolumeSizePath, 3)
  }

  const toggleEncrypted = () => {
    const setEncrypted = !rootVolumeEncrypted
    if (setEncrypted) setState(rootVolumeEncryptedPath, setEncrypted)
    else clearState(rootVolumeEncryptedPath)
    clearEmptyNest(rootVolumeSizePath, 3)
  }

  React.useEffect(() => {
    if (rootVolumeType === null)
      setState(rootVolumeTypePath, defaultRootVolumeType)
  }, [rootVolumeType, rootVolumeTypePath])

  return (
    <>
      <FormField
        label={t('wizard.components.rootVolume.size.label')}
        errorText={rootVolumeErrors}
        description={t('wizard.components.rootVolume.size.description')}
      >
        <Input
          disabled={editing}
          placeholder={t('wizard.components.rootVolume.size.placeholder')}
          value={rootVolumeSize || ''}
          inputMode="decimal"
          onChange={({detail}) => setRootVolume(detail.value)}
        />
      </FormField>
      <Toggle
        disabled={editing}
        checked={rootVolumeEncrypted || false}
        onChange={toggleEncrypted}
      >
        Encrypted Root Volume
      </Toggle>
      <div
        key="volume-type"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Trans i18nKey="wizard.components.rootVolume.type.label" />:
        <Select
          disabled={editing}
          placeholder={t('wizard.components.rootVolume.type.placeholder', {
            defaultRootVolumeType: defaultRootVolumeType,
          })}
          selectedOption={rootVolumeType && strToOption(rootVolumeType)}
          onChange={({detail}) => {
            setState(rootVolumeTypePath, detail.selectedOption.value)
          }}
          options={volumeTypes.map(strToOption)}
        />
      </div>
    </>
  )
}

function IamPoliciesEditor({basePath}: any) {
  const policiesPath = [...basePath, 'Iam', 'AdditionalIamPolicies']
  const policies = useState(policiesPath) || []
  const policyPath = ['app', 'wizard', 'headNode', 'iamPolicy']
  const policy = useState(policyPath) || ''

  const addPolicy = () => {
    updateState(policiesPath, (existing: any) => [
      ...(existing || []),
      {Policy: policy},
    ])
    setState(policyPath, '')
  }

  const removePolicy = (index: any) => {
    setState(policiesPath, [
      ...policies.slice(0, index),
      ...policies.slice(index + 1),
    ])
    if (policies.length === 0) clearState(policiesPath)
  }

  return (
    <SpaceBetween direction="vertical" size="s">
      <FormField
        errorText={
          findFirst(policies, (x: any) => x.Policy === policy)
            ? 'Policy already added.'
            : ''
        }
      >
        <SpaceBetween direction="horizontal" size="s">
          <div style={{width: '400px'}}>
            <Input
              placeholder="arn:aws:iam::aws:policy/SecretsManager:ReadWrite"
              value={policy}
              onChange={({detail}) => setState(policyPath, detail.value)}
            />
          </div>
          <Button
            onClick={addPolicy}
            disabled={
              policy.length === 0 ||
              findFirst(policies, (x: any) => x.Policy === policy)
            }
          >
            Add
          </Button>
        </SpaceBetween>
      </FormField>
      {policies.map(
        (p: any, i: any) =>
          p.Policy !== ssmPolicy && (
            <SpaceBetween key={p.Policy} direction="horizontal" size="s">
              <div style={{width: '400px'}}>{p.Policy}</div>
              <Button onClick={() => removePolicy(i)}>Remove</Button>
            </SpaceBetween>
          ),
      )}
    </SpaceBetween>
  )
}

type HelpTextInputProps = {
  name: string
  path: string[]
  errorsPath: string[]
  configKey: string
  description: string
  help: string
  placeholder: string
  type?: InputProps.Type
  onChange: NonCancelableEventHandler<InputProps.ChangeDetail>
}

function HelpTextInput({
  name,
  path,
  errorsPath,
  configKey,
  description,
  help,
  placeholder,
  type = 'text',
  onChange,
}: HelpTextInputProps) {
  let value = useState([...path, configKey])
  let error = useState([...errorsPath, configKey])

  return (
    <FormField
      label={name}
      errorText={error}
      description={description}
      info={
        <InfoLink
          ariaLabel={name}
          helpPanel={
            <TitleDescriptionHelpPanel title={name} description={help} />
          }
        />
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{flexGrow: 1}}>
          <Input
            placeholder={placeholder}
            value={value}
            type={type}
            onChange={onChange}
          />
        </div>
      </div>
    </FormField>
  )
}

export {
  SubnetSelect,
  SecurityGroups,
  InstanceSelect,
  LabeledIcon,
  ActionsEditor,
  HeadNodeActionsEditor,
  CustomAMISettings,
  RootVolume,
  IamPoliciesEditor,
  HelpTextInput,
}
