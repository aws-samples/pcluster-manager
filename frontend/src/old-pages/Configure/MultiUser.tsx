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

// UI Elements
import {
  Button,
  Container,
  ExpandableSection,
  FormField,
  Header,
  Input,
  Link,
  SpaceBetween,
  Toggle,
} from '@cloudscape-design/components'

// State
import {setState, useState, getState, clearState} from '../../store'

// Components
import {HelpTextInput} from './Components'
import {useTranslation} from 'react-i18next'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'
import InfoLink from '../../components/InfoLink'

// Constants
const errorsPath = ['app', 'wizard', 'errors', 'multiUser']
const dsPath = ['app', 'wizard', 'config', 'DirectoryService']

function multiUserValidate() {
  let valid = true

  const checkRequired = (key: any) => {
    const value = getState([...dsPath, key])
    if (!value || value === '') {
      console.log('invalid: ', key, 'setting: ', [...errorsPath, key])
      setState([...errorsPath, key], `You must specify a value for ${key}.`)
      valid = false
    } else {
      clearState([...errorsPath, key])
    }
  }

  checkRequired('DomainName')
  checkRequired('DomainAddr')
  checkRequired('PasswordSecretArn')
  checkRequired('DomainReadOnlyUser')

  return valid
}

function HelpToggle({name, configKey, description, help, defaultValue}: any) {
  let value = useState([...dsPath, configKey])
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
          <Toggle
            checked={value === null ? defaultValue : value}
            onChange={({detail}) => setState([...dsPath, configKey], !value)}
          />
        </div>
      </div>
    </FormField>
  )
}

function AdditionalSssdOptions() {
  let additionalSssdConfigsErrors = useState([
    ...errorsPath,
    'additionalSssdConfigs',
  ])
  let additionalSssdConfigs =
    useState([...dsPath, 'AdditionalSssdConfigs']) || {}

  let key = useState(['app', 'wizard', 'multiUser', 'key'])
  let value = useState(['app', 'wizard', 'multiUser', 'value'])

  const addConfig = () => {
    if (!key || !value || key === '' || value === '') {
      setState(
        [...errorsPath, 'additionalSssdConfigs'],
        'You must specify a value for both the key and value.',
      )
    } else {
      setState([...dsPath, 'AdditionalSssdConfigs', key || ''], value || '')
      clearState([...errorsPath, 'additionalSssdConfigs'])
    }
  }

  const removeConfig = (key: any) => {
    let config = {...additionalSssdConfigs}
    delete config[key]
    if (Object.keys(config).length === 0)
      clearState([...dsPath, 'AdditionalSssdConfigs'])
    else setState([...dsPath, 'AdditionalSssdConfigs'], config)
  }

  return (
    <>
      <SpaceBetween direction="vertical" size="xs">
        <FormField
          errorText={additionalSssdConfigsErrors}
          label="Additional SSSD Options"
          description="Key-value pairs containing arbitrary SSSD parameters and values to write to the SSSD config file on cluster instances. "
        >
          <div style={{display: 'flex', flexDirection: 'row', gap: '16px'}}>
            <Input
              value={key}
              onChange={({detail}) =>
                setState(['app', 'wizard', 'multiUser', 'key'], detail.value)
              }
            />
            <Input
              value={value}
              onChange={({detail}) =>
                setState(['app', 'wizard', 'multiUser', 'value'], detail.value)
              }
            />
            <Button onClick={addConfig}>+ Add</Button>
          </div>
        </FormField>
        <SpaceBetween direction="vertical" size="xs">
          {Object.keys(additionalSssdConfigs).map((key, index) => (
            <div
              key={key}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                {key}: {String(additionalSssdConfigs[key])}
              </div>
              <Button onClick={() => removeConfig(key)}>Remove</Button>
            </div>
          ))}
        </SpaceBetween>
      </SpaceBetween>
    </>
  )
}

function MultiUser() {
  const {t} = useTranslation()
  return (
    <Container>
      <SpaceBetween direction="vertical" size="xs">
        <span>
          If you don’t have an existing Active Directory you can create an AWS
          managed one following &nbsp;
          <Link
            external
            externalIconAriaLabel="Opens in a new tab"
            href={
              'https://docs.aws.amazon.com/parallelcluster/latest/ug/tutorials_05_multi-user-ad.html'
            }
          >
            this tutorial
          </Link>
          .
        </span>
        <HelpTextInput
          name={t('wizard.multiUser.domainName.name')}
          path={dsPath}
          errorsPath={errorsPath}
          configKey={'DomainName'}
          description={t('wizard.multiUser.domainName.description')}
          placeholder={'dc=corp,dc=pcluster,dc=com'}
          help={t('wizard.multiUser.domainName.help')}
          onChange={({detail}) => {
            setState([...dsPath, 'DomainName'], detail.value)
            multiUserValidate()
          }}
        />
        <HelpTextInput
          name={t('wizard.multiUser.domainAddress.name')}
          path={dsPath}
          errorsPath={errorsPath}
          configKey={'DomainAddr'}
          description={t('wizard.multiUser.domainAddress.description')}
          placeholder={'ldaps://corp.pcluster.com'}
          help={t('wizard.multiUser.domainAddress.help')}
          onChange={({detail}) => {
            setState([...dsPath, 'DomainAddr'], detail.value)
            multiUserValidate()
          }}
        />
        <HelpTextInput
          name={t('wizard.multiUser.passwordSecretArn.name')}
          path={dsPath}
          errorsPath={errorsPath}
          configKey={'PasswordSecretArn'}
          description={t('wizard.multiUser.passwordSecretArn.description')}
          placeholder={
            'arn:aws:secretsmanager:region:000000000000:secret:secret_name'
          }
          help={t('wizard.multiUser.passwordSecretArn.help')}
          onChange={({detail}) => {
            setState([...dsPath, 'PasswordSecretArn'], detail.value)
            multiUserValidate()
          }}
        />
        <HelpTextInput
          name={t('wizard.multiUser.domainReadOnlyUser.name')}
          path={dsPath}
          errorsPath={errorsPath}
          configKey={'DomainReadOnlyUser'}
          description={t('wizard.multiUser.domainReadOnlyUser.description')}
          placeholder={
            'cn=ReadOnlyUser,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'
          }
          help={t('wizard.multiUser.domainReadOnlyUser.help')}
          onChange={({detail}) => {
            setState([...dsPath, 'DomainReadOnlyUser'], detail.value)
            multiUserValidate()
          }}
        />
        <ExpandableSection header="Advanced options">
          <SpaceBetween direction="vertical" size="xs">
            <HelpTextInput
              name={t('wizard.multiUser.caCertificate.name')}
              path={dsPath}
              errorsPath={errorsPath}
              configKey={'LdapTlsCaCert'}
              description={t('wizard.multiUser.caCertificate.description')}
              placeholder={'/path/to/certificate.pem'}
              help={t('wizard.multiUser.caCertificate.help')}
              onChange={({detail}) => {
                setState([...dsPath, 'LdapTlsCaCert'], detail.value)
                multiUserValidate()
              }}
            />
            <HelpTextInput
              name={t('wizard.multiUser.requireCertificate.name')}
              path={dsPath}
              errorsPath={errorsPath}
              configKey={'LdapTlsReqCert'}
              description={t('wizard.multiUser.requireCertificate.description')}
              placeholder={'hard'}
              help={t('wizard.multiUser.requireCertificate.help')}
              onChange={({detail}) => {
                setState([...dsPath, 'LdapTlsReqCert'], detail.value)
                multiUserValidate()
              }}
            />
            <HelpTextInput
              name={t('wizard.multiUser.LDAPAccessFilter.name')}
              path={dsPath}
              errorsPath={errorsPath}
              configKey={'LdapAccessFilter'}
              description={t('wizard.multiUser.LDAPAccessFilter.description')}
              placeholder={
                'memberOf=cn=TeamOne,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'
              }
              help={t('wizard.multiUser.LDAPAccessFilter.help')}
              onChange={({detail}) => {
                setState([...dsPath, 'LdapAccessFilter'], detail.value)
                multiUserValidate()
              }}
            />
            <HelpToggle
              name={t('wizard.multiUser.generateSSHKeys.name')}
              configKey={'GenerateSshKeysForUsers'}
              description={t('wizard.multiUser.generateSSHKeys.description')}
              help={t('wizard.multiUser.generateSSHKeys.help')}
              defaultValue={true}
            />
            <AdditionalSssdOptions />
          </SpaceBetween>
        </ExpandableSection>
      </SpaceBetween>
    </Container>
  )
}

export {MultiUser, multiUserValidate}
