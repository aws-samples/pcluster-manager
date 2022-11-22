import {render, waitFor} from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'

const Child = () => {
  throw new Error()
}

const mockAddEventListener = jest.fn()
window.addEventListener = mockAddEventListener

describe('Given an ErrorBoundary component', () => {
  describe('when there is an error in a Child component', () => {
    it('should render the fallback ui', async () => {
      const {getByText} = await waitFor(() =>
        render(
          <ErrorBoundary>
            <Child />
          </ErrorBoundary>,
        ),
      )
      expect(getByText('errorBoundary.modal.header')).toBeTruthy()
    })
  })

  describe.only('when the component is mounted', () => {
    beforeEach(() => {
      render(<ErrorBoundary>test</ErrorBoundary>)
      window.dispatchEvent(new Event('unhandledrejection'))
    })
    it('should listen for unhandledrejection events', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function),
      )
    })
  })
})
