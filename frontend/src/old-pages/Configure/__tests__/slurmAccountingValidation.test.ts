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

import {
  slurmAccountingValidateField,
  slurmAccountingSetErrors,
} from '../SlurmSettings'

const mockSetState = jest.fn()
const mockClearState = jest.fn()

jest.mock('../../../store', () => ({
  ...(jest.requireActual('../../../store') as any),
  setState: (...args: unknown[]) => mockSetState(...args),
  clearState: (...args: unknown[]) => mockClearState(...args),
}))

describe('Given a function to validate a Slurm Accounting field', () => {
  describe('if a field is not empty or undefined', () => {
    it('should return true', () => {
      expect(slurmAccountingValidateField('some-uri')).toBeTruthy()
    })
  })
  describe('if a field is empty', () => {
    it('should return false', () => {
      expect(slurmAccountingValidateField('')).toBeFalsy()
    })
  })
  describe('if a field is undefined', () => {
    it('should return false', () => {
      expect(slurmAccountingValidateField(undefined)).toBeFalsy()
    })
  })
})

describe('Given a function to set errors on Slurm Accouting fields', () => {
  const errorPaths = [
    ['uriErrorPath'],
    ['usernameErrorPath'],
    ['passwordErrorPath'],
  ]
  const errorValues = [
    'uriErrorValue',
    'usernameErrorValue',
    'passwordErrorValue',
  ]

  beforeEach(() => {
    mockClearState.mockReset()
    mockSetState.mockReset()
  })

  describe('if uri field is valid, and username and password are not valid', () => {
    it('should clean uri error and set username and password errors', () => {
      slurmAccountingSetErrors([true, false, false], errorPaths, errorValues)
      expect(mockClearState).toHaveBeenCalledTimes(1)
      expect(mockClearState).toHaveBeenCalledWith(['uriErrorPath'])
      expect(mockSetState).toHaveBeenCalledTimes(2)
      expect(mockSetState).toHaveBeenCalledWith(
        ['usernameErrorPath'],
        'usernameErrorValue',
      )
      expect(mockSetState).toHaveBeenCalledWith(
        ['passwordErrorPath'],
        'passwordErrorValue',
      )
    })
  })

  describe('if uri and password fields are valid, and username is not valid', () => {
    it('should clean uri password errors and set username error', () => {
      slurmAccountingSetErrors([true, false, true], errorPaths, errorValues)
      expect(mockClearState).toHaveBeenCalledTimes(2)
      expect(mockClearState).toHaveBeenCalledWith(['uriErrorPath'])
      expect(mockClearState).toHaveBeenCalledWith(['passwordErrorPath'])
      expect(mockSetState).toHaveBeenCalledTimes(1)
      expect(mockSetState).toHaveBeenCalledWith(
        ['usernameErrorPath'],
        'usernameErrorValue',
      )
    })
  })

  describe('if all fields are valid', () => {
    it('should clean errors on every field', () => {
      slurmAccountingSetErrors([true, true, true], errorPaths, errorValues)
      expect(mockClearState).toHaveBeenCalledTimes(3)
      expect(mockClearState).toHaveBeenCalledWith(['uriErrorPath'])
      expect(mockClearState).toHaveBeenCalledWith(['usernameErrorPath'])
      expect(mockClearState).toHaveBeenCalledWith(['passwordErrorPath'])
    })
  })
})
