import {renderHook} from '@testing-library/react-hooks'
import {useClusterPoll} from '../useClusterPoll'

jest.mock('../../model', () => ({
  DescribeCluster: jest.fn(),
}))
import {DescribeCluster} from '../../model'
import {act} from 'react-dom/test-utils'

describe('Given a cluster poll', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('when a cluster name is given', () => {
    it('should start polling the resource', () => {
      renderHook(() => useClusterPoll('Test', true))

      jest.advanceTimersByTime(6000)
      expect(DescribeCluster).toHaveBeenCalledWith('Test')
    })

    it('can start polling the resource on demand', () => {
      const {result} = renderHook(() => useClusterPoll('Test', false))
      jest.advanceTimersByTime(6000)
      expect(DescribeCluster).not.toHaveBeenCalled()
      act(() => {
        result.current.start()
      })
      jest.advanceTimersByTime(6000)

      expect(DescribeCluster).toHaveBeenCalledWith('Test')
    })

    it('can stop polling after it has been started', () => {
      const {result} = renderHook(() => useClusterPoll('Test', false))
      act(() => {
        result.current.start()
        result.current.stop()
      })
      jest.advanceTimersByTime(6000)

      expect(DescribeCluster).not.toHaveBeenCalled()
    })
  })

  describe('when a cluster name is not given', () => {
    it('should not poll any resource', () => {
      renderHook(() => useClusterPoll('', true))
      jest.advanceTimersByTime(6000)

      expect(DescribeCluster).not.toHaveBeenCalled()
    })
  })
})
