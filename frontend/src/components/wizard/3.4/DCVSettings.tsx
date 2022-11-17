import React from 'react'
import {Button, Container, FormField, Header} from '@awsui/components-react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useContext} from 'react'
import {get, useForm} from 'react-hook-form'
import {z} from 'zod'
import {ControlledToggle} from '../../hook-form/Toggle'
import {UpdateConfig, WizardContext} from '../common/WizardContext'
import {PClusterConfig, pclusterSchema} from './schema'

const dcvSchema = pclusterSchema.pick({
  DCV: true,
})
type DCVSchema = z.infer<typeof dcvSchema>

export const DCVSettings = () => {
  const [currentConfig, updateConfig] =
    useContext<[PClusterConfig, UpdateConfig<PClusterConfig>]>(WizardContext)
  const {
    control,
    formState: {errors},
    handleSubmit,
  } = useForm<DCVSchema>({
    resolver: zodResolver(dcvSchema),
    defaultValues: {
      DCV: currentConfig?.DCV,
    },
  })
  return (
    <Container header={<Header variant="h2">DCV settings</Header>}>
      <FormField
        label="DCV Enabled V2"
        errorText={get(errors, 'SlurmSettings.Database.message')}
      >
        <ControlledToggle control={control} name="DCV.EnabledV2" />
      </FormField>
      <Button onClick={() => handleSubmit(updateConfig)()}>Next</Button>
    </Container>
  )
}
