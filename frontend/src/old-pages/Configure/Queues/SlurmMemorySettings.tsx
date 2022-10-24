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
} from '@awsui/components-react'
import {setState, getState, useState, clearState} from '../../../store'

function SlurmMemorySettings() {
  const {t} = useTranslation()
  const [infoAlertVisible, setInfoAlertVisible] = React.useState(false)
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
  const memoryBasedSchedulingEnabled = useState(
    memoryBasedSchedulingEnabledPath,
  )

  const toggleMemoryBasedSchedulingEnabled = () => {
    const setMemoryBasedSchedulingEnabled = !memoryBasedSchedulingEnabled
    if (setMemoryBasedSchedulingEnabled)
      setState(
        memoryBasedSchedulingEnabledPath,
        setMemoryBasedSchedulingEnabled,
      )
    else {
      clearState(memoryBasedSchedulingEnabledPath)
      if (Object.keys(getState([...slurmSettingsPath])).length === 0)
        clearState([...slurmSettingsPath])
    }
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
            onChange={toggleMemoryBasedSchedulingEnabled}
          >
            <Trans i18nKey="wizard.queues.slurmMemorySettings.toggle.label" />
          </Toggle>
        </div>
        <Alert
          onDismiss={() => setInfoAlertVisible(false)}
          visible={infoAlertVisible}
          dismissAriaLabel={t(
            'wizard.queues.slurmMemorySettings.info.dismissAriaLabel',
          )}
          dismissible
          header={t('wizard.queues.slurmMemorySettings.info.header')}
        >
          {t('wizard.queues.slurmMemorySettings.info.body')}
        </Alert>
      </SpaceBetween>
    </Container>
  )
}

export {SlurmMemorySettings}
