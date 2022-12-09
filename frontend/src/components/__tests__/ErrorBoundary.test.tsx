import {render, waitFor} from '@testing-library/react'
import {ErrorBoundary} from '../ErrorBoundary'
import {mock, MockProxy} from 'jest-mock-extended'
import {ILogger} from '../../logger/ILogger'
import {TFunction} from 'react-i18next'
import i18n from 'i18next'
import {I18nextProvider, initReactI18next} from 'react-i18next'

i18n.use(initReactI18next).init({
  resources: {},
  lng: 'en',
})

const mockTFunction: TFunction = label => label

const ThrowingInRenderChild = () => {
  throw new Error()
}

const MockProviders = (props: any) => (
  <I18nextProvider i18n={i18n}>{props.children}</I18nextProvider>
)

describe('Given an ErrorBoundary component', () => {
  let mockLogger: MockProxy<ILogger>

  beforeEach(() => {
    mockLogger = mock<ILogger>()
  })

  describe('when there is an error in a Child component', () => {
    it('should render the fallback ui', async () => {
      const {getByText} = await waitFor(() =>
        render(
          <MockProviders>
            <ErrorBoundary logger={mockLogger} t={mockTFunction}>
              <ThrowingInRenderChild />
            </ErrorBoundary>
          </MockProviders>,
        ),
      )
      expect(getByText('errorBoundary.modal.header')).toBeTruthy()
    })
  })

  describe('when the component is mounted', () => {
    let mockWindowObject: any
    let eventHandlers: Record<string, Function>

    beforeEach(() => {
      eventHandlers = {}
      mockWindowObject = {
        addEventListener: jest
          .fn()
          .mockImplementation(
            (name, callback) => (eventHandlers[name] = callback),
          ),
        removeEventListener: jest.fn(),
      }

      render(
        <MockProviders>
          <ErrorBoundary
            windowObject={mockWindowObject}
            logger={mockLogger}
            t={mockTFunction}
          >
            some content
          </ErrorBoundary>
        </MockProviders>,
      )
    })

    describe('when an unhandledjerection event is fired', () => {
      beforeEach(() => {
        const mockError: Partial<PromiseRejectionEvent> = {
          reason: 'some-reason',
        }
        eventHandlers.unhandledrejection(mockError)
      })

      it('should log the error', () => {
        expect(mockLogger.error).toHaveBeenCalledTimes(1)
        expect(mockLogger.error).toHaveBeenCalledWith('some-reason')
      })
    })

    describe('when an error event is fired', () => {
      beforeEach(() => {
        const mockError: Partial<ErrorEvent> = {
          message: 'some-message',
        }
        eventHandlers.error(mockError)
      })

      it('should log the error', () => {
        expect(mockLogger.error).toHaveBeenCalledTimes(1)
        expect(mockLogger.error).toHaveBeenCalledWith('some-message')
      })
    })
  })
})
