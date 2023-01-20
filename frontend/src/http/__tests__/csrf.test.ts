import {requestWithCSRF} from '../csrf'

describe('Given a function to retrieve a CSRF token', () => {
  describe('when making a GET call', () => {
    it('should skip the token retrieve and perform the call directly', async () => {
      let internalRequest = jest.fn().mockResolvedValue(null)
      await requestWithCSRF(internalRequest, 'get', '/test')

      expect(internalRequest).not.toHaveBeenCalledWith('get', '/csrf')
      expect(internalRequest).toHaveBeenCalledWith('get', '/test')
    })
  })
  describe('when making a mutation request', () => {
    describe('when a CSRF token is retrieved successfully', () => {
      it('should be forwarded to the request headers', async () => {
        let internalRequest = jest.fn().mockResolvedValue({
          data: {
            csrf_token: 'test-token',
          },
        })
        await requestWithCSRF(internalRequest, 'post', '/test', {body: 'test'})

        expect(internalRequest).toHaveBeenCalledWith(
          'post',
          '/test',
          {body: 'test'},
          {
            'X-CSRF-Token': 'test-token',
          },
          undefined,
        )
      })

      it('should return the response of the mutation', async () => {
        let internalRequest = jest.fn().mockImplementation(method => {
          if (method === 'get') {
            return {
              data: {
                csrf_token: 'test-token',
              },
            }
          }
          return {
            data: {
              success: true,
            },
          }
        })
        const {data} = await requestWithCSRF(internalRequest, 'post', '/test', {
          body: 'test',
        })

        expect(data).toMatchObject({
          success: true,
        })
      })
    })

    describe('when a CSRF token request fails', () => {
      it('should not call the mutation and just fail', async () => {
        let internalRequest = jest.fn().mockRejectedValue(null)
        try {
          await requestWithCSRF(internalRequest, 'post', '/test', {
            body: 'test',
          })
        } catch (error) {
          expect(internalRequest).toHaveBeenCalledTimes(1)
        }
      })
    })
  })
})
