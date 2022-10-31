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
import * as React from 'react'
import i18next from 'i18next'
import {Trans, useTranslation} from 'react-i18next'
import {findFirst, clamp} from '../../util'

// UI Elements
import {
  Button,
  ColumnLayout,
  Container,
  FormField,
  Header,
  Input,
  InputProps,
  Select,
  SpaceBetween,
  Toggle,
} from '@awsui/components-react'

// State
import {getState, setState, useState, clearState} from '../../store'

// Components
import HelpTooltip from '../../components/HelpTooltip'
import {LabeledIcon} from './Components'
import {
  Storages,
  StorageType,
  STORAGE_TYPE_PROPS,
  UIStorageSettings,
} from './Storage.types'
import {useFeatureFlag} from '../../feature-flags/useFeatureFlag'

// Constants
const storagePath = ['app', 'wizard', 'config', 'SharedStorage']
const errorsPath = ['app', 'wizard', 'errors', 'sharedStorage']

// Types
type StorageTypeOption = [string, string, string]

// Helper Functions
function itemToIconOption([value, label, icon]: StorageTypeOption) {
  return {value: value, label: label, iconUrl: icon}
}

function itemToDisplayIconOption([value, label, icon]: StorageTypeOption) {
  return {
    value: value,
    label: icon ? <LabeledIcon label={label} icon={icon} /> : label,
  }
}

function strToOption(str: any) {
  return {value: str, label: str.toString()}
}

function storageValidate() {
  const storageSettings = getState(storagePath)
  let valid = true

  if (storageSettings)
    for (let i = 0; i < storageSettings.length; i++) {
      const settingsType = getState([...storagePath, i, 'StorageType'])
      if (settingsType === 'Ebs') {
        const volumeId = getState([
          ...storagePath,
          i,
          'EbsSettings',
          'VolumeId',
        ])
        const volumeSize = getState([...storagePath, i, 'EbsSettings', 'Size'])
        if (
          !volumeId &&
          (volumeSize === null ||
            volumeSize === '' ||
            volumeSize < 35 ||
            volumeSize > 2048)
        ) {
          setState(
            [...errorsPath, i, 'EbsSettings', 'Size'],
            i18next.t('wizard.storage.validation.volumeSize'),
          )
          valid = false
        } else {
          clearState([...errorsPath, i, 'EbsSettings', 'Size'])
        }
      }
    }

  setState([...errorsPath, 'validated'], true)

  const config = getState(['app', 'wizard', 'config'])
  console.log(config)
  return valid
}

const LUSTRE_PERSISTENT1_DEFAULT_THROUGHPUT = 200
const LUSTRE_PERSISTENT2_DEFAULT_THROUGHPUT = 125
const storageThroughputsP1 = [50, 100, LUSTRE_PERSISTENT1_DEFAULT_THROUGHPUT]
const storageThroughputsP2 = [
  LUSTRE_PERSISTENT2_DEFAULT_THROUGHPUT,
  250,
  500,
  1000,
]

export function FsxLustreSettings({index}: any) {
  const {t} = useTranslation()
  const isLustrePersistent2Active = useFeatureFlag('lustre_persistent2')
  const useExisting =
    useState(['app', 'wizard', 'storage', 'ui', index, 'useExisting']) || false

  const fsxPath = [...storagePath, index, 'FsxLustreSettings']
  const storageCapacityPath = [...fsxPath, 'StorageCapacity']
  const lustreTypePath = [...fsxPath, 'DeploymentType']
  // support FSx Lustre PERSISTENT_2 only in >= 3.2.0
  const lustreTypes = [
    isLustrePersistent2Active ? 'PERSISTENT_2' : null,
    'PERSISTENT_1',
    'SCRATCH_1',
    'SCRATCH_2',
  ].filter(Boolean)
  const storageThroughputPath = [...fsxPath, 'PerUnitStorageThroughput']
  const importPathPath = [...fsxPath, 'ImportPath']
  const exportPathPath = [...fsxPath, 'ExportPath']
  const compressionPath = [...fsxPath, 'DataCompressionType']

  const storageCapacity = useState(storageCapacityPath)
  const lustreType = useState(lustreTypePath)
  const storageThroughput = useState(storageThroughputPath)
  const importPath = useState(importPathPath) || ''
  const exportPath = useState(exportPathPath) || ''
  const compression = useState(compressionPath)

  const editing = useState(['app', 'wizard', 'editing'])

  React.useEffect(() => {
    const fsxPath = [...storagePath, index, 'FsxLustreSettings']
    const storageCapacityPath = [...fsxPath, 'StorageCapacity']
    const lustreTypePath = [...fsxPath, 'DeploymentType']
    if (storageCapacity === null && !useExisting)
      setState(storageCapacityPath, 1200)
    if (!storageThroughput && !useExisting) {
      setState(
        storageThroughputPath,
        lustreType === 'PERSISTENT_1'
          ? LUSTRE_PERSISTENT1_DEFAULT_THROUGHPUT
          : LUSTRE_PERSISTENT2_DEFAULT_THROUGHPUT,
      )
    }
    if (lustreType === null && !useExisting)
      setState(
        lustreTypePath,
        isLustrePersistent2Active ? 'PERSISTENT_2' : 'PERSISTENT_1',
      )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    storageCapacity,
    lustreType,
    storageThroughput,
    index,
    useExisting,
    isLustrePersistent2Active,
  ])

  const toggleCompression = () => {
    if (compression) clearState(compressionPath)
    else setState(compressionPath, 'LZ4')
  }

  const setImportPath = (path: any) => {
    if (path !== '') setState(importPathPath, path)
    else clearState(importPathPath)
  }

  const setExportPath = (path: any) => {
    if (path !== '') setState(exportPathPath, path)
    else clearState(exportPathPath)
  }

  const capacityMin = 1200
  const capacityMax = 100800
  const capacityStep = 1200

  const clampCapacity = (inCapacityStr: string) => {
    return clamp(
      parseInt(inCapacityStr),
      capacityMin,
      capacityMax,
      capacityStep,
    ).toString()
  }

  return (
    <ColumnLayout columns={2} borders="vertical">
      <div key="capacity" style={{display: 'flex', flexDirection: 'column'}}>
        <Trans
          i18nKey="wizard.storage.Fsx.capacity.label"
          values={{storageCapacity: storageCapacity}}
        />
        <Input
          value={storageCapacity}
          step={1200}
          onChange={({detail}) => {
            setState(storageCapacityPath, detail.value)
          }}
          onBlur={_e => {
            setState(storageCapacityPath, clampCapacity(storageCapacity))
          }}
          type="number"
          disabled={editing}
        />
      </div>
      <div
        key="lustre-type"
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Trans
            i18nKey="wizard.storage.Fsx.lustreType.label"
            values={{storageCapacity: storageCapacity}}
          />
          <Select
            disabled={editing}
            selectedOption={strToOption(lustreType || 'PERSISTENT_1')}
            onChange={({detail}) => {
              setState(lustreTypePath, detail.selectedOption.value)
              setState(
                storageThroughputPath,
                detail.selectedOption.value === 'PERSISTENT_1'
                  ? LUSTRE_PERSISTENT1_DEFAULT_THROUGHPUT
                  : LUSTRE_PERSISTENT2_DEFAULT_THROUGHPUT,
              )
            }}
            options={lustreTypes.map(strToOption)}
          />
        </div>
        <HelpTooltip>
          <Trans i18nKey="wizard.storage.Fsx.lustreType.help">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-DeploymentType"
            ></a>
          </Trans>
        </HelpTooltip>
      </div>

      {lustreType === 'PERSISTENT_1' && (
        <>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormField label={t('wizard.storage.Fsx.import.label')}>
              <Input
                disabled={editing}
                placeholder={t('wizard.storage.Fsx.import.placeholder')}
                value={importPath}
                onChange={({detail}) => setImportPath(detail.value)}
              />
            </FormField>
            <HelpTooltip>
              <Trans i18nKey="wizard.storage.Fsx.import.help">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-ImportPath"
                ></a>
              </Trans>
            </HelpTooltip>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <FormField label={t('wizard.storage.Fsx.export.label')}>
              <Input
                disabled={editing}
                placeholder={t('wizard.storage.Fsx.export.placeholder')}
                value={exportPath}
                onChange={({detail}) => {
                  setExportPath(detail.value)
                }}
              />
            </FormField>
            <HelpTooltip>
              <Trans i18nKey="wizard.storage.Fsx.export.help">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-ExportPath"
                ></a>
              </Trans>
            </HelpTooltip>
          </div>
        </>
      )}

      {['PERSISTENT_1', 'PERSISTENT_2'].includes(lustreType) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <FormField label={t('wizard.storage.Fsx.throughput.label')}>
            <Select
              selectedOption={strToOption(storageThroughput || '')}
              onChange={({detail}) => {
                setState(storageThroughputPath, detail.selectedOption.value)
              }}
              options={
                lustreType == 'PERSISTENT_1'
                  ? storageThroughputsP1.map(strToOption)
                  : storageThroughputsP2.map(strToOption)
              }
            />
          </FormField>
          <HelpTooltip>
            <Trans i18nKey="wizard.storage.Fsx.throughput.help">
              <a
                rel="noreferrer"
                target="_blank"
                href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-PerUnitStorageThroughput"
              ></a>
            </Trans>
          </HelpTooltip>
        </div>
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: '10px',
          justifyContent: 'space-between',
        }}
      >
        <Toggle checked={compression !== null} onChange={toggleCompression}>
          <Trans i18nKey="wizard.storage.Fsx.compression.label" />
        </Toggle>
        <HelpTooltip>
          <Trans i18nKey="wizard.storage.Fsx.compression.help">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-DataCompressionType"
            ></a>
          </Trans>
        </HelpTooltip>
      </div>
    </ColumnLayout>
  )
}

function EfsSettings({index}: any) {
  const efsPath = [...storagePath, index, 'EfsSettings']
  const encryptedPath = [...efsPath, 'Encrypted']
  const kmsPath = [...efsPath, 'KmsKeyId']
  const performancePath = [...efsPath, 'PerformanceMode']
  const performanceModes = ['generalPurpose', 'maxIO']

  const throughputModePath = [...efsPath, 'ThroughputMode']
  const provisionedThroughputPath = [...efsPath, 'ProvisionedThroughput']

  let encrypted = useState(encryptedPath)
  let kmsId = useState(kmsPath)
  let performanceMode = useState(performancePath) || 'generalPurpose'
  let throughputMode = useState(throughputModePath)
  let provisionedThroughput = useState(provisionedThroughputPath)

  React.useEffect(() => {
    const efsPath = [...storagePath, index, 'EfsSettings']
    const throughputModePath = [...efsPath, 'ThroughputMode']
    const provisionedThroughputPath = [...efsPath, 'ProvisionedThroughput']
    if (throughputMode === null) setState(throughputModePath, 'bursting')
    else if (throughputMode === 'bursting')
      clearState([provisionedThroughputPath])
  }, [index, throughputMode])

  const toggleEncrypted = () => {
    const setEncrypted = !encrypted
    setState(encryptedPath, setEncrypted)
    if (!setEncrypted) clearState(kmsPath)
  }

  return (
    <SpaceBetween direction="vertical" size="s">
      <ColumnLayout columns={2} borders="vertical">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
              <Toggle checked={encrypted} onChange={toggleEncrypted}>
                <Trans i18nKey="wizard.storage.Efs.encrypted.label" />
              </Toggle>
            </div>
            {encrypted && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
                  KMS ID:
                </div>
                <div style={{display: 'flex', flexShrink: 1}}>
                  <Input
                    value={kmsId}
                    onChange={({detail}) => {
                      setState(kmsPath, detail.value)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <HelpTooltip>
            <Trans i18nKey="wizard.storage.Efs.encrypted.help">
              <a
                rel="noreferrer"
                target="_blank"
                href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-Encrypted"
              ></a>
            </Trans>
          </HelpTooltip>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Trans i18nKey="wizard.storage.Efs.performanceMode.label" />
          <Select
            selectedOption={strToOption(performanceMode)}
            onChange={({detail}) => {
              setState(performancePath, detail.selectedOption.value)
            }}
            options={performanceModes.map(strToOption)}
          />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Toggle
              checked={throughputMode !== 'bursting'}
              onChange={_event => {
                setState(
                  throughputModePath,
                  throughputMode === 'bursting' ? 'provisioned' : 'bursting',
                )
                if (throughputMode === 'provisioned')
                  setState(provisionedThroughputPath, 128)
              }}
            >
              <Trans i18nKey="wizard.storage.Efs.provisioned.label" />
            </Toggle>
            <HelpTooltip>
              <Trans i18nKey="wizard.storage.Efs.provisioned.help">
                <a
                  rel="noreferrer"
                  target="_blank"
                  href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-ThroughputMode"
                ></a>
              </Trans>
            </HelpTooltip>
          </div>
          {throughputMode === 'provisioned' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
                Throughput (1-1024 in MiB/s):
              </div>
              <div style={{display: 'flex', flexShrink: 1}}>
                <Input
                  type="number"
                  value={clamp(
                    parseInt(provisionedThroughput),
                    1,
                    1024,
                  ).toString()}
                  onChange={({detail}) => {
                    console.log('value: ', detail.value, parseInt(detail.value))
                    setState(
                      provisionedThroughputPath,
                      clamp(parseInt(detail.value), 1, 1024).toString(),
                    )
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </ColumnLayout>
    </SpaceBetween>
  )
}

function EbsSettings({index}: any) {
  const {t} = useTranslation()
  const ebsPath = [...storagePath, index, 'EbsSettings']
  const volumeTypePath = [...ebsPath, 'VolumeType']
  const volumeTypes = ['gp3', 'gp2', 'io1', 'io2', 'sc1', 'stl', 'standard']
  const defaultVolumeType = 'gp3'
  const volumeSizePath = [...ebsPath, 'Size']
  const encryptedPath = [...ebsPath, 'Encrypted']
  const kmsPath = [...ebsPath, 'KmsKeyId']
  const snapshotIdPath = [...ebsPath, 'SnapshotId']
  const editing = useState(['app', 'wizard', 'editing'])

  const deletionPolicyPath = [...ebsPath, 'DeletionPolicy']
  const deletionPolicies = ['Delete', 'Retain', 'Snapshot']

  const volumeErrors = useState([...errorsPath, index, 'EbsSettings', 'Size'])

  let volumeType = useState(volumeTypePath)
  let volumeSize = useState(volumeSizePath)
  let encrypted = useState(encryptedPath)
  let kmsId = useState(kmsPath)
  let snapshotId = useState(snapshotIdPath)
  let deletionPolicy = useState(deletionPolicyPath)

  let validated = useState([...errorsPath, 'validated'])

  React.useEffect(() => {
    const ebsPath = [...storagePath, index, 'EbsSettings']
    const volumeTypePath = [...ebsPath, 'VolumeType']
    const deletionPolicyPath = [...ebsPath, 'DeletionPolicy']
    const volumeSizePath = [...ebsPath, 'Size']
    if (volumeType === null) setState(volumeTypePath, defaultVolumeType)
    if (deletionPolicy === null) setState(deletionPolicyPath, 'Delete')
    if (volumeSize === null) setState(volumeSizePath, 35)
  }, [volumeType, volumeSize, deletionPolicy, index])

  const toggleEncrypted = () => {
    const setEncrypted = !encrypted
    setState(encryptedPath, setEncrypted)
    if (!setEncrypted) clearState(kmsPath)
  }

  return (
    <SpaceBetween direction="vertical" size="m">
      <ColumnLayout columns={2} borders="vertical">
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Trans i18nKey="wizard.storage.Ebs.volumeType.label" />:
          <Select
            disabled={editing}
            placeholder={t('wizard.queues.validation.scriptWithArgs', {
              defaultVlumeType: defaultVolumeType,
            })}
            selectedOption={volumeType && strToOption(volumeType)}
            onChange={({detail}) => {
              setState(volumeTypePath, detail.selectedOption.value)
            }}
            options={volumeTypes.map(strToOption)}
          />
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
            Volume Size (35-2048 in GB):
          </div>
          <div style={{display: 'flex', flexShrink: 1}}>
            <FormField errorText={volumeErrors}>
              <Input
                disabled={editing}
                inputMode={'decimal'}
                type={'number' as InputProps.Type}
                value={volumeSize}
                onChange={({detail}) => {
                  setState(volumeSizePath, detail.value)
                  validated && storageValidate()
                }}
              />
            </FormField>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
              <Toggle
                disabled={editing}
                checked={encrypted}
                onChange={toggleEncrypted}
              >
                <Trans i18nKey="wizard.storage.Ebs.encrypted.label" />
              </Toggle>
            </div>
            {encrypted && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div style={{display: 'flex', flexGrow: 1, flexShrink: 0}}>
                  KMS ID:
                </div>
                <div style={{display: 'flex', flexShrink: 1}}>
                  <Input
                    disabled={editing}
                    value={kmsId}
                    onChange={({detail}) => {
                      setState(kmsPath, detail.value)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <HelpTooltip>
            <Trans i18nKey="wizard.storage.Ebs.encrypted.help">
              <a
                rel="noreferrer"
                target="_blank"
                href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-Encrypted"
              ></a>
            </Trans>
          </HelpTooltip>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Toggle
              checked={snapshotId !== null}
              onChange={_event => {
                setState(snapshotIdPath, snapshotId === null ? '' : null)
              }}
            >
              <Trans i18nKey="wizard.storage.Ebs.snapshotId.label" />
            </Toggle>
            {snapshotId !== null && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                :
                <Input
                  value={snapshotId}
                  onChange={({detail}) => {
                    setState(snapshotIdPath, detail.value)
                  }}
                />
              </div>
            )}
          </div>
          <HelpTooltip>
            <Trans i18nKey="wizard.storage.Ebs.snapshotId.help">
              <a
                rel="noreferrer"
                target="_blank"
                href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-SnapshotId"
              ></a>
            </Trans>
          </HelpTooltip>
        </div>
      </ColumnLayout>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Trans i18nKey="wizard.storage.Ebs.deletionPolicy.label" />:
          <Select
            selectedOption={strToOption(deletionPolicy || 'Delete')}
            onChange={({detail}) => {
              setState(deletionPolicyPath, detail.selectedOption.value)
            }}
            options={deletionPolicies.map(strToOption)}
          />
        </div>
        <HelpTooltip>
          <Trans i18nKey="wizard.storage.Ebs.deletionPolicy.help">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-DeletionPolicy"
            ></a>
          </Trans>
        </HelpTooltip>
      </div>
    </SpaceBetween>
  )
}

function StorageInstance({index}: any) {
  const path = [...storagePath, index]
  const uiSettingsForStorage = ['app', 'wizard', 'storage', 'ui', index]
  const storageType: StorageType = useState([...path, 'StorageType'])
  const storageName = useState([...path, 'Name']) || ''
  const mountPoint = useState([...path, 'MountDir'])
  const useExisting =
    useState([...uiSettingsForStorage, 'useExisting']) ||
    !(STORAGE_TYPE_PROPS[storageType].maxToCreate > 0)
  const settingsPath = [...path, `${storageType}Settings`]
  const existingPath = STORAGE_TYPE_PROPS[storageType].mountFilesystem
    ? [...settingsPath, 'FileSystemId']
    : [...settingsPath, 'VolumeId']
  const existingId = useState(existingPath) || ''
  const storages = useState(storagePath)
  const uiSettings = useState(['app', 'wizard', 'storage', 'ui'])
  const {t} = useTranslation()

  const fsxFilesystems = useState(['aws', 'fsxFilesystems'])
  const fsxVolumes = useState(['aws', 'fsxVolumes'])
  const efsFilesystems = useState(['aws', 'efs_filesystems']) || []
  const editing = useState(['app', 'wizard', 'editing'])

  const canToggle =
    (useExisting && canCreateStorage(storageType, storages, uiSettings)) ||
    (!useExisting &&
      canAttachExistingStorage(storageType, storages, uiSettings))

  const removeStorage = () => {
    if (index === 0 && storages.length === 1) {
      clearState(uiSettings)
      clearState(storagePath)
    } else {
      clearState(uiSettingsForStorage)
      clearState(path)
    }

    // Rename storages to keep indices correct and names unique
    const updatedStorages = getState(storagePath)
    if (updatedStorages)
      for (let i = 0; i < updatedStorages.length; i++) {
        const storage = getState([...storagePath, i])
        setState([...storagePath, i, 'Name'], `${storage.StorageType}${i}`)
      }
  }

  const toggleUseExisting = () => {
    const value = !useExisting
    clearState(settingsPath)
    setState([...uiSettingsForStorage, 'useExisting'], value)
  }

  const idToOption = (id: any) => {
    return {label: id, value: id}
  }

  return (
    <Container
      header={
        <Header
          variant="h3"
          actions={
            <Button disabled={editing} onClick={removeStorage}>
              Remove
            </Button>
          }
        >
          <Trans
            i18nKey="wizard.storage.instance.name.label"
            values={{storageName: storageName}}
          />
        </Header>
      }
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <ColumnLayout columns={2} borders="vertical">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <Trans i18nKey="wizard.storage.instance.mountPoint.label" />:
              <Input
                disabled={editing}
                value={mountPoint}
                onChange={({detail}) => {
                  setState([...storagePath, index, 'MountDir'], detail.value)
                }}
              />
            </div>
            <HelpTooltip>
              <Trans i18nKey="wizard.storage.instance.mountPoint.help" />
            </HelpTooltip>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            {STORAGE_TYPE_PROPS[storageType].maxToCreate > 0 ? (
              <div
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Toggle
                  disabled={!canToggle}
                  checked={useExisting}
                  onChange={toggleUseExisting}
                >
                  <Trans i18nKey="wizard.storage.instance.useExisting.label" />
                </Toggle>
                <HelpTooltip>
                  <Trans i18nKey="wizard.storage.instance.useExisting.help">
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-FileSystemId"
                    ></a>
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-FileSystemId"
                    ></a>
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-VolumeId"
                    ></a>
                  </Trans>
                </HelpTooltip>
              </div>
            ) : null}
            {useExisting &&
              {
                Ebs: (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '16px',
                      marginTop: '10px',
                    }}
                  >
                    Existing EBS ID:
                    <Input
                      placeholder={t(
                        'wizard.storage.instance.useExisting.placeholder',
                      )}
                      value={existingId}
                      onChange={({detail}) => {
                        setState(existingPath, detail.value)
                      }}
                    />
                  </div>
                ),
                FsxLustre: (
                  <FormField label="FSx Lustre Filesystem">
                    <Select
                      placeholder="Please Select"
                      selectedOption={existingId && idToOption(existingId)}
                      onChange={({detail}) => {
                        setState(existingPath, detail.selectedOption.value)
                      }}
                      options={fsxFilesystems.lustre.map((fs: any) => ({
                        value: fs.id,
                        label: fs.displayName,
                      }))}
                    />
                  </FormField>
                ),
                FsxOpenZfs: (
                  <FormField label="Existing FSx OpenZFS volume">
                    <Select
                      placeholder="Please Select"
                      selectedOption={existingId && idToOption(existingId)}
                      onChange={({detail}) => {
                        setState(existingPath, detail.selectedOption.value)
                      }}
                      options={fsxVolumes.zfs.map((vol: any) => ({
                        value: vol.id,
                        label: vol.displayName,
                      }))}
                    />
                  </FormField>
                ),
                FsxOntap: (
                  <FormField label="Existing FSx NetApp ONTAP volume">
                    <Select
                      placeholder="Please Select"
                      selectedOption={existingId && idToOption(existingId)}
                      onChange={({detail}) => {
                        setState(existingPath, detail.selectedOption.value)
                      }}
                      options={fsxVolumes.ontap.map((vol: any) => ({
                        value: vol.id,
                        label: vol.displayName,
                      }))}
                    />
                  </FormField>
                ),
                Efs: (
                  <FormField label="EFS Filesystem">
                    <Select
                      selectedOption={idToOption(existingId || '')}
                      onChange={({detail}) => {
                        setState(existingPath, detail.selectedOption.value)
                      }}
                      options={efsFilesystems.map((x: any) => {
                        return {
                          value: x.FileSystemId,
                          label:
                            x.FileSystemId + (x.Name ? ` (${x.Name})` : ''),
                        }
                      })}
                    />
                  </FormField>
                ),
              }[storageType]}
          </div>
        </ColumnLayout>
        {!useExisting &&
          {
            FsxLustre: <FsxLustreSettings index={index} />,
            Efs: <EfsSettings index={index} />,
            Ebs: <EbsSettings index={index} />,
            FsxOntap: null,
            FsxOpenZfs: null,
          }[storageType]}
      </div>
    </Container>
  )
}

function Storage() {
  const storages = useState(storagePath)
  const editing = useState(['app', 'wizard', 'editing'])
  const uiStorageSettings = useState(['app', 'wizard', 'storage', 'ui'])
  const storageType = useState(['app', 'wizard', 'storage', 'type'])
  const isFsxOnTapActive = useFeatureFlag('fsx_ontap')
  const isFsxOpenZsfActive = useFeatureFlag('fsx_openzsf')

  const storageMaxes: Record<string, number> = {
    FsxLustre: 21,
    FsxOntap: 20,
    FsxOpenZfs: 20,
    Efs: 21,
    Ebs: 5,
  }

  /*
    Activate ONTAP/OpenZFS only from ParallelCluster 3.2.0
   */
  const storageTypesSource: StorageTypeOption[] = [
    ['FsxLustre', 'Amazon FSx for Lustre (FSX)', '/img/fsx.svg'],
    isFsxOnTapActive
      ? ['FsxOntap', 'Amazon FSx for NetApp ONTAP (FSX)', '/img/fsx.svg']
      : false,
    isFsxOpenZsfActive
      ? ['FsxOpenZfs', 'Amazon FSx for OpenZFS (FSX)', '/img/fsx.svg']
      : false,
    ['Efs', 'Amazon Elastic File System (EFS)', '/img/efs.svg'],
    ['Ebs', 'Amazon Elastic Block Store (EBS)', '/img/ebs.svg'],
  ].filter(Boolean) as StorageTypeOption[]

  const defaultCounts = {FsxLustre: 0, Efs: 0, Ebs: 0}

  const storageReducer = (eax: any, item: any) => {
    let ret = {...eax}
    ret[item.StorageType] += 1
    return ret
  }
  const storageCounts = storages
    ? storages.reduce(storageReducer, defaultCounts)
    : defaultCounts

  const storageTypes = storageTypesSource.reduce(
    (newStorages: StorageTypeOption[], storageType: StorageTypeOption) => {
      const st = storageType[0]
      return storageCounts[st] >= storageMaxes[st]
        ? newStorages
        : [...newStorages, storageType]
    },
    [],
  )

  const addStorage = () => {
    const newIndex = storages ? storages.length : 0

    const uiSettingsPath = ['app', 'wizard', 'storage', 'ui']
    const useExisting = !canCreateStorage(
      storageType,
      storages,
      uiStorageSettings,
    )

    if (!storages) {
      setState(storagePath, [
        {
          Name: `${storageType}${newIndex}`,
          StorageType: storageType,
          MountDir: '/shared',
        },
      ])
      setState(uiSettingsPath, [{useExisting}])
    } else {
      setState([...storagePath, newIndex], {
        Name: `${storageType}${newIndex}`,
        StorageType: storageType,
        MountDir: '/shared',
      })
      setState([...uiSettingsPath, newIndex], {useExisting})
    }
    clearState(['app', 'wizard', 'storage', 'type'])
  }

  const setStorageType = (newStorageType: any) => {
    setState(['app', 'wizard', 'storage', 'type'], newStorageType)
  }

  return (
    <Container header={<Header variant="h2">Storage Properties</Header>}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {storages ? (
          storages.map((_: any, i: any) => (
            <StorageInstance key={i} index={i} />
          ))
        ) : (
          <div>No shared storage options selected.</div>
        )}

        {!editing && storageTypes.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                alignItems: 'center',
                marginTop: '10px',
              }}
            >
              Storage Type:
              <Select
                disabled={editing}
                placeholder="Please Select a Filesystem Type"
                selectedOption={
                  storageType &&
                  itemToDisplayIconOption(
                    findFirst(storageTypes, s => s[0] === storageType)!,
                  )
                }
                onChange={({detail}) => {
                  setStorageType(detail.selectedOption.value)
                }}
                options={storageTypes.map(itemToIconOption)}
              />
              <Button
                onClick={addStorage}
                disabled={!storageType}
                iconName={'add-plus'}
              >
                Add Storage
              </Button>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

function canCreateStorage(
  storageType: StorageType,
  storages: Storages,
  uiStorageSettings: UIStorageSettings,
) {
  if (!storageType) {
    return false
  }

  if (!storages || !uiStorageSettings) {
    return true
  }

  const maxToCreate = STORAGE_TYPE_PROPS[storageType].maxToCreate
  const alreadyCreated = storages
    .filter((_, index) => !uiStorageSettings[index].useExisting)
    .filter(storage => storage.StorageType === storageType).length

  return alreadyCreated < maxToCreate
}

function canAttachExistingStorage(
  storageType: StorageType,
  storages: Storages,
  uiStorageSettings: UIStorageSettings,
) {
  if (!storageType) {
    return false
  }

  if (!storages || !uiStorageSettings) {
    return true
  }

  const maxExistingToAttach =
    STORAGE_TYPE_PROPS[storageType].maxExistingToAttach
  const existingAlreadyAttached = storages
    .filter((_, index) => uiStorageSettings[index].useExisting)
    .filter(storage => storage.StorageType === storageType).length

  return existingAlreadyAttached < maxExistingToAttach
}

export {Storage, storageValidate, canCreateStorage, canAttachExistingStorage}
