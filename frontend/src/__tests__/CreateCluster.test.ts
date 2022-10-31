import {CreateCluster} from '../model'

const mockPost = jest.fn()

jest.mock('axios', () => ({
  create: () => ({
    post: (...args: unknown[]) => mockPost(...args),
  }),
}))

describe('given a CreateCluster command and a cluster configuration', () => {
  const clusterName = 'any-name'
  const clusterConfiguration = {}
  const mockRegion = 'some-region'
  const mockSelectedRegion = 'some-region'

  describe('when the cluster can be created successfully', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      const mockResponse = {
        status: 202,
        data: {
          some: 'data',
        },
      }
      mockPost.mockResolvedValueOnce(mockResponse)
    })

    it('should emit the API request', async () => {
      const expectedBody = {
        clusterConfiguration,
        clusterName,
      }

      await CreateCluster(
        clusterName,
        clusterConfiguration,
        mockRegion,
        mockSelectedRegion,
      )
      expect(mockPost).toHaveBeenCalledTimes(1)
      expect(mockPost).toHaveBeenCalledWith(
        'api?path=/v3/clusters&region=some-region',
        expectedBody,
        expect.any(Object),
      )
    })

    it('should call the success callback', async () => {
      const mockSuccessCallback = jest.fn()
      await CreateCluster(
        clusterName,
        clusterConfiguration,
        mockRegion,
        mockSelectedRegion,
        false,
        false,
        mockSuccessCallback,
      )
      expect(mockSuccessCallback).toHaveBeenCalledTimes(1)
      expect(mockSuccessCallback).toHaveBeenCalledWith({some: 'data'})
    })

    describe('when a dryrun is requested', () => {
      const mockDryRun = true

      it('should add set the dryrun query parameter', async () => {
        await CreateCluster(
          clusterName,
          clusterConfiguration,
          mockRegion,
          mockSelectedRegion,
          false,
          mockDryRun,
        )
        expect(mockPost).toHaveBeenCalledTimes(1)
        expect(mockPost).toHaveBeenCalledWith(
          'api?path=/v3/clusters&dryrun=true&region=some-region',
          expect.any(Object),
          expect.any(Object),
        )
      })
    })

    describe('when stack rollback on failure is disabled', () => {
      const mockDisableRollback = true

      it('should add set the disableRollback query parameter', async () => {
        await CreateCluster(
          clusterName,
          clusterConfiguration,
          mockRegion,
          mockSelectedRegion,
          mockDisableRollback,
        )
        expect(mockPost).toHaveBeenCalledTimes(1)
        expect(mockPost).toHaveBeenCalledWith(
          'api?path=/v3/clusters&disableRollback=true&region=some-region',
          expect.any(Object),
          expect.any(Object),
        )
      })
    })
  })

  describe('when the cluster creation fails', () => {
    let mockError: any

    beforeEach(() => {
      mockError = {
        response: {
          data: {
            message: 'some-error-message',
          },
        },
      }
      mockPost.mockRejectedValueOnce(mockError)
    })

    it('should call the error callback', async () => {
      const mockErrorCallback = jest.fn()
      await CreateCluster(
        clusterName,
        clusterConfiguration,
        mockRegion,
        mockSelectedRegion,
        false,
        false,
        undefined,
        mockErrorCallback,
      )
      await Promise.resolve()
      expect(mockErrorCallback).toHaveBeenCalledTimes(1)
      expect(mockErrorCallback).toHaveBeenCalledWith({
        message: 'some-error-message',
      })
    })
  })
})
