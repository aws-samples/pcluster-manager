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

import {ColumnLayout, FormField, Input} from '@cloudscape-design/components'
import {useTranslation} from 'react-i18next'
import {useFeatureFlag} from '../../../feature-flags/useFeatureFlag'
import {setState, useState} from '../../../store'

interface DatabaseFieldProps {
  uriPath: string[]
  uriErrorPath: string[]
}

function DatabaseField({uriPath, uriErrorPath}: DatabaseFieldProps) {
  const {t} = useTranslation()
  let uri = useState(uriPath) || ''
  let uriError = useState(uriErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.database.label')}
      description={t('wizard.headNode.slurmSettings.database.description')}
      errorText={uriError}
    >
      <Input
        onChange={({detail}) => {
          setState(uriPath, detail.value)
        }}
        value={uri}
        placeholder={t('wizard.headNode.slurmSettings.database.placeholder')}
      />
    </FormField>
  )
}

interface UsernameFieldProps {
  usernamePath: string[]
  usernameErrorPath: string[]
}

function UsernameField({usernamePath, usernameErrorPath}: UsernameFieldProps) {
  const {t} = useTranslation()
  let username = useState(usernamePath) || ''
  let usernameError = useState(usernameErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.username.label')}
      description={t('wizard.headNode.slurmSettings.username.description')}
      errorText={usernameError}
    >
      <Input
        onChange={({detail}) => {
          setState(usernamePath, detail.value)
        }}
        value={username}
        type="text"
      />
    </FormField>
  )
}

interface PasswordFieldProps {
  passwordPath: string[]
  passwordErrorPath: string[]
}

function PasswordField({passwordPath, passwordErrorPath}: PasswordFieldProps) {
  const {t} = useTranslation()
  let password = useState(passwordPath) || ''
  let passwordError = useState(passwordErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.password.label')}
      description={t('wizard.headNode.slurmSettings.password.description')}
      errorText={passwordError}
    >
      <Input
        onChange={({detail}) => {
          setState(passwordPath, detail.value)
        }}
        value={password}
        type="text"
      />
    </FormField>
  )
}

interface Props {
  uriPath: string[]
  uriErrorPath: string[]
  usernamePath: string[]
  usernameErrorPath: string[]
  passwordPath: string[]
  passwordErrorPath: string[]
}

export const SlurmAccountingForm: React.FC<Props> = ({
  uriPath,
  uriErrorPath,
  usernamePath,
  usernameErrorPath,
  passwordPath,
  passwordErrorPath,
}) => {
  const isSlurmAccountingEnabled = useFeatureFlag('slurm_accounting')

  if (!isSlurmAccountingEnabled) return null

  return (
    <>
      <ColumnLayout columns={2}>
        <DatabaseField uriPath={uriPath} uriErrorPath={uriErrorPath} />
      </ColumnLayout>
      <ColumnLayout columns={2}>
        <UsernameField
          usernamePath={usernamePath}
          usernameErrorPath={usernameErrorPath}
        />
        <PasswordField
          passwordPath={passwordPath}
          passwordErrorPath={passwordErrorPath}
        />
      </ColumnLayout>
    </>
  )
}
