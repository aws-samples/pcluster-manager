import {Store} from '@reduxjs/toolkit'
import {renderHook} from '@testing-library/react-hooks'
import {mock} from 'jest-mock-extended'
import {Provider} from 'react-redux'
import {useWizardNavigation} from '../useWizardNavigation'
import {pages} from '../useWizardNavigation'

jest.mock('../../../store', () => {
  const originalModule = jest.requireActual('../../../store')
  return {
    __esModule: true,
    ...originalModule,
    setState: jest.fn(),
  }
})
import {setState} from '../../../store'

const mockStore = mock<Store>()
mockStore.dispatch.mockImplementation(jest.fn())
const validate = jest.fn()

describe('Given a hook to navigate through the wizard', () => {
  describe('when on a page different from create page', () => {
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        app: {
          wizard: {
            page: 'source',
          },
        },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('if page is validated, when clicking next button', () => {
      beforeEach(() => {
        validate.mockReturnValue(true)
      })

      it('should navigate to the next page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })

        const pageIdx = pages.indexOf('source')
        result.current('next', pageIdx + 1)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx + 1],
        )
      })
    }),
      describe('if page is not validated, when clicking next button', () => {
        beforeEach(() => {
          validate.mockReturnValue(false)
        })

        it('should remain on the same page', () => {
          const {result} = renderHook(() => useWizardNavigation(validate), {
            wrapper: ({children}) => {
              return <Provider store={mockStore}>{children}</Provider>
            },
          })

          result.current('next', 1)
          expect(setState).not.toHaveBeenCalled()
        })
      })
  })

  describe('when on a page different from source page', () => {
    const page = 'storage'
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        app: {
          wizard: {
            page: page,
          },
        },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('if page is not validated, when clicking back button', () => {
      beforeEach(() => {
        validate.mockReturnValue(false)
      })

      it('should navigate to the previous page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })

        const pageIdx = pages.indexOf(page)
        result.current('previous', pageIdx - 1)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx - 1],
        )
      })
    })
    describe('if page is validated, when clicking back button', () => {
      beforeEach(() => {
        validate.mockReturnValue(true)
      })

      it('should navigate to the previous page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })

        const pageIdx = pages.indexOf(page)
        result.current('previous', pageIdx - 1)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx - 1],
        )
      })
    })
  })

  describe('when on cluster page', () => {
    const page = 'cluster'
    describe('if multiUser is enabled, and the page is validated, when clicking next button', () => {
      beforeEach(() => {
        mockStore.getState.mockReturnValue({
          app: {
            wizard: {
              page: page,
              multiUser: true,
            },
          },
        })
        validate.mockReturnValue(true)
      })

      it('should navigate to multiUser page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })
        const pageIdx = pages.indexOf(page)
        result.current('next', pageIdx + 1)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx + 1],
        )
      })
    })
    describe('if multiUser is not enabled, and the page is validated, when clicking next button', () => {
      beforeEach(() => {
        mockStore.getState.mockReturnValue({
          app: {
            wizard: {
              page: 'cluster',
              multiUser: false,
            },
          },
        })
        validate.mockReturnValue(true)
      })

      it('should skip multiUser page and navigate to headNode page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })
        const pageIdx = pages.indexOf(page)
        result.current('next', pageIdx + 2)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx + 2],
        )
      })
    })
  })

  describe('when on headNode page', () => {
    const page = 'headNode'
    describe('if multiUser is enabled, when clicking back button', () => {
      beforeEach(() => {
        mockStore.getState.mockReturnValue({
          app: {
            wizard: {
              page: page,
              multiUser: true,
            },
          },
        })
        validate.mockReturnValue(true)
      })

      it('should navigate to multiUser page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })
        const pageIdx = pages.indexOf(page)
        result.current('previous', pageIdx - 1)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx - 1],
        )
      })
    })
    describe('if multiUser is not enabled, when clicking back button', () => {
      beforeEach(() => {
        mockStore.getState.mockReturnValue({
          app: {
            wizard: {
              page: 'headNode',
              multiUser: false,
            },
          },
        })
        validate.mockReturnValue(true)
      })

      it('should skip multiUser page and navigate back to cluster page', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })
        const pageIdx = pages.indexOf(page)
        result.current('previous', pageIdx - 2)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          pages[pageIdx - 2],
        )
      })
    })
  })

  describe('when on a page', () => {
    const page = 'queues'
    beforeEach(() => {
      mockStore.getState.mockReturnValue({
        app: {
          wizard: {
            page: page,
          },
        },
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
    })
    describe('when selecting a previous page through the wizard navigation pane', () => {
      beforeEach(() => {
        validate.mockReturnValue(false)
      })
      it('should navigate to the selected page, despite the fact that the page is validated or not', () => {
        const {result} = renderHook(() => useWizardNavigation(validate), {
          wrapper: ({children}) => {
            return <Provider store={mockStore}>{children}</Provider>
          },
        })
        const clusterIdx = pages.indexOf('cluster')
        result.current('step', clusterIdx)
        expect(setState).toHaveBeenCalledWith(
          ['app', 'wizard', 'page'],
          'cluster',
        )
      })
    })
    describe('when selecting a following page through the wizard navigation pane', () => {
      describe('if the page is validated', () => {
        beforeEach(() => {
          validate.mockReturnValue(true)
        })
        it('should navigate to the selected page', () => {
          const {result} = renderHook(() => useWizardNavigation(validate), {
            wrapper: ({children}) => {
              return <Provider store={mockStore}>{children}</Provider>
            },
          })
          const createIdx = pages.indexOf('create')
          result.current('step', createIdx)
          expect(setState).toHaveBeenCalledWith(
            ['app', 'wizard', 'page'],
            'create',
          )
        })
      })
      describe('if the page is not validated', () => {
        beforeEach(() => {
          validate.mockReturnValue(false)
        })
        it('should remain on the same page', () => {
          const {result} = renderHook(() => useWizardNavigation(validate), {
            wrapper: ({children}) => {
              return <Provider store={mockStore}>{children}</Provider>
            },
          })
          const createIdx = pages.indexOf('create')
          result.current('step', createIdx)
          expect(setState).not.toHaveBeenCalled()
        })
      })
    })
  })
})
