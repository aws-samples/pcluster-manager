import React from 'react'
import {Container, Header} from '@awsui/components-react'
import {useContext} from 'react'
import {WizardContext} from '../common/WizardContext'

export const Review = () => {
  const [config] = useContext(WizardContext)
  return (
    <Container header={<Header variant="h2">PCluster config</Header>}>
      <p>{JSON.stringify(config)}</p>
    </Container>
  )
}
