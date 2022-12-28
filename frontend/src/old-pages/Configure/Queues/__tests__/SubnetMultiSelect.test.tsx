import {render} from '@testing-library/react'
import {Subnet} from '../queues.types'
import {SubnetMultiSelect} from '../SubnetMultiSelect'
import wrapper from '@cloudscape-design/components/test-utils/dom'
import {Provider} from 'react-redux'
import {mock} from 'jest-mock-extended'
import {Store} from '@reduxjs/toolkit'

const mockSelectedSubnets: string[] = ['subnet-1']
const mockSubnets: Subnet[] = [
  {
    SubnetId: 'subnet-1',
    AvailabilityZone: 'AZ-a',
    AvailabilityZoneId: 'AZ-a-id',
    VpcId: 'VPC-1',
  },
  {
    SubnetId: 'subnet-2',
    AvailabilityZone: 'AZ-b',
    AvailabilityZoneId: 'AZ-b-id',
    VpcId: 'VPC-1',
  },
  {
    SubnetId: 'subnet-3',
    AvailabilityZone: 'AZ-c',
    AvailabilityZoneId: 'AZ-c-id',
    VpcId: 'VPC-2',
  },
]

jest.mock('../../../../store', () => {
  const originalModule = jest.requireActual('../../../../store')

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getState: jest.fn(),
  }
})

const mockStore = mock<Store>()

describe('given a component to select multiple subnets in a VPC', () => {
  describe('when a VPC has been specified', () => {
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        app: {
          wizard: {
            vpc: 'VPC-1',
          },
        },
        aws: {
          subnets: mockSubnets,
        },
      })
    })

    it('should show as options only the subnets in that VPC', () => {
      const mockedOnChange = jest.fn()
      const {container} = render(
        <Provider store={mockStore}>
          <SubnetMultiSelect
            value={mockSelectedSubnets}
            onChange={mockedOnChange}
          />
        </Provider>,
      )

      const multiSelect = wrapper(container).findMultiselect()!
      expect(multiSelect).toBeDefined()
      multiSelect.openDropdown()
      expect(multiSelect.findDropdown()?.findOptions().length).toBe(2)
      expect(
        multiSelect.findDropdown()?.findOptionByValue('subnet-1'),
      ).toBeTruthy()
      expect(
        multiSelect.findDropdown()?.findOptionByValue('subnet-2'),
      ).toBeTruthy()
    })
  })
})
