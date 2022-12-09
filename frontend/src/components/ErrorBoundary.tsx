import React, {Component, ReactNode} from 'react'
import {
  Modal,
  Box,
  SpaceBetween,
  Button,
  Link,
} from '@cloudscape-design/components'
import {TFunction, Trans, useTranslation} from 'react-i18next'
import {ILogger} from '../logger/ILogger'
import {useLogger} from '../logger/LoggerProvider'

interface ErrorBoundaryProps {
  t: TFunction
  logger: ILogger
  windowObject?: Window
  children?: ReactNode
}

interface State {
  error: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  public state: State = {
    error: false,
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    this.props.logger.error(event.reason)
  }
  private errorHandler = (event: ErrorEvent) => {
    this.props.logger.error(event.message)
  }

  private redirectToHomepage = () => {
    window.location.href = '/home'
  }

  public static getDerivedStateFromError(_: Error): State {
    return {error: true}
  }

  public componentDidCatch(error: Error) {
    this.props.logger.error(error.message)
  }

  public componentDidMount() {
    const windowObject = this.props.windowObject || window
    windowObject.addEventListener(
      'unhandledrejection',
      this.promiseRejectionHandler,
    )
    windowObject.addEventListener('error', this.errorHandler)
  }

  public componentWillUnmount() {
    const windowObject = this.props.windowObject || window
    windowObject.removeEventListener(
      'unhandledrejection',
      this.promiseRejectionHandler,
    )
    windowObject.removeEventListener('error', this.errorHandler)
  }

  public render() {
    const {t} = this.props

    if (this.state.error) {
      return (
        <Modal
          visible={true}
          closeAriaLabel={t('errorBoundary.modal.closeAriaLabel')}
          onDismiss={this.redirectToHomepage}
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button variant="primary" onClick={this.redirectToHomepage}>
                  {t('errorBoundary.modal.button')}
                </Button>
              </SpaceBetween>
            </Box>
          }
          header={t('errorBoundary.modal.header')}
        >
          <Trans i18nKey="errorBoundary.modal.description">
            Description
            <Link
              external
              href="https://github.com/aws-samples/pcluster-manager/issues"
            >
              link
            </Link>
          </Trans>
        </Modal>
      )
    }

    return this.props.children
  }
}

interface Props {
  windowObject?: Window
  children?: ReactNode
}

const ComposedErrorBoundary: React.FC<Props> = props => {
  const {t} = useTranslation()
  const logger = useLogger()

  return <ErrorBoundary logger={logger} t={t} {...props} />
}

export default ComposedErrorBoundary
