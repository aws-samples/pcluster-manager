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
  ExpandableSection,
  ColumnLayout,
  FormField,
  Link,
  SpaceBetween,
  Input,
  Toggle,
} from "@awsui/components-react";

// State
import { setState, useState, getState, clearState } from '../../store'

// Components
import HelpTooltip from '../../components/HelpTooltip'

// Constants
const errorsPath = ['app', 'wizard', 'errors', 'multiUser'];

function multiUserValidate() {
  let valid = true
  let dsPath = ['app', 'wizard', 'config', 'DirectoryService'];

  const checkRequired = (key) => {
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

function HelpTextInput({name, configKey, description, help, placeholder})
{
  //let editing = useState(['app', 'wizard', 'editing']);
  let dsPath = ['app', 'wizard', 'config', 'DirectoryService'];
  let value = useState([...dsPath, configKey]);
  let error = useState([...errorsPath, configKey]);

  return <FormField
    label={name}
    errorText={error}
    description={description}>
    <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between"}}>
      <div style={{flexGrow: 1}}>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={({detail}) => {setState([...dsPath, configKey], detail.value); multiUserValidate();}} />
      </div>
      <HelpTooltip>{help}</HelpTooltip>
    </div>
  </FormField>
}

function HelpToggle({name, configKey, description, help, placeholder, defaultValue})
{
  //let editing = useState(['app', 'wizard', 'editing']);
  let dsPath = ['app', 'wizard', 'config', 'DirectoryService'];
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
  let dsPath = ['app', 'wizard', 'config', 'DirectoryService'];
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

  const removeConfig = (key) => {
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
  return <>
    <SpaceBetween direction="vertical" size="xs">
      <span>
        If you don’t have an exisitng Active Directory you can create an AWS managed one following &nbsp;
        <Link
          external
          externalIconAriaLabel="Opens in a new tab"
          href={"https://docs.aws.amazon.com/parallelcluster/latest/ug/tutorials_05_multi-user-ad.html"}>this tutorial</Link>.
      </span>
      <ColumnLayout columns={2} borders="vertical">
        <HelpTextInput name={'Domain Name*'} configKey={'DomainName'} description={'The Active Directory (AD) domain that you use for identity information.'}
          placeholder={'dc=corp,dc=pcluster,dc=com'} help={'This property corresponds to the sssd-ldap parameter that\'s called ldap_search_base.'} />
        <HelpTextInput name={'Domain Address*'} configKey={'DomainAddr'} description={'The URI or URIs that point to the AD domain controller that\'s used as the LDAP server.'}
          placeholder={'ldaps://corp.pcluster.com'} help={'The URI corresponds to the sssd-ldap parameter that\'s called ldap_uri. The value can be a comma separated string of URIs. To use LDAP, you must add ldap:// to the beginning of the each URI.'} />
        <HelpTextInput name={'Password Secret ARN*'} configKey={'PasswordSecretArn'} description={'The URI or URIs that point to the AD domain controller that\'s used as the LDAP server.'}
          placeholder={'arn:aws:secretsmanager:region:000000000000:secret:secret_name'} help={'The URI corresponds to the sssd-ldap parameter that\'s called ldap_uri. The value can be a comma separated string of URIs. To use LDAP, you must add ldap:// to the beginning of the each URI.'} />
        <HelpTextInput name={'Domain Read Only User*'} configKey={'DomainReadOnlyUser'} description={'The identity that\'s used to query the AD domain for identity information when authenticating cluster user logins.'}
          placeholder={'cn=ReadOnlyUser,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'} help={'It corresponds to sssd-ldap parameter that\'s called ldap_default_bind_dn. Use your AD identity information for this value.'} />
      </ColumnLayout>
      <ExpandableSection header="Advanced options">
        <SpaceBetween direction="vertical" size="xs">
          <ColumnLayout columns={2} borders="vertical">
            <HelpTextInput name={'CA Certificate'} configKey={'LdapTlsCaCert'} description={'The absolute path to a certificates bundle containing the certificates for every certification authority in the certification chain that issued a certificate for the domain controllers.'}
              placeholder={'/path/to/certificate.pem'} help={'It corresponds to the sssd-ldap parameter that\'s called ldap_tls_cacert.'} />
            <HelpTextInput name={'Require Certificate'} configKey={'LdapTlsReqCert'} description={'Specifies what checks to perform on server certificates in a TLS session.'}
              placeholder={'hard'} help={'It corresponds to sssd-ldap parameter that\'s called ldap_tls_reqcert.'} />
            <HelpTextInput name={'LDAP Access Filter'} configKey={'LdapAccessFilter'} description={'Specifies a filter to limit LDAP queries to a subset of the directory that\'s being queried.'}
              placeholder={'memberOf=cn=TeamOne,ou=Users,ou=CORP,dc=corp,dc=pcluster,dc=com'} help={'This property corresponds to the sssd-ldap parameter that\'s called ldap_access_filter. You can use it to limit queries to an AD that supports a large number of users.'} />
            <HelpToggle name={'Generate SSH Keys'} configKey={'GenerateSshKeysForUsers'} description={'Defines whether AWS ParallelCluster generates SSH key pairs for cluster users after they log in to the head node for the first time.'}
              help={' The key pair is saved to the user home directory at /home/username/.ssh/. Users can use the SSH key pair for subsequent logins to the cluster head node and compute nodes. With AWS ParallelCluster, logins to cluster compute nodes are disabled by design. If a user hasn\'t logged into the head node, SSH keys aren\'t generated and the user won\'t be able to log in to compute nodes.'}
              defaultValue={true}/>
          </ColumnLayout>
          <AdditionalSssdOptions />
        </SpaceBetween>
      </ExpandableSection>
    </SpaceBetween>
  </>
}

export { MultiUser, multiUserValidate }
