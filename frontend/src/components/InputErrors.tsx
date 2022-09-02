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
import {SpaceBetween} from '@awsui/components-react'

// UI Elements
export default function InputErrors({errors}: any) {
  return (
    errors && (
      <div className="input-errors" style={{color: 'red'}}>
        <SpaceBetween direction="vertical" size="xs">
          {errors.map((error: any, i: any) => (
            <div className="error" key={i}>
              * {error}
            </div>
          ))}
        </SpaceBetween>
      </div>
    )
  )
}
