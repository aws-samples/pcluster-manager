import {consoleDomain} from '../store'

describe('Given a function to determine the console endpoint', () => {
  describe('when the current region is the US government one', () => {
    it('should point to the specific domain', () => {
      const domain = consoleDomain('us-gov')
      expect(domain).toBe('https://console.amazonaws-us-gov.com')
    })
  })
  describe('when the current region is NOT the US government one', () => {
    it('should point to the regional domain', () => {
      const domain = consoleDomain('eu-central-1')
      expect(domain).toBe('https://eu-central-1.console.aws.amazon.com')
    })
  })
})
