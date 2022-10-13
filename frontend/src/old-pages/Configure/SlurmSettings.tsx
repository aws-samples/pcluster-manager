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

function slurmAccountingValidate(): boolean {
  const slurmAccountingFields: Array<[Array<string>, Array<string>, string]> = [
    [
      uriPath,
      uriErrorPath,
      i18next.t(
        'wizard.headNode.slurmSettings.validation.databaseCannotBeEmpty',
      ),
    ],
    [
      usernamePath,
      usernameErrorPath,
      i18next.t(
        'wizard.headNode.slurmSettings.validation.usernameCannotBeEmpty',
      ),
    ],
    [
      passwordPath,
      passwordErrorPath,
      i18next.t(
        'wizard.headNode.slurmSettings.validation.passwordCannotBeEmpty',
      ),
    ],
  ]

  if (
    slurmAccountingFields.every(field => getState(field[0])) ||
    slurmAccountingFields.every(field => !getState(field[0]))
  ) {
    slurmAccountingFields.forEach(field => clearState(field[1]))
    return true
  } else {
    slurmAccountingFields.forEach(field =>
      getState(field[0]) ? clearState(field[1]) : setState(field[1], field[2]),
    )
    return false
  }
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
      {/* FIXME add regex validation */}
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
        type="password"
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
          Slurm Settings{' '}
          <span
            style={{fontWeight: '400', fontStyle: 'italic', fontSize: '14px'}}
          >
            - optional
          </span>
        </Header>
      }
    >
      <ColumnLayout columns={2}>
        <DatabaseField />
        <div />
        <UsernameField />
        <PasswordField />
      </ColumnLayout>
    </Container>
  )
}

export {SlurmSettings, slurmAccountingValidate}
