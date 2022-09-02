import {getScripts} from '../util'

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
