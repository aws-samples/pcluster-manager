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

import {fireEvent, render, RenderResult, waitFor} from '@testing-library/react'
import {I18nextProvider} from 'react-i18next'
import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import {ScaledownIdleTimeForm} from '../ScaledownIdleTimeForm'

i18n.use(initReactI18next).init({
  resources: {},
  lng: 'en',
})

const MockProviders = (props: any) => (
  <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
)

describe("given a component to set the Slurm's scaledown idle time", () => {
  let screen: RenderResult
  let mockOnChange: jest.Mock

  beforeEach(() => {
    mockOnChange = jest.fn()

    screen = render(
      <MockProviders>
        <ScaledownIdleTimeForm value={undefined} onChange={mockOnChange} />
      </MockProviders>,
    )
  })

  describe('when the user selects a valid value', () => {
    const mockValidValue = 5

    beforeEach(async () => {
      const field = screen.getByRole('spinbutton')
      await waitFor(() =>
        fireEvent.change(field, {target: {value: mockValidValue}}),
      )
    })

    it('should call the onChange handler with the value ', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(mockValidValue)
    })
  })

  describe('when the user selects an invalid value', () => {
    const mockInvalidValue = -1

    beforeEach(async () => {
      const field = screen.getByRole('spinbutton')
      await waitFor(() =>
        fireEvent.change(field, {target: {value: mockInvalidValue}}),
      )
    })

    it('should display the error message', () => {
      expect(
        screen.getByText(
          'wizard.headNode.slurmSettings.validation.scaledownIdleTimeLessThanOne',
        ),
      ).toBeTruthy()
    })

    it('should call the onChange handler with the invalid value ', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(mockInvalidValue)
    })
  })

  describe('when the user leaves the field empty', () => {
    const mockEmptyValue = ''

    beforeEach(async () => {
      const field = screen.getByRole('spinbutton')
      await waitFor(() =>
        fireEvent.change(field, {target: {value: mockEmptyValue}}),
      )
    })

    it('should call the onChange handler with null ', () => {
      expect(mockOnChange).toHaveBeenCalledTimes(1)
      expect(mockOnChange).toHaveBeenCalledWith(null)
    })
  })
})
