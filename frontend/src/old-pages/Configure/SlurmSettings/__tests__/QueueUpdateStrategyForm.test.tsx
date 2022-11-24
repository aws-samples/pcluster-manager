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

import wrapper from '@cloudscape-design/components/test-utils/dom'
import {render, RenderResult} from '@testing-library/react'
import i18n from 'i18next'
import {I18nextProvider, initReactI18next} from 'react-i18next'
import {QueueUpdateStrategyForm} from '../QueueUpdateStrategyForm'

i18n.use(initReactI18next).init({
  resources: {},
  lng: 'en',
})

const MockProviders = (props: any) => (
  <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
)

const mockUseFeatureFlag = jest.fn()

jest.mock('../../../../feature-flags/useFeatureFlag', () => ({
  useFeatureFlag: () => mockUseFeatureFlag(),
}))

describe("given a component to set the Slurm's queue update strategy", () => {
  let screen: RenderResult
  let mockOnChange: jest.Mock

  describe('when the slurm_queue_update_strategy flag is not set', () => {
    beforeEach(() => {
      mockOnChange = jest.fn()
      mockUseFeatureFlag.mockReturnValueOnce(false)

      screen = render(
        <MockProviders>
          <QueueUpdateStrategyForm value={''} onChange={mockOnChange} />
        </MockProviders>,
      )
    })

    it('should not render anything', () => {
      expect(
        screen.queryByLabelText(
          'wizard.headNode.slurmSettings.queueUpdateStrategy.label',
        ),
      ).toBe(null)
    })
  })

  describe('when the slurm_queue_update_strategy flag is set', () => {
    beforeEach(() => {
      mockOnChange = jest.fn()
      mockUseFeatureFlag.mockReturnValueOnce(true)

      screen = render(
        <MockProviders>
          <QueueUpdateStrategyForm value={''} onChange={mockOnChange} />
        </MockProviders>,
      )
    })

    describe('when the user selects a value', () => {
      const mockSelectedValue = 'COMPUTE_FLEET_STOP'

      beforeEach(async () => {
        const selectComponent = wrapper(screen.container).findSelect()!
        selectComponent.openDropdown()
        selectComponent.selectOptionByValue(mockSelectedValue)
      })

      it('should call the onChange handler with the value ', () => {
        expect(mockOnChange).toHaveBeenCalledTimes(1)
        expect(mockOnChange).toHaveBeenCalledWith(mockSelectedValue)
      })
    })
  })
})
