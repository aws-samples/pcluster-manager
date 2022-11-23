import {render, waitFor} from '@testing-library/react'
import ErrorBoundary from '../ErrorBoundary'
import i18n from 'i18next'
import {I18nextProvider, initReactI18next} from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {},
  lng: 'en',
})

const MockProviders = (props: any) => (
  <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
)

const Child = () => {
  throw new Error()
}

describe('Given an ErrorBoundary component', () => {
  describe('when there is an error in a Child component', () => {
    it('should render the fallback ui', async () => {
      const {getByText} = await waitFor(() =>
        render(
          <MockProviders>
            <ErrorBoundary>
              <Child />
            </ErrorBoundary>
          </MockProviders>,
        ),
      )
      expect(getByText('errorBoundary.modal.header')).toBeTruthy()
    })
  })

  describe('when the component is mounted', () => {
    let mockWindowObject: any

    beforeEach(async () => {
      mockWindowObject = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }

      render(
        <MockProviders>
          <ErrorBoundary windowObject={mockWindowObject}>
            some content
          </ErrorBoundary>
        </MockProviders>,
      )
    })

    it('should listen for unhandledrejection events', () => {
      expect(mockWindowObject.addEventListener).toHaveBeenCalledTimes(2)
      expect(mockWindowObject.addEventListener).toHaveBeenNthCalledWith(
        1,
        'unhandledrejection',
        expect.any(Function),
      )
      expect(mockWindowObject.addEventListener).toHaveBeenNthCalledWith(
        2,
        'error',
        expect.any(Function),
      )
    })
  })
})
