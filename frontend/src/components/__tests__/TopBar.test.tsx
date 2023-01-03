import {NavigateFunction} from 'react-router-dom'
import {clearClusterOnRegionChange, regions} from '../TopBar'

describe('Given a TopBar component', () => {
  let navigate: NavigateFunction
  beforeEach(() => {
    navigate = jest.fn()
  })

  describe('when changing the region', () => {
    describe('when inside the clusters section', () => {
      it('should clear the selected cluster', () => {
        clearClusterOnRegionChange('/clusters/selected-cluster', navigate)

        expect(navigate).toHaveBeenCalledWith('/clusters')
      })
    })
    describe('when inside another section', () => {
      it('should not do anything', () => {
        clearClusterOnRegionChange('/custom-images', navigate)

        expect(navigate).not.toHaveBeenCalled()
      })
    })
  })
})

describe('Given a a function that returns a list of regions to be displayed in the TopBar dropdown', () => {
  const supportedRegions = [
    [
      ['US East (N. Virginia)', 'us-east-1'],
      ['US East (Ohio)', 'us-east-2'],
      ['US West (N. California)', 'us-west-1'],
      ['US West (Oregon)', 'us-west-2'],
    ],
    [
      ['Asia Pacific (Mumbai)', 'ap-south-1'],
      ['Asia Pacific (Seoul)', 'ap-northeast-2'],
      ['Asia Pacific (Singapore)', 'ap-southeast-1'],
      ['Asia Pacific (Sydney)', 'ap-southeast-2'],
      ['Asia Pacific (Tokyo)', 'ap-northeast-1'],
    ],
    [['Canada (Central)', 'ca-central-1']],
    [
      ['Europe (Frankfurt)', 'eu-central-1'],
      ['Europe (Ireland)', 'eu-west-1'],
      ['Europe (London)', 'eu-west-2'],
      ['Europe (Paris)', 'eu-west-3'],
      ['Europe (Stockholm)', 'eu-north-1'],
    ],
    [['South America (São Paulo)', 'sa-east-1']],
  ]

  describe('when invoking the function with a supported region selected', () => {
    it('should return the list of supported regions', () => {
      const displayedRegions = regions('eu-west-1')
      expect(displayedRegions).toEqual(supportedRegions)
    })
  })

  describe('when invoking the function with an opt-in region selected', () => {
    it('should return the list of supported regions prepended with the opt-in region', () => {
      const displayedRegions = regions('eu-south-1')
      const expectedRegions = [
        [['Europe (Milan)', 'eu-south-1']],
        ...supportedRegions,
      ]
      expect(displayedRegions).toEqual(expectedRegions)
    })
  })

  describe('when invoking the function with a region not in supported nor in opt-in list', () => {
    it('should return the list of supported regions', () => {
      const displayedRegions = regions('not-supported')
      expect(displayedRegions).toEqual(supportedRegions)
    })
  })
})
