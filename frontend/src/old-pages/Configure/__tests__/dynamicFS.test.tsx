import {Store} from '@reduxjs/toolkit'
import {renderHook} from '@testing-library/react-hooks'
import {mock} from 'jest-mock-extended'
import {Provider} from 'react-redux'
import {useDynamicStorage} from '../Storage'

const mockStore = mock<Store>()

describe('Given a PCluster version', () => {
  describe("when it's >= 3.3.0", () => {
    it('should let edit or create new filesystems on an already built cluster', () => {
      mockStore.getState.mockReturnValue({
        app: {
          version: {
            full: '3.3.0',
          },
          wizard: {
            editing: true,
          },
        },
      })
      const {result} = renderHook(() => useDynamicStorage(), {
        wrapper: ({children}) => (
          <Provider store={mockStore}>{children}</Provider>
        ),
      })

      expect(result.current).toBe(true)
    })
  })
  describe("when it's < 3.3.0", () => {
    describe('when creating a cluster', () => {
      it('should let the user add or remove filesystems', () => {
        mockStore.getState.mockReturnValue({
          app: {
            version: {
              full: '3.2.0',
            },
            wizard: {
              editing: false,
            },
          },
        })
        const {result} = renderHook(() => useDynamicStorage(), {
          wrapper: ({children}) => (
            <Provider store={mockStore}>{children}</Provider>
          ),
        })

        expect(result.current).toBe(true)
      })
    })

    describe('when editing a cluster', () => {
      it('should block the user from creating or removing filesystems', () => {
        mockStore.getState.mockReturnValue({
          app: {
            version: {
              full: '3.2.0',
            },
            wizard: {
              editing: true,
            },
          },
        })
        const {result} = renderHook(() => useDynamicStorage(), {
          wrapper: ({children}) => (
            <Provider store={mockStore}>{children}</Provider>
          ),
        })

        expect(result.current).toBe(false)
      })
    })
  })
})
