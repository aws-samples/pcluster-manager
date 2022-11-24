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

import {FormField, Select, SelectProps} from '@cloudscape-design/components'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {useFeatureFlag} from '../../../feature-flags/useFeatureFlag'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const QueueUpdateStrategyForm: React.FC<Props> = ({value, onChange}) => {
  const {t} = useTranslation()
  const isQueueUpdateStrategyEnabled = useFeatureFlag(
    'slurm_queue_update_strategy',
  )

  const selectedAriaLabel = t(
    'wizard.headNode.slurmSettings.queueUpdateStrategy.selectedAriaLabel',
  )
  const options = [
    {
      label: t(
        'wizard.headNode.slurmSettings.queueUpdateStrategy.options.computeFleetStop',
      ),
      value: 'COMPUTE_FLEET_STOP',
    },
    {
      label: t(
        'wizard.headNode.slurmSettings.queueUpdateStrategy.options.drain',
      ),
      value: 'DRAIN',
    },
    {
      label: t(
        'wizard.headNode.slurmSettings.queueUpdateStrategy.options.terminate',
      ),
      value: 'TERMINATE',
    },
  ]

  const selectedOption = options.find(option => option.value === value) || null

  const onChangeCallback: NonCancelableEventHandler<SelectProps.ChangeDetail> =
    useCallback(
      ({detail: {selectedOption}}) => {
        if (!selectedOption.value) return

        onChange(selectedOption.value)
      },
      [onChange],
    )

  if (!isQueueUpdateStrategyEnabled) return null

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.queueUpdateStrategy.label')}
    >
      <Select
        selectedOption={selectedOption}
        onChange={onChangeCallback}
        options={options}
        placeholder={t(
          'wizard.headNode.slurmSettings.queueUpdateStrategy.placeholder',
        )}
        selectedAriaLabel={selectedAriaLabel}
      />
    </FormField>
  )
}
