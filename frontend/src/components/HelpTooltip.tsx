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

// UI Elements
import {Icon, Popover} from '@cloudscape-design/components'

export default function HelpTooltip({children}: any) {
  return (
    <span style={{paddingLeft: '8px', display: 'inline-block'}}>
      <Popover
        dismissButton={false}
        position="right"
        size="medium"
        content={children}
      >
        <Icon name="status-info" size="small" />
      </Popover>
    </span>
  )
}
