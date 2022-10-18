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
import {useTranslation} from 'react-i18next'
import {
  Container,
  Input,
  FormField,
  Header,
  ColumnLayout,
} from '@awsui/components-react'
import {setState, getState, useState, clearState} from '../../store'

const slurmSettingsPath = [
  'app',
  'wizard',
  'config',
  'Scheduling',
  'SlurmSettings',
]
const errorsPath = ['app', 'wizard', 'errors', 'headNode', 'slurmSettings']

const uriPath = [...slurmSettingsPath, 'Database', 'Uri']
const usernamePath = [...slurmSettingsPath, 'Database', 'UserName']
const passwordPath = [...slurmSettingsPath, 'Database', 'PasswordSecretArn']
const uriErrorPath = [...errorsPath, 'database', 'uri']
const usernameErrorPath = [...errorsPath, 'database', 'username']
const passwordErrorPath = [...errorsPath, 'database', 'password']

function slurmAccountingValidateAndSetErrors(): boolean {
  const errorMask: Array<boolean> = [uriPath, usernamePath, passwordPath].map(
    path => slurmAccountingValidateField(getState(path)),
  )
  const errorPaths: Array<Array<string>> = [
    uriErrorPath,
    usernameErrorPath,
    passwordErrorPath,
  ]
  const errorValues: Array<string> = [
    i18next.t('wizard.headNode.slurmSettings.validation.databaseCannotBeEmpty'),
    i18next.t('wizard.headNode.slurmSettings.validation.usernameCannotBeEmpty'),
    i18next.t('wizard.headNode.slurmSettings.validation.passwordCannotBeEmpty'),
  ]

  if (errorMask.every(e => e)) {
    return true
  } else if (errorMask.every(e => !e)) {
    clearState([...slurmSettingsPath, 'Database'])
    return true
  } else {
    slurmAccountingSetErrors(errorMask, errorPaths, errorValues)
    return false
  }
}

function slurmAccountingValidateField(field: string | undefined): boolean {
  return field ? true : false
}

function slurmAccountingSetErrors(
  errorMask: Array<boolean>,
  errorPaths: Array<Array<string>>,
  errorValues: Array<string>,
) {
  errorMask.forEach((err, idx) =>
    err
      ? clearState(errorPaths[idx])
      : setState(errorPaths[idx], errorValues[idx]),
  )
}

function DatabaseField() {
  const {t} = useTranslation()
  let uri = useState(uriPath) || ''
  let uriError = useState(uriErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.database.label')}
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

function UsernameField() {
  const {t} = useTranslation()
  let username = useState(usernamePath) || ''
  let usernameError = useState(usernameErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.username.label')}
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

function PasswordField() {
  const {t} = useTranslation()
  let password = useState(passwordPath) || ''
  let passwordError = useState(passwordErrorPath) || ''

  return (
    <FormField
      label={t('wizard.headNode.slurmSettings.password.label')}
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

function SlurmSettings() {
  const {t} = useTranslation()

  return (
    <Container
      header={
        <Header variant="h2">
          {t('wizard.headNode.slurmSettings.container.title')}{' '}
          <span
            style={{fontWeight: '400', fontStyle: 'italic', fontSize: '14px'}}
          >
            - {t('wizard.headNode.slurmSettings.container.optional')}
          </span>
        </Header>
      }
    >
      <ColumnLayout columns={2}>
        <DatabaseField />
      </ColumnLayout>
      <ColumnLayout columns={2}>
        <UsernameField />
        <PasswordField />
      </ColumnLayout>
    </Container>
  )
}

export {
  SlurmSettings,
  slurmAccountingValidateAndSetErrors,
  slurmAccountingValidateField,
  slurmAccountingSetErrors,
}
