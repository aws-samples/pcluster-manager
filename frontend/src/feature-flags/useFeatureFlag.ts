// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {useState} from '../store'
import {featureFlagsProvider} from './featureFlagsProvider'
import {AvailableFeature} from './types'

export function useFeatureFlag(feature: AvailableFeature): boolean {
  const version = useState(['app', 'version', 'full'])
  return isFeatureEnabled(version, feature)
}

export function isFeatureEnabled(
  version: string,
  feature: AvailableFeature,
): boolean {
  const features = new Set(featureFlagsProvider(version))

  return features.has(feature)
}
