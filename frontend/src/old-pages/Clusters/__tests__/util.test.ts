import {selectCluster} from '../util'

describe('Given a function to select the current cluster and a cluster name', () => {
  const clusterName = 'some-cluster-name'
  let mockDescribeCluster: jest.Mock
  let mockGetConfiguration: jest.Mock

  beforeEach(() => {
    mockDescribeCluster = jest.fn()
    mockGetConfiguration = jest.fn()
  })

  describe('when user selects a cluster by name', () => {
    it('should describe the cluster', async () => {
      await selectCluster(
        clusterName,
        mockDescribeCluster,
        mockGetConfiguration,
      )
      expect(mockDescribeCluster).toHaveBeenCalledTimes(1)
      expect(mockDescribeCluster).toHaveBeenCalledWith(clusterName)
    })

    it('should get the cluster configuration', async () => {
      await selectCluster(
        clusterName,
        mockDescribeCluster,
        mockGetConfiguration,
      )
      expect(mockGetConfiguration).toHaveBeenCalledTimes(1)
      expect(mockGetConfiguration).toHaveBeenCalledWith(
        clusterName,
        expect.any(Function),
      )
    })

    describe('when describing the cluster fails', () => {
      beforeEach(async () => {
        mockDescribeCluster = jest.fn(() => Promise.reject('any-error'))
        await selectCluster(
          clusterName,
          mockDescribeCluster,
          mockGetConfiguration,
        )
      })

      it('should not get the cluster configuration', () => {
        expect(mockGetConfiguration).toHaveBeenCalledTimes(0)
      })
    })
  })
})
