// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {renderHook} from '@testing-library/react-hooks'
import {useFeatureFlag} from '../useFeatureFlag'

const mockUseState = jest.fn()

jest.mock('../../store', () => ({
  ...(jest.requireActual('../../store') as any),
  useState: (...args: unknown[]) => mockUseState(...args),
}))

describe('given a hook to test whether a feature flag is active', () => {
  describe('when the feature is active', () => {
    beforeEach(() => {
      mockUseState.mockReturnValue('3.2.0')
    })

    it('should return true', () => {
      const {result} = renderHook(() => useFeatureFlag('fsx_ontap'))
      expect(result.current).toBe(true)
    })
  })

  describe('when the feature is not active', () => {
    beforeEach(() => {
      mockUseState.mockReturnValue('3.1.0')
    })

    it('should return false', () => {
      const {result} = renderHook(() => useFeatureFlag('fsx_ontap'))
      expect(result.current).toBe(false)
    })
  })
})
