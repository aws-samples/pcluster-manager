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
} from "@awsui/components-react";

// State
import { setState, useState, getState, clearState } from '../../store'

// Components
import HelpTooltip from '../../components/HelpTooltip'
import {HelpTextInput} from './Components'
import {useTranslation} from "react-i18next";

// Constants
const errorsPath = ['app', 'wizard', 'errors', 'multiUser'];
const dsPath = ['app', 'wizard', 'config', 'DirectoryService'];

function multiUserValidate() {
  let valid = true

  const checkRequired = (key: any) => {
    const value = getState([...dsPath, key]);
    if(!value || value === '')
    {
      console.log("invalid: ", key, "setting: ", [...errorsPath, key]);
      setState([...errorsPath, key], `You must specify a value for ${key}.`);
      valid = false;
    } else {
      clearState([...errorsPath, key])
    }
  }

  checkRequired('DomainName');
  checkRequired('DomainAddr');
  checkRequired('PasswordSecretArn');
  checkRequired('DomainReadOnlyUser');

  return valid;
}


function HelpToggle({
  name,
  configKey,
  description,
  help,
  placeholder,
  defaultValue
}: any)
{
  let value = useState([...dsPath, configKey]);
  let error = useState([...errorsPath, configKey]);

  return <FormField
    label={name}
    errorText={error}
    description={description}>
    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
      <div style={{flexGrow: 1}}>
        <Toggle
          checked={value === null ? defaultValue : value}
          onChange={({detail}) => setState([...dsPath, configKey], !value)} />
      </div>
      <HelpTooltip>{help}</HelpTooltip>
    </div>
  </FormField>
}

function AdditionalSssdOptions() {
  let additionalSssdConfigsErrors = useState([...errorsPath, 'additionalSssdConfigs']);
  let additionalSssdConfigs = useState([...dsPath, 'AdditionalSssdConfigs']) || {};

  let key = useState(['app', 'wizard', 'multiUser', 'key']);
  let value = useState(['app', 'wizard', 'multiUser', 'value']);

  const addConfig = () => {
    if(!key || !value || key==='' || value ==='')
    {
      setState([...errorsPath, 'additionalSssdConfigs'], "You must specify a value for both the key and value.");
    } else {
      setState([...dsPath, 'AdditionalSssdConfigs', key || ''], value || '');
      clearState([...errorsPath, 'additionalSssdConfigs']);
    }
  }

  const removeConfig = (key: any) => {
    let config = {...additionalSssdConfigs};
    delete config[key];
    if(Object.keys(config).length === 0)
      clearState([...dsPath, 'AdditionalSssdConfigs']);
    else
      setState([...dsPath, 'AdditionalSssdConfigs'], config);
  }

  return <>
    <SpaceBetween direction="vertical" size="xs">
      <FormField
        errorText={additionalSssdConfigsErrors}
        label='Additional SSSD Options'
        description='Key-value pairs containing arbitrary SSSD parameters and values to write to the SSSD config file on cluster instances. '>
        <div style={{display: "flex", flexDirection: "row", gap: "16px"}}>
          <Input
            value={key}
            onChange={({detail}) => setState(['app', 'wizard', 'multiUser', 'key'], detail.value)} />
          <Input
            value={value}
            onChange={({detail}) => setState(['app', 'wizard', 'multiUser', 'value'], detail.value)} />
          <Button onClick={addConfig}>+ Add</Button>
        </div>
      </FormField>
      <SpaceBetween direction="vertical" size="xs">
        {Object.keys(additionalSssdConfigs).map((key, index) => <div style={{display: "flex", flexDirection: "row", gap: "16px", alignItems: "center"}}><div>{key}: {String(additionalSssdConfigs[key])}</div><Button onClick={() => removeConfig(key)}>Remove</Button></div>)}
      </SpaceBetween>
    </SpaceBetween>
  </>
}

function MultiUser() {
  const { t } = useTranslation();
  return <Container header={<Header variant="h2">Multi User Properties</Header>}>
    <SpaceBetween direction="vertical" size="xs">
      <span>
        If you don’t have an exisitng Active Directory you can create an AWS managed one following &nbsp;
        <Link
          external
          externalIconAriaLabel="Opens in a new tab"
          href={"https://docs.aws.amazon.com/parallelcluster/latest/ug/tutorials_05_multi-user-ad.html"}>this tutorial</Link>.
      </span>
      <HelpTextInput name={t("wizard.multiuser.domainName.name")} path={dsPath} errorsPath={errorsPath} configKey={'DomainName'} description={t("wizard.multiuser.domainName.description")}
                     placeholder={'dc=corp,dc=pcluster,dc=com'} help={t("wizard.multiuser.domainName.help")} validationFunction={multiUserValidate}/>
      <HelpTextInput name={t("wizard.multiuser.domainAddress.name")} path={dsPath} errorsPath={errorsPath} configKey={'DomainAddr'} description={t("wizard.multiuser.domainAddress.description")}
                     placeholder={'ldaps://corp.pcluster.com'} help={t("wizard.multiuser.domainAddress.help")} validationFunction={multiUserValidate}/>
      <HelpTextInput name={t("wizard.multiuser.passwordSecretArn.name")} path={dsPath} errorsPath={errorsPath} configKey={'PasswordSecretArn'} description={t("wizard.multiuser.passwordSecretArn.description")}
                     placeholder={'arn:aws:secretsmanager:region:000000000000:secret:secret_name'} help={t("wizard.multiuser.passwordSecretArn.help")} validationFunction={multiUserValidate} />
      <HelpTextInput name={t("wizard.multiuser.domainReadOnlyUser.name")} path={dsPath} errorsPath={errorsPath} configKey={'DomainReadOnlyUser'} description={t("wizard.multiuser.domainReadOnlyUser.description")}
                     placeholder={'cn=ReadOnlyUser,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'} help={t("wizard.multiuser.domainReadOnlyUser.help")} validationFunction={multiUserValidate} />
      <ExpandableSection header="Advanced options">
        <SpaceBetween direction="vertical" size="xs">
          <HelpTextInput name={t("wizard.multiuser.caCertificate.name")} path={dsPath} errorsPath={errorsPath} configKey={'LdapTlsCaCert'} description={t("wizard.multiuser.caCertificate.description")}
                         placeholder={'/path/to/certificate.pem'} help={t("wizard.multiuser.caCertificate.help")} validationFunction={multiUserValidate} />
          <HelpTextInput name={t("wizard.multiuser.requireCertificate.name")} path={dsPath} errorsPath={errorsPath} configKey={'LdapTlsReqCert'} description={t("wizard.multiuser.requireCertificate.description")}
                         placeholder={'hard'} help={t("wizard.multiuser.requireCertificate.help")} />
          <HelpTextInput name={t("wizard.multiuser.LDAPAccessFilter.name")} path={dsPath} errorsPath={errorsPath} configKey={'LdapAccessFilter'} description={t("wizard.multiuser.LDAPAccessFilter.description")}
                         placeholder={'memberOf=cn=TeamOne,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'} help={t("wizard.multiuser.LDAPAccessFilter.help")} validationFunction={multiUserValidate} />
          <HelpToggle name={t("wizard.multiuser.generateSSHKeys.name")} path={dsPath} errorsPath={errorsPath} configKey={'GenerateSshKeysForUsers'} description={t("wizard.multiuser.generateSSHKeys.description")}
                      help={t("wizard.multiuser.generateSSHKeys.help")}
                      defaultValue={true} validationFunction={multiUserValidate}/>
          <AdditionalSssdOptions />
        </SpaceBetween>
      </ExpandableSection>
    </SpaceBetween>
  </Container>
}

export { MultiUser, multiUserValidate }
