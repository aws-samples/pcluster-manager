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
import * as React from 'react';
import { findFirst } from '../../util'

// UI Elements
import {
  Button,
  ColumnLayout,
  Container,
  FormField,
  Header,
  Input,
  Select,
  SpaceBetween,
  Toggle,
} from "@awsui/components-react";

import Slider from '@mui/material/Slider';

// State
import { getState, setState, useState, clearState } from '../../store'

// Components
import HelpTooltip from '../../components/HelpTooltip'
import { LabeledIcon } from './Components'

// Constants
const storagePath = ['app', 'wizard', 'config', 'SharedStorage'];
const errorsPath = ['app', 'wizard', 'errors', 'sharedStorage'];

// Helper Functions
// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
function itemToIconOption([value, label, icon]){
  return {value: value, label: label, ...(icon ? {iconUrl: icon} : {})}
}

// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
function itemToDisplayIconOption([value, label, icon]){
  return {value: value, label: (icon ? <LabeledIcon label={label} icon={icon} /> : label)}
}

function strToOption(str: any){
  return {value: str, label: str}
}

function storageValidate() {
  const storageSettings = getState(storagePath);
  let valid = true;

  if(storageSettings)
    for(let i = 0; i < storageSettings.length; i++)
    {
      const settingsType = getState([...storagePath, i, 'StorageType']);
      if(settingsType === 'Ebs')
      {
        const volumeId = getState([...storagePath, i, 'EbsSettings', 'VolumeId']);
        const volumeSize = getState([...storagePath, i, 'EbsSettings', 'Size']);
        if(!volumeId && (volumeSize === null || volumeSize === '' || volumeSize < 35 || volumeSize > 2048))
        {
          setState([...errorsPath, i, 'EbsSettings', 'Size'], 'You must specify a valid Volume Size.');
          valid = false;
        } else {
          clearState([...errorsPath, i, 'EbsSettings', 'Size']);
        }
      }
    }

  setState([...errorsPath, 'validated'], true);

  const config = getState(['app', 'wizard', 'config']);
  console.log(config);
  return valid;
}

function FsxLustreSettings({
  index
}: any) {
  const versionMinor = useState(['app', 'version', 'minor']);
  const storageAppPath = ['app', 'wizard', 'storage', index];
  const useExisting = useState([...storageAppPath, 'useExisting']) || false;

  const fsxPath = [...storagePath, index, 'FsxLustreSettings']
  const storageCapacityPath = [...fsxPath, 'StorageCapacity'];
  const lustreTypePath = [...fsxPath, 'DeploymentType'];
  // support FSx Lustre PERSISTENT_2 only in >= 3.2.0
  const lustreTypes = versionMinor >= 2 ? ['PERSISTENT_2', 'PERSISTENT_1', 'SCRATCH_1', 'SCRATCH_2'] : ['PERSISTENT_1', 'SCRATCH_1', 'SCRATCH_2'];
  const storageThroughputPath = [...fsxPath, 'PerUnitStorageThroughput'];
  const storageThroughputsP1 = [50, 100, 200];
  const storageThroughputsP2 = [125, 250, 500, 1000];
  const importPathPath = [...fsxPath, 'ImportPath'];
  const exportPathPath = [...fsxPath, 'ExportPath'];
  const compressionPath = [...fsxPath, 'DataCompressionType'];

  const storageCapacity = useState(storageCapacityPath);
  const lustreType = useState(lustreTypePath);
  const storageThroughput = useState(storageThroughputPath);
  const importPath = useState(importPathPath) || '';
  const exportPath = useState(exportPathPath) || '';
  const compression = useState(compressionPath);

  const editing = useState(['app', 'wizard', 'editing']);

  React.useEffect(() => {
    const fsxPath = [...storagePath, index, 'FsxLustreSettings']
    const storageCapacityPath = [...fsxPath, 'StorageCapacity'];
    const lustreTypePath = [...fsxPath, 'DeploymentType'];
    if(storageCapacity === null && !useExisting)
      setState(storageCapacityPath, 1200);
    if(lustreType === null && !useExisting)
      setState(lustreTypePath, versionMinor >= 2 ? 'PERSISTENT_2' : 'PERSISTENT_1');
  }, [storageCapacity, lustreType, storageThroughput]);

  const toggleCompression = () => {
    if(compression)
      clearState(compressionPath);
    else
      setState(compressionPath, 'LZ4');
  }

  const setImportPath = (path: any) => {
    if(path !== '')
      setState(importPathPath, path);
    else
      clearState(importPathPath);
  }

  const setExportPath = (path: any) => {
    if(path !== '')
      setState(exportPathPath, path);
    else
      clearState(exportPathPath);
  }

  return (
    <ColumnLayout columns={2} borders="vertical">
      <div key="capacity" style={{display: "flex", flexDirection: "column"}}>
        Storage Capacity: {storageCapacity} GB
        <Slider
          disabled={editing}
          aria-label="Storage Capacity"
          defaultValue={1200}
          getAriaValueText={(v) => {return `${v} GB`}}
          valueLabelDisplay="auto"
          value={storageCapacity}
          onChange={((e) => {setState(storageCapacityPath, (e.target as any).value);})}
          step={1200}
          min={1200}
          max={100800}
        />
      </div>
      <div key="lustre-type" style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          FSx Lustre Type:
          <Select
            disabled={editing}
            // @ts-expect-error TS(2322) FIXME: Type '{ disabled: any; selectedOption: { value: an... Remove this comment to see the full error message
            selectedOption={strToOption(lustreType || 'PERSISTENT_1')} label="FSx Lustre Type" onChange={({detail}) => {
              setState(lustreTypePath, detail.selectedOption.value);
              if(detail.selectedOption.value === 'PERSISTENT_1') {
                setState(storageThroughputPath, 200);
              } else {
                clearState(storageThroughputPath);
              }
            }}
            options={lustreTypes.map(strToOption)}
          />
        </div>
        <HelpTooltip>
          Choose SCRATCH_1 and SCRATCH_2 deployment types when you need temporary storage and shorter-term processing of data. The SCRATCH_2 deployment type provides in-transit encryption of data and higher burst throughput capacity than SCRATCH_1. Choose PERSISTENT_2 deployment type for longer-term storage and workloads and encryption of data in transit, choose PERSISTENT_1 only for backwards compatibility. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-DeploymentType'>DeploymentType</a>.
        </HelpTooltip>
      </div>

      { lustreType === 'PERSISTENT_1' &&
      <>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <FormField label="Import Path">
            <Input
              disabled={editing}
              placeholder="s3://yourbucket"
              value={importPath} onChange={({detail}) => setImportPath(detail.value)} />
          </FormField>
          <HelpTooltip>
            Set Import Path to read files into your filesystem from an S3 bucket. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-ImportPath'>ImportPath</a>.
          </HelpTooltip>
        </div>

        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <FormField label="Export Path">
            <Input
              disabled={editing}
              placeholder="s3://yourbucket"
              value={exportPath} onChange={({detail}) => {setExportPath(detail.value)}} />
          </FormField>
          <HelpTooltip>
            Set Export Path to write files from your filesystem into an S3 bucket. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-ExportPath'>ExportPath</a>.
          </HelpTooltip>
        </div>
      </>
      }

      { ['PERSISTENT_1', 'PERSISTENT_2'].includes(lustreType) &&
      <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
        <FormField label="Per Unit Storage Throughput">
          <Select
            selectedOption={strToOption(storageThroughput || 125)} onChange={({detail}) => {
              setState(storageThroughputPath, detail.selectedOption.value);
            }}
            options={lustreType == 'PERSISTENT_1'? storageThroughputsP1.map(strToOption) : storageThroughputsP2.map(strToOption)}
          />
        </FormField>
        <HelpTooltip>
          Describes the amount of read and write throughput for each 1 tebibyte of storage, in MB/s/TiB. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-PerUnitStorageThroughput'>PerUnitStorageThroughput</a>.
        </HelpTooltip>
      </div>
      }
      <div style={{display: "flex", flexDirection: "row", alignItems: "center", marginTop: "10px", justifyContent: "space-between"}}>
        <Toggle checked={compression !== null} onChange={toggleCompression}>Compress Filesystem Data?</Toggle>
        <HelpTooltip>
          When data compression is enabled, Amazon FSx for Lustre automatically compresses newly written files before they are written to disk and automatically uncompresses them when they are read. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-DataCompressionType'>DataCompressionType</a>.
        </HelpTooltip>
      </div>
    </ColumnLayout>
  )
}

function EfsSettings({
  index
}: any) {
  const efsPath = [...storagePath, index, 'EfsSettings'];
  const encryptedPath = [...efsPath, 'Encrypted'];
  const kmsPath = [...efsPath, 'KmsKeyId'];
  const performancePath = [...efsPath, 'PerformanceMode'];
  const performanceModes = ['generalPurpose', 'maxIO'];

  const throughputModePath = [...efsPath, 'ThroughputMode'];
  const provisionedThroughputPath = [...efsPath, 'ProvisionedThroughput'];

  let encrypted = useState(encryptedPath);
  let kmsId = useState(kmsPath);
  let performanceMode = useState(performancePath) || "generalPurpose";
  let throughputMode = useState(throughputModePath);
  let provisionedThroughput = useState(provisionedThroughputPath);

  React.useEffect(() => {
    const efsPath = [...storagePath, index, 'EfsSettings'];
    const throughputModePath = [...efsPath, 'ThroughputMode'];
    const provisionedThroughputPath = [...efsPath, 'ProvisionedThroughput'];
    if(throughputMode === null)
      setState(throughputModePath, 'bursting')
    else if(throughputMode === 'bursting')
      clearState([provisionedThroughputPath])
  }, [throughputMode]);

  const toggleEncrypted = () => {
    const setEncrypted = !encrypted;
    setState(encryptedPath, setEncrypted);
    if(!setEncrypted)
      clearState(kmsPath);
  }

  return (
    <SpaceBetween direction="vertical" size="s">
      <ColumnLayout columns={2} borders="vertical">
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
              <Toggle checked={encrypted} onChange={toggleEncrypted}>Encrypted</Toggle>
            </div>
            { encrypted &&
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
              <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
                KMS ID:
              </div>
              <div style={{display: "flex", flexShrink: 1}}>
                <Input value={kmsId} onChange={(({detail}) => {setState(kmsPath, detail.value)})} />
              </div>
            </div>
            }
          </div>
          <HelpTooltip>
            Specifies a custom AWS KMS key to use for encryption. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-Encrypted'>EFS Encryption.</a>
          </HelpTooltip>
        </div>

        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          Performance Mode:
          <Select
            selectedOption={strToOption(performanceMode)} onChange={({detail}) => {setState(performancePath, detail.selectedOption.value)}}
            options={performanceModes.map(strToOption)}
          />
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
            <Toggle checked={throughputMode !== 'bursting'} onChange={(event) => {
              setState(throughputModePath, throughputMode === 'bursting' ? 'provisioned' : 'bursting' );
              if(throughputMode === 'provisioned')
                setState(provisionedThroughputPath, 128)
            }}>Provisioned Throughput</Toggle>
            <HelpTooltip>
              Defines the provisioned throughput (from 1-1024 in MiB/s) of the
              Amazon EFS file system. If not provided filesystem will be created in
              'bursting' mode. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-ThroughputMode'>ThroughputMode
                section.</a>
            </HelpTooltip>
          </div>
          { throughputMode === 'provisioned' &&
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
              Throughput (1-1024 in MiB/s):
            </div>
            <div style={{display: "flex", flexShrink: 1}}>
              <Input
                type="number"
                // @ts-expect-error TS(2322) FIXME: Type 'number' is not assignable to type 'string'.
                value={Math.max(Math.min(provisionedThroughput, 1024), 1)} onChange={(({detail}) => {setState(provisionedThroughputPath, Math.max(Math.min(detail.value, 1024), 1))})} />
            </div>
          </div>
          }
        </div>
      </ColumnLayout>
    </SpaceBetween>
  )
}

function EbsSettings({
  index
}: any) {
  const ebsPath = [...storagePath, index, 'EbsSettings'];
  const volumeTypePath = [...ebsPath, 'VolumeType'];
  const volumeTypes = ['gp3', 'gp2', 'io1', 'io2', 'sc1', 'stl', 'standard']
  const defaultVolumeType = 'gp3';
  const volumeSizePath = [...ebsPath, 'Size'];
  const encryptedPath = [...ebsPath, 'Encrypted'];
  const kmsPath = [...ebsPath, 'KmsKeyId'];
  const snapshotIdPath = [...ebsPath, 'SnapshotId'];
  const editing = useState(['app', 'wizard', 'editing']);

  const deletionPolicyPath = [...ebsPath, 'DeletionPolicy'];
  const deletionPolicies = ['Delete', 'Retain', 'Snapshot'];

  const volumeErrors = useState([...errorsPath, index, 'EbsSettings', 'Size']);

  let volumeType = useState(volumeTypePath);
  let volumeSize = useState(volumeSizePath);
  let encrypted = useState(encryptedPath);
  let kmsId = useState(kmsPath);
  let snapshotId = useState(snapshotIdPath);
  let deletionPolicy = useState(deletionPolicyPath);

  let validated = useState([...errorsPath, 'validated']);

  React.useEffect(() => {
    const ebsPath = [...storagePath, index, 'EbsSettings'];
    const volumeTypePath = [...ebsPath, 'VolumeType'];
    const deletionPolicyPath = [...ebsPath, 'DeletionPolicy']
    const volumeSizePath = [...ebsPath, 'Size'];
    if(volumeType === null)
      setState(volumeTypePath, defaultVolumeType);
    if(deletionPolicy === null)
      setState(deletionPolicyPath, 'Delete');
    if(volumeSize === null)
      setState(volumeSizePath, 35);
  }, [volumeType, volumeSize, deletionPolicy, index]);

  const toggleEncrypted = () => {
    const setEncrypted = !encrypted;
    setState(encryptedPath, setEncrypted);
    if(!setEncrypted)
      clearState(kmsPath);
  }

  return (
    <SpaceBetween direction="vertical" size="m">
      <ColumnLayout columns={2} borders="vertical">
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          Volume Type:
          <Select
            disabled={editing}
            placeholder={`Default (${defaultVolumeType})`}
            // @ts-expect-error TS(2322) FIXME: Type '{ disabled: any; placeholder: string; select... Remove this comment to see the full error message
            selectedOption={volumeType && strToOption(volumeType)} label="Volume Type" onChange={({detail}) => {setState(volumeTypePath, detail.selectedOption.value)}}
            options={volumeTypes.map(strToOption)}
          />
        </div>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
            Volume Size (35-2048 in GB):
          </div>
          <div style={{display: "flex", flexShrink: 1}}>
            <FormField errorText = {volumeErrors}>
              <Input
                disabled={editing}
                style={{marginTop: 10}}
                // @ts-expect-error TS(2322) FIXME: Type '"decimal"' is not assignable to type 'Type |... Remove this comment to see the full error message
                type="decimal"
                value={volumeSize}
                onChange={({detail}) => {setState(volumeSizePath, detail.value); validated && storageValidate()}} />
            </FormField>
          </div>
        </div>

      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
            <Toggle
              disabled={editing}
              checked={encrypted} onChange={toggleEncrypted}>Encrypted</Toggle>
          </div>
          { encrypted &&
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            <div style={{display: "flex", flexGrow: 1, flexShrink: 0}}>
              KMS ID:
            </div>
            <div style={{display: "flex", flexShrink: 1}}>
              <Input disabled={editing} value={kmsId} onChange={(({detail}) => {setState(kmsPath, detail.value)})} />
            </div>
          </div>
          }
        </div>
        <HelpTooltip>
          Specifies a custom AWS KMS key to use for encryption. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-Encrypted'>EBS Encryption.</a>
        </HelpTooltip>
      </div>

      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          <Toggle checked={snapshotId !== null} onChange={(event) => {setState(snapshotIdPath, snapshotId === null ? '' : null )}}>Snapshot ID</Toggle>
          { snapshotId !== null &&
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
            :
            {/* @ts-expect-error TS(2322) FIXME: Type '{ style: { marginBottom: number; }; value: a... Remove this comment to see the full error message */}
            <Input style={{ marginBottom: 10}} value={snapshotId} onChange={(({detail}) => {setState(snapshotIdPath, detail.value)})} />
          </div>
          }
        </div>
        <HelpTooltip>
          Specifies the Amazon EBS snapshot ID if you're using a snapshot as the source for the volume. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-SnapshotId'>SnapshotID</a>.
        </HelpTooltip>
      </div>

      </ColumnLayout>

      <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          Deletion Policy:
          <Select
            // @ts-expect-error TS(2322) FIXME: Type '{ selectedOption: { value: any; label: any; ... Remove this comment to see the full error message
            selectedOption={strToOption(deletionPolicy || "Delete")} label="Deletion Policy" onChange={({detail}) => {setState(deletionPolicyPath, detail.selectedOption.value)}}
            options={deletionPolicies.map(strToOption)}
          />
        </div>
        <HelpTooltip>
          Specifies whether the volume should be retained, deleted, or snapshotted when the cluster is deleted. See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-DeletionPolicy'>DeletionPolicy</a>.
        </HelpTooltip>
      </div>
    </SpaceBetween>
  )
}

/*
 * Used to configure the Storage part of the Cluster wizard:
 *  - controls whether a storage type can be created or just linked
 *  - specify if a storage type can be mounted as a file system or just one of its volumes
 */
const STORAGE_TYPE_PROPS = {
  "FsxLustre": {
    canCreate: true,
    mountFilesystem: true,
  },
  "FsxOntap": {
    canCreate: false,
    mountFilesystem: false,
  },
  "FsxOpenZfs": {
    canCreate: false,
    mountFilesystem: false,
  },
  "Efs": {
    canCreate: true,
    mountFilesystem: true,
  },
  "Ebs": {
    canCreate: true,
    mountFilesystem: false,
  },
}

function StorageInstance({
  index
}: any) {
  const path = [...storagePath, index]
  const storageAppPath = ['app', 'wizard', 'storage', index];
  const storageType = useState([...path, 'StorageType']) || "none";
  const storageName = useState([...path, 'Name']) || "";
  const mountPoint = useState([...path, 'MountDir']);
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const useExisting = useState([...storageAppPath, 'useExisting']) || !STORAGE_TYPE_PROPS[storageType].canCreate;
  const settingsPath = [...path, `${storageType}Settings`]
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const existingPath = STORAGE_TYPE_PROPS[storageType].mountFilesystem ? [...settingsPath, 'FileSystemId'] : [...settingsPath, 'VolumeId'];
  const existingId = useState(existingPath) || "";
  const storages = useState(storagePath);

  const fsxFilesystems = useState(['aws', 'fsxFilesystems']);
  const fsxVolumes = useState(['aws', 'fsxVolumes']);
  const efsFilesystems = useState(['aws', 'efs_filesystems']) || [];
  const editing = useState(['app', 'wizard', 'editing']);

  const removeStorage = (type: any) => {
    if(index === 0 && storages.length === 1)
      clearState(storagePath);
    else
      clearState(path);

    // Rename storages to keep indices correct and names unique
    const updatedStorages = getState(storagePath);
    if(updatedStorages)
      for(let i = 0; i < updatedStorages.length; i++)
      {
        const storage = getState([...storagePath, i]);
        setState([...storagePath, i, 'Name'], `${storage.StorageType}${i}`);

      }
  }

  const toggleUseExisting = () => {
    const value = !useExisting;
    clearState(settingsPath)
    setState([...storageAppPath, 'useExisting'], value);
  }

  const idToOption = (id: any) => {
    return {label: id, value: id}
  }

  return (
    <Container
      header={<Header
        variant="h3"
        actions={<Button disabled={editing} onClick={removeStorage}>Remove</Button>}>
        Name: {storageName}
      </Header>}
    >
      <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
        <ColumnLayout columns={2} borders="vertical">
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "10px"}}>
            <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
              Mount Point:
              <Input
                disabled={editing}
                value={mountPoint}
                onChange={(({detail}) => {setState([...storagePath, index, 'MountDir'], detail.value)})} />
            </div>
            <HelpTooltip>
              Where to mount the shared storage on both the Head Node and Compute Fleet instances.
            </HelpTooltip>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message */}
            {STORAGE_TYPE_PROPS[storageType].canCreate ? <div style={{marginTop: "10px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
              <Toggle disabled={editing} checked={useExisting} onChange={toggleUseExisting}>Use Existing Filesystem</Toggle>
              <HelpTooltip>
                Specify an existing fileystem and mount it to all instances in the cluster.
                See <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-FsxLustreSettings-FileSystemId'>FSx Filesystem ID</a>
                , <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EfsSettings-FileSystemId'>EFS Filesystem ID</a>
                , <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/parallelcluster/latest/ug/SharedStorage-v3.html#yaml-SharedStorage-EbsSettings-VolumeId'>EBS Volume ID</a>
              </HelpTooltip>
            </div> : null} 
            { useExisting &&
                // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
                {
                  "Ebs":
                    <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px", marginTop: "10px"}}>
                      Existing EBS ID:
                      <Input
                        placeholder="i.e. fsx-1234 or efs-1234"
                        value={existingId}
                        onChange={(({detail}) => {setState(existingPath, detail.value)})} />
                    </div>,
                  "FsxLustre": <FormField label="FSx Lustre Filesystem">
                    <Select
                      placeholder="Please Select"
                      // @ts-expect-error TS(2322) FIXME: Type '{ placeholder: string; selectedOption: any; ... Remove this comment to see the full error message
                      selectedOption={existingId && idToOption(existingId)} label="FSx Filesystem" onChange={({detail}) => {setState(existingPath, detail.selectedOption.value)}}
                      options={fsxFilesystems.lustre.map((fs: any) => ({
                        value: fs.id,
                        label: fs.displayName
                      }))}
                    />
                  </FormField>,
                  "FsxOpenZfs": <FormField label="Existing FSx OpenZFS volume">
                    <Select
                      placeholder="Please Select"
                      // @ts-expect-error TS(2322) FIXME: Type '{ placeholder: string; selectedOption: any; ... Remove this comment to see the full error message
                      selectedOption={existingId && idToOption(existingId)} label="FSx OpenZFS volume" onChange={({detail}) => {setState(existingPath, detail.selectedOption.value)}}
                      options={fsxVolumes.zfs.map((vol: any) => ({
                        value: vol.id,
                        label: vol.displayName
                      }))}
                    />
                  </FormField>,
                  "FsxOntap": <FormField label="Existing FSx NetApp ONTAP volume">
                    <Select
                      placeholder="Please Select"
                      // @ts-expect-error TS(2322) FIXME: Type '{ placeholder: string; selectedOption: any; ... Remove this comment to see the full error message
                      selectedOption={existingId && idToOption(existingId)} label="FSx ONTAP volume" onChange={({detail}) => {setState(existingPath, detail.selectedOption.value)}}
                      options={fsxVolumes.ontap.map((vol: any) => ({
                        value: vol.id,
                        label: vol.displayName
                      }))}
                    />
                  </FormField>,
                  "Efs": <FormField label="EFS Filesystem">
                    <Select
                      // @ts-expect-error TS(2322) FIXME: Type '{ selectedOption: { label: any; value: any; ... Remove this comment to see the full error message
                      selectedOption={idToOption(existingId || "")} label="EFS Filesystem" onChange={({detail}) => {setState(existingPath, detail.selectedOption.value)}}
                      options={efsFilesystems.map((x: any, i: any) => {return {value: x.FileSystemId, label: (x.FileSystemId + (x.Name ? ` (${x.Name})` : ""))}})}
                    />
                  </FormField>}[storageType]
            }
          </div>
        </ColumnLayout>
        {/* @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message */}
        { ! useExisting && {"FsxLustre": <FsxLustreSettings index={index}/>,
          "Efs": <EfsSettings index={index}/>,
          "Ebs": <EbsSettings index={index}/>}[storageType]
        }
      </div>
    </Container>
  );
}

function Storage() {
  const storages = useState(storagePath);
  const editing = useState(['app', 'wizard', 'editing']);
  const storageType = useState(['app', 'wizard', 'storage', 'type']);
  const versionMinor = useState(['app', 'version', 'minor']);

  const storageMaxes = {"FsxLustre": 1, "FsxOntap": 1, "FsxOpenZfs": 1, "Efs": 1, "Ebs": 5}

  /*
    Activate ONTAP/OpenZFS only from ParallelCluster 3.2.0
   */
  const storageTypesSource = versionMinor >= 2 ? [
    ["FsxLustre", "Amazon FSx for Lustre (FSX)", "/img/fsx.svg"],
    ["FsxOntap", "Amazon FSx for NetApp ONTAP (FSX)", "/img/fsx.svg"],
    ["FsxOpenZfs", "Amazon FSx for OpenZFS (FSX)", "/img/fsx.svg"],
    ["Efs", "Amazon Elastic File System (EFS)", "/img/efs.svg"],
    ["Ebs", "Amazon Elastic Block Store (EBS)", "/img/ebs.svg"],
  ] : [
    ["FsxLustre", "Amazon FSx for Lustre (FSX)", "/img/fsx.svg"],
    ["Efs", "Amazon Elastic File System (EFS)", "/img/efs.svg"],
    ["Ebs", "Amazon Elastic Block Store (EBS)", "/img/ebs.svg"],
  ];

  const defaultCounts = {"FsxLustre": 0, "Efs": 0, "Ebs": 0}

  const storageReducer = (eax: any, item: any) => {
    let ret = {...eax}
    ret[item.StorageType] += 1
    return ret;
  }
  const storageCounts = storages ? storages.reduce(storageReducer, defaultCounts) : defaultCounts;

  // @ts-expect-error TS(2769) FIXME: No overload matches this call.
  const storageTypes = storageTypesSource.reduce((newStorages, storageType) => {
    const st = storageType[0];
    // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    return storageCounts[st] >= storageMaxes[st] ? newStorages : [...newStorages, storageType];
  }, [])

  const addStorage = () => {
    const newIndex = storages ? storages.length : 0;
    if(!storages)
      setState(storagePath, [{Name: `${storageType}${newIndex}`, StorageType: storageType, MountDir: '/shared'}]);
    else
      setState([...storagePath, newIndex], {Name: `${storageType}${newIndex}`, StorageType: storageType, MountDir: '/shared'});
    clearState(['app', 'wizard', 'storage', 'type']);
  }

  const setStorageType = (newStorageType: any) => {
    setState(['app', 'wizard', 'storage', 'type'], newStorageType);
  }

  return (
    <Container header={<Header variant="h2">Storage Properties</Header>}>
      <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
        {storages ? storages.map((_: any, i: any) => <StorageInstance key={i} index={i} />)
        : <div>No shared storage options selected.</div>}

        {!editing && storageTypes.length > 0 &&
          <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end"}}>
            <div style={{display: "flex", flexDirection: "row", gap: "16px", alignItems: "center", marginTop: "10px"}}>
              Storage Type:
              <Select
                disabled={editing}
                placeholder="Please Select a Filesystem Type"
                selectedOption={storageType && itemToDisplayIconOption(findFirst(storageTypes, (s: any) => {return s[0] === storageType}))}
                onChange={({detail}) => {setStorageType(detail.selectedOption.value)}}
                // @ts-expect-error TS(2345) FIXME: Argument of type '([value, label, icon]: [any, any... Remove this comment to see the full error message
                options={storageTypes.map(itemToIconOption)}
              />
              <Button onClick={addStorage} disabled={!storageType || (storages && storages.length >= 5)} iconName={"add-plus"}>Add Storage</Button>
            </div>
          </div>
        }
      </div>
    </Container>
  );
}

export { Storage, storageValidate }
