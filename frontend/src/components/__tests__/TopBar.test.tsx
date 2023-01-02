import {NavigateFunction} from 'react-router-dom'
import {clearClusterOnRegionChange} from '../TopBar'

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
