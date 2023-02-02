import {describe} from '@jest/globals'
import {itemToOption} from '../Cluster'

describe('Given a selection item', () => {
  describe('when the item is a string', () => {
    it('should return a valid SelectProps.Option', () => {
      const item = 'option-value'
      const expectedOption = {label: 'option-value', value: 'option-value'}

      const option = itemToOption(item)

      expect(option).toEqual(expectedOption)
    })
  })

  describe('when the item is a tuple of 2 strings', () => {
    it('should return a valid SelectProps.Option', () => {
      const item = ['option-value', 'option-label'] as [string, string]
      const expectedOption = {label: 'option-label', value: 'option-value'}

      const option = itemToOption(item)

      expect(option).toEqual(expectedOption)
    })
  })

  describe('when the item is null', () => {
    const item = null

    it('should return null', () => {
      const option = itemToOption(item)
      expect(option).toBeNull()
    })
  })
})
