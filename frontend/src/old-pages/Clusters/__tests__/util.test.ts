import {getScripts, selectCluster} from '../util'

describe('Given a function to get script names of all custom actions', () => {
  describe('when a custom action to be run on node startup is provided', () => {
    it('should return the name of the script', () => {
      const scriptNames = getScripts({
        OnNodeStart: {
          Script: 'https://www.website.com/test/directory/test-script.sh',
          Args: [],
        },
      })
      expect(scriptNames).toEqual(['test-script'])
    })
  })

  describe('when a custom action to be run on node configuration is provided', () => {
    it('should return the name of the script', () => {
      const scriptNames = getScripts({
        OnNodeConfigured: {
          Script: 'https://www.website.com/test/directory/test-script.sh',
          Args: [],
        },
      })
      expect(scriptNames).toEqual(['test-script'])
    })
  })

  describe('when a custom action with arguments is provided', () => {
    it('should return the names of all scripts', () => {
      const scriptNames = getScripts({
        OnNodeConfigured: {
          Script: 'https://www.website.com/test/test-multi-runner.py',
          Args: [
            'https://www.website.com/directory/test.sh',
            '-123456',
            '-abcdef',
          ],
        },
      })
      expect(scriptNames.sort()).toEqual(['test', 'test-multi-runner'])
    })
  })

  describe('when multiple custom actions and arguments are provided', () => {
    it('should return the names of all scripts', () => {
      const scriptNames = getScripts({
        OnNodeStart: {
          Script: 'https://www.website.com/test/directory/testing.sh',
          Args: ['-abcdef'],
        },
        OnNodeConfigured: {
          Script: 'https://www.website.com/test/test.py',
          Args: [
            'https://www.website.com/directory/tests.sh',
            '-123456',
            '-abcdef',
            'https://www.website.com/test/directory/test-multi-runner.py',
          ],
        },
      })
      expect(scriptNames.sort()).toEqual([
        'test',
        'test-multi-runner',
        'testing',
        'tests',
      ])
    })
  })

  describe('when no custom actions are provided', () => {
    it('should return an empty array', () => {
      const scriptNames = getScripts(null)
      expect(scriptNames).toEqual([])
    })
  })
})

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
