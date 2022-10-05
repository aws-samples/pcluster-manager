// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import {greaterVersionThan} from '../greaterVersionThan'

describe('given a function to compare two versions based on semver', () => {
  describe('when the major is strictly greater', () => {
    it('should return true', () => {
      expect(greaterVersionThan('3.0.0', '2.0.0')).toBe(true)
    })
  })

  describe('when the major is equal', () => {
    describe('when the minor is strictly greater', () => {
      it('should return true', () => {
        expect(greaterVersionThan('3.1.0', '3.0.0')).toBe(true)
      })
    })

    describe('when the minor is equal', () => {
      describe('when the patch is strictly greater', () => {
        it('should return true', () => {
          expect(greaterVersionThan('3.0.1', '3.0.0')).toBe(true)
        })
      })

      describe('when the patch is lesser or equal', () => {
        it('should return false', () => {
          expect(greaterVersionThan('3.0.1', '3.0.2')).toBe(false)
        })
      })
    })

    describe('when the minor is lesser or equal', () => {
      it('should return false', () => {
        expect(greaterVersionThan('3.1.0', '3.2.0')).toBe(false)
      })
    })
  })

  describe('when the major is lesser or equal', () => {
    it('should return false', () => {
      expect(greaterVersionThan('2.0.0', '3.0.0')).toBe(false)
    })
  })
})
