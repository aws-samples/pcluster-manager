import {DescribeCluster} from '../model'

const mockGet = jest.fn()

jest.mock('axios', () => ({
  create: () => ({
    get: (...args: unknown[]) => mockGet(...args),
  }),
}))

describe('given a DescribeCluster command and a cluster name', () => {
  const clusterName = 'any-name'

  describe('when the cluster can be described successfully', () => {
    beforeEach(() => {
      const mockResponse = {
        some: 'data',
      }
      mockGet.mockResolvedValueOnce({data: mockResponse})
    })

    it('should return the cluster description', async () => {
      const data = await DescribeCluster(clusterName)
      expect(data).toEqual({
        some: 'data',
      })
    })
  })

  describe('when the describe cluster fails', () => {
    let mockErrorCallback: jest.Mock
    let mockError: any

    beforeEach(() => {
      mockErrorCallback = jest.fn()
      mockError = {
        response: {
          data: {
            message: 'some-error-messasge',
          },
        },
      }
      mockGet.mockRejectedValueOnce(mockError)
    })

    it('should call the error callback', async () => {
      try {
        await DescribeCluster(clusterName, mockErrorCallback)
      } catch (e) {
        expect(mockErrorCallback).toHaveBeenCalledTimes(1)
      }
    })

    it('should re-throw the error', async () => {
      try {
        await DescribeCluster(clusterName, mockErrorCallback)
      } catch (e) {
        expect(e).toEqual({
          response: {
            data: {
              message: 'some-error-messasge',
            },
          },
        })
      }
    })
  })
})
