import React, {Component, ErrorInfo, ReactNode} from 'react'
import {Modal, Box, SpaceBetween, Button, Link} from '@awsui/components-react'
import {withTranslation, TFunction, Trans} from 'react-i18next'

interface Props {
  t: TFunction
  windowObject?: Window
  children?: ReactNode
}

interface State {
  error: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: false,
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    console.error(event.reason)
  }
  private errorHandler = (event: ErrorEvent) => {
    console.log(event.message)
  }

  private redirectToHomepage = () => {
    window.location.href = '/home'
  }

  public static getDerivedStateFromError(_: Error): State {
    return {error: true}
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo)
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
                <Button
                  variant="primary"
                  iconName="external"
                  onClick={this.redirectToHomepage}
                >
                  {t('errorBoundary.modal.button')}
                </Button>
              </SpaceBetween>
            </Box>
          }
          header={t('errorBoundary.modal.header')}
        >
          <Trans i18nKey="errorBoundary.modal.description">
            Description
            <Link href="https://github.com/aws-samples/pcluster-manager/issues">
              link
            </Link>
          </Trans>
        </Modal>
      )
    }

    return this.props.children
  }
}

export default withTranslation()(ErrorBoundary)
