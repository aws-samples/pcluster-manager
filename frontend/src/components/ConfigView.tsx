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
//
import * as React from 'react'

// UI Elements
import {CodeEditor} from '@cloudscape-design/components'

export default function ConfigView({config, pending, onChange}: any) {
  const [preferences, setPreferences] = React.useState({theme: 'textmate'})
  return (
    <CodeEditor
      ace={window.ace}
      language="yaml"
      value={config || ''}
      onChange={e => {}}
      onDelayedChange={onChange}
      // @ts-expect-error TS(2322) FIXME: Type '{ theme: string; }' is not assignable to typ... Remove this comment to see the full error message
      preferences={preferences}
      onPreferencesChange={e => setPreferences(e.detail)}
      onValidate={e => {}}
      loading={pending ? true : false}
      i18nStrings={{
        loadingState: 'Loading code editor',
        errorState: 'There was an error loading the code editor.',
        errorStateRecovery: 'Retry',
        editorGroupAriaLabel: 'Code editor',
        statusBarGroupAriaLabel: 'Status bar',
        cursorPosition: (row, column) => `Ln ${row}, Col ${column}`,
        errorsTab: 'Errors',
        warningsTab: 'Warnings',
        preferencesButtonAriaLabel: 'Preferences',
        paneCloseButtonAriaLabel: 'Close',
        preferencesModalHeader: 'Preferences',
        preferencesModalCancel: 'Cancel',
        preferencesModalConfirm: 'Confirm',
        preferencesModalWrapLines: 'Wrap lines',
        preferencesModalTheme: 'Theme',
        preferencesModalLightThemes: 'Light themes',
        preferencesModalDarkThemes: 'Dark themes',
      }}
    />
  )
}
