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

import {FormField, Input} from '@cloudscape-design/components'
import {BaseChangeDetail} from '@cloudscape-design/components/input/interfaces'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'

export function validateScaledownIdleTime(value: string) {
  if (!value) {
    return true
  }

  return parseInt(value, 10) > 0
}

type ViewStatus = 'error' | 'valid'

interface Props {
  value: number | undefined
  onChange: (value: number | null) => void
}

export const ScaledownIdleTimeForm: React.FC<Props> = ({value, onChange}) => {
  const {t} = useTranslation()
  const [status, setStatus] = useState<ViewStatus>('valid')

  const displayValue = String(value)
  const errorText =
    status === 'error'
      ? t(
          'wizard.headNode.slurmSettings.validation.scaledownIdleTimeLessThanOne',
        )
      : null

  const onChangeCallback: NonCancelableEventHandler<BaseChangeDetail> =
    useCallback(
      ({detail: {value}}) => {
        if (!value) {
          setStatus('valid')
          onChange(null)
          return
        }

        if (validateScaledownIdleTime(value)) {
          setStatus('valid')
          onChange(parseInt(value, 10))
        } else {
          setStatus('error')
          onChange(parseInt(value, 10))
        }
      },
      [onChange],
    )

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.scaledownIdleTime.label')}
      description={t(
        'wizard.headNode.slurmSettings.scaledownIdleTime.description',
      )}
      errorText={errorText}
    >
      <Input
        onChange={onChangeCallback}
        value={displayValue}
        placeholder={t(
          'wizard.headNode.slurmSettings.scaledownIdleTime.placeholder',
        )}
        type="number"
        inputMode="numeric"
      />
    </FormField>
  )
}
