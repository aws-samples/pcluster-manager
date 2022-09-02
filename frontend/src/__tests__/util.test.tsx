import {clamp} from '../util'

describe('Given a function to clamp a number using an option step discretization', () => {
  describe('when the input is below the minimum', () => {
    it('should be set to the minimum', () => {
      const result = clamp(1, 20, 200)
      expect(result).toBe(20)
    })
  })
  describe('when the input is equal to the minimum', () => {
    it('should be set to the minimum', () => {
      const result = clamp(20, 20, 200)
      expect(result).toBe(20)
    })
  })
  describe('when the input is above the maximum', () => {
    it('should be set to the maximum', () => {
      const result = clamp(201, 20, 200)
      expect(result).toBe(200)
    })
  })
  describe('when the input is equal to the maximum', () => {
    it('should be set to the maximum', () => {
      const result = clamp(200, 20, 200)
      expect(result).toBe(200)
    })
  })
  describe('when the input is not at the step size', () => {
    it('should be set to a multiple of the step size', () => {
      const result = clamp(21, 20, 200, 20)
      expect(result).toBe(20)
    })
  })
})
