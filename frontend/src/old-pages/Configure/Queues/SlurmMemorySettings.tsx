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
  Container,
  Header,
  Alert,
  Toggle,
  SpaceBetween,
  Popover,
  Link,
} from '@cloudscape-design/components'
import {setState, getState, useState, clearState} from '../../../store'
import {Queue} from './queues.types'
import {useFeatureFlag} from '../../../feature-flags/useFeatureFlag'

const slurmSettingsPath = [
  'app',
  'wizard',
  'config',
  'Scheduling',
  'SlurmSettings',
]
const memoryBasedSchedulingEnabledPath = [
  ...slurmSettingsPath,
  'EnableMemoryBasedScheduling',
]
const queuesPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues']

const hasMultipleInstanceTypes = (queues: Queue[]): boolean => {
  return (
    queues
      .map(queue => queue.ComputeResources)
      .map(computeResources =>
        computeResources.map(computeResource => computeResource.Instances),
      )
      .flat()
      .filter(instances => instances.length > 1).length > 0
  )
}

function SlurmMemorySettings() {
  const {t} = useTranslation()
  const memoryBasedSchedulingEnabled = useState(
    memoryBasedSchedulingEnabledPath,
  )
  const queues = useState(queuesPath)
  const multipleInstancesTypesSelected = useFeatureFlag(
    'queues_multiple_instance_types',
  )
    ? hasMultipleInstanceTypes(queues)
    : false

  const clearSlurmSettingsState = React.useCallback(() => {
    clearState(memoryBasedSchedulingEnabledPath)
    if (Object.keys(getState(slurmSettingsPath)).length === 0)
      clearState(slurmSettingsPath)
  }, [])

  React.useEffect(() => {
    if (multipleInstancesTypesSelected) {
      clearSlurmSettingsState()
    }
  }, [clearSlurmSettingsState, multipleInstancesTypesSelected])

  const toggleMemoryBasedSchedulingEnabled = () => {
    !memoryBasedSchedulingEnabled
      ? setState(memoryBasedSchedulingEnabledPath, true)
      : clearSlurmSettingsState()
  }

  return (
    <Container
      header={
        <Header variant="h2">
          <SpaceBetween size="xs" direction="horizontal">
            {t('wizard.queues.slurmMemorySettings.container.title')}
            <Popover
              dismissButton={true}
              position="right"
              size="small"
              triggerType="custom"
              content={
                <Trans i18nKey="wizard.queues.slurmMemorySettings.container.help">
                  <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href="https://slurm.schedmd.com/cgroup.conf.html#OPT_ConstrainRAMSpace"
                  ></a>
                </Trans>
              }
            >
              <Link variant="info">
                {t('wizard.queues.slurmMemorySettings.container.info')}
              </Link>
            </Popover>
          </SpaceBetween>
        </Header>
      }
    >
      <SpaceBetween size={'s'} direction={'vertical'}>
        <div
          key="memory-based-scheduling-enabled"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Toggle
            checked={memoryBasedSchedulingEnabled}
            disabled={multipleInstancesTypesSelected}
            onChange={toggleMemoryBasedSchedulingEnabled}
          >
            <Trans i18nKey="wizard.queues.slurmMemorySettings.toggle.label" />
          </Toggle>
        </div>
        <Alert
          visible={multipleInstancesTypesSelected}
          header={t('wizard.queues.slurmMemorySettings.info.header')}
        >
          {t('wizard.queues.slurmMemorySettings.info.body')}
        </Alert>
      </SpaceBetween>
    </Container>
  )
}

export {SlurmMemorySettings, hasMultipleInstanceTypes}
