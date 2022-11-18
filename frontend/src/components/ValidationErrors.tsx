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

// UI Elements
import {Trans} from 'react-i18next'
import {Icon} from '@cloudscape-design/components'

export default function ValidationErrors({errors}: any) {
  const colorMap = (level: string) => {
    return {
      ERROR: 'red',
      WARNING: 'orange',
      SUCCESS: 'green',
    }[level]
  }

  const colored = (text: any, success: any) => (
    <div
      style={{
        color: success ? 'green' : 'red',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '4px 0',
      }}
    >
      <Icon name={success ? 'status-positive' : 'status-negative'} />
      <div style={{display: 'inline-block', paddingLeft: '10px'}}> {text}</div>
    </div>
  )

  var success = errors.message && errors.message.includes('succeeded')
  var configErrors =
    errors.configurationValidationErrors || errors.validationMessages
  var updateErrors = errors.updateValidationErrors
  return (
    <div>
      {colored(errors.message, success)}
      {configErrors && (
        <div className="validation-errors">
          <Trans i18nKey="components.ValidationErrors.validation" />
          {errors.configurationValidationErrors ? (
            <Trans i18nKey="components.ValidationErrors.errors" />
          ) : (
            <Trans i18nKey="components.ValidationErrors.warnings" />
          )}
          :
          {configErrors.map((error: any, i: any) => (
            <div
              style={{color: colorMap(error.level)}}
              key={i}
            >{`${error.type}: ${error.message}`}</div>
          ))}
        </div>
      )}
      {updateErrors && (
        <div className="validation-errors">
          <Trans i18nKey="components.ValidationErrors.update" />
          <Trans i18nKey="components.ValidationErrors.errors" />:
          {updateErrors.map((error: any, i: any) => (
            <div
              style={{color: colorMap(error.level)}}
              key={i}
            >{`${error.message}`}</div>
          ))}
        </div>
      )}
    </div>
  )
}
