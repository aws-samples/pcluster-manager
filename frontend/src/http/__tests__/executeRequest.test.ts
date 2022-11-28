import {AppConfig} from '../../app-config/types'
// import axios from "axios";
import {executeRequest} from '../executeRequest'

const mockOperation = jest.fn()

jest.mock('axios', () => ({
  create: () => ({
    get: (...args: unknown[]) => mockOperation(...args),
    post: (...args: unknown[]) => mockOperation(...args),
    put: (...args: unknown[]) => mockOperation(...args),
    patch: (...args: unknown[]) => mockOperation(...args),
    delete: (...args: unknown[]) => mockOperation(...args),
  }),
}))

const expectedConf = {headers: {'Content-Type': 'application/json'}}

const mockAppConfig: AppConfig = {
  authUrl: 'http://somepath.com',
  clientId: 'some-id',
  redirectUri: 'some-uri',
  scopes: 'some-list',
}

describe('given the application config', () => {
  beforeEach(() => {
    mockOperation.mockReturnValue(Promise.resolve())
    mockOperation.mockClear()
  })

  describe('and an axios instance', () => {
    it('should be correctly invoked with method GET', () => {
      executeRequest('get', '/', {}, mockAppConfig)

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockOperation).toHaveBeenCalledWith('/', {}, expectedConf)
    })

    it('should be correctly invoked with method POST', () => {
      executeRequest('post', '/', {}, mockAppConfig)

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockOperation).toHaveBeenCalledWith('/', {}, expectedConf)
    })

    it('should be correctly invoked with method PUT', () => {
      executeRequest('put', '/', {}, mockAppConfig)

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockOperation).toHaveBeenCalledWith('/', {}, expectedConf)
    })

    it('should be correctly invoked with method PATCH', () => {
      executeRequest('patch', '/', {}, mockAppConfig)

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockOperation).toHaveBeenCalledWith('/', {}, expectedConf)
    })

    it('should be correctly invoked with method DELETE', () => {
      executeRequest('delete', '/', {}, mockAppConfig)

      expect(mockOperation).toHaveBeenCalledTimes(1)
      expect(mockOperation).toHaveBeenCalledWith('/', {}, expectedConf)
    })
  })
})
