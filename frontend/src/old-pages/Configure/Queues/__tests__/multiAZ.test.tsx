import {areMultiAZSelected} from '../Queues'

describe('Given a list of subnets', () => {
  describe('when zero subnets are selected', () => {
    it('should keep EFA and Placement groups enabled', () => {
      const {multiAZ, canUseEFA, canUsePlacementGroup} = areMultiAZSelected([])
      expect(multiAZ).toBe(false)
      expect(canUseEFA).toBe(true)
      expect(canUsePlacementGroup).toBe(true)
    })
  })

  describe('when a single subnet is selected', () => {
    it('should keep EFA and Placement groups enabled', () => {
      const {multiAZ, canUseEFA, canUsePlacementGroup} = areMultiAZSelected([
        'subnet-a',
      ])
      expect(multiAZ).toBe(false)
      expect(canUseEFA).toBe(true)
      expect(canUsePlacementGroup).toBe(true)
    })
  })

  describe('when more than one subnet is selected', () => {
    it('should keep EFA and Placement groups disabled', () => {
      const {multiAZ, canUseEFA, canUsePlacementGroup} = areMultiAZSelected([
        'subnet-a',
        'subnet-b',
      ])
      expect(multiAZ).toBe(true)
      expect(canUseEFA).toBe(false)
      expect(canUsePlacementGroup).toBe(false)
    })
  })
})
