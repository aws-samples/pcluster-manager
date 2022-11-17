import React from 'react'
import {Button, Container, FormField, Header} from '@awsui/components-react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useContext} from 'react'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {UpdateConfig, WizardContext} from '../common/WizardContext'
import {PClusterConfig, pclusterSchema} from './schema'
import {ControlledInput} from '../../hook-form/Input'

const loginNodes = pclusterSchema.pick({
  LoginNodes: true,
})
type LoginNodes = z.infer<typeof loginNodes>

export const LoginNodes = () => {
  const [currentConfig, updateConfig] =
    useContext<[PClusterConfig, UpdateConfig<PClusterConfig>]>(WizardContext)
  const {
    control,
    formState: {errors},
    handleSubmit,
  } = useForm<LoginNodes>({
    resolver: zodResolver(loginNodes),
    defaultValues: {
      LoginNodes: currentConfig?.LoginNodes,
    },
  })
  return (
    <Container header={<Header variant="h2">Login nodes</Header>}>
      <FormField
        label="Name of login nodes"
        errorText={errors.LoginNodes?.Arn?.message}
      >
        <ControlledInput control={control} name="LoginNodes.Arn" />
      </FormField>
      <Button onClick={() => handleSubmit(updateConfig)()}>Next</Button>
    </Container>
  )
}
