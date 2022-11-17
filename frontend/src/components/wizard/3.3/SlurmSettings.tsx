import React from 'react'
import {Button, Container, FormField, Header} from '@awsui/components-react'
import {zodResolver} from '@hookform/resolvers/zod'
import {useContext} from 'react'
import {get, useForm} from 'react-hook-form'
import {z} from 'zod'
import {ControlledInput} from '../../hook-form/Input'
import {WizardContext} from '../common/WizardContext'
import {pclusterSchema} from './schema'

const slurmSettingsSchema = pclusterSchema.pick({
  SlurmSettings: true,
})
type SlurmSchema = z.infer<typeof slurmSettingsSchema>

export const SlurmSettings = () => {
  const [currentConfig, updateConfig] = useContext(WizardContext)
  const {
    control,
    formState: {errors},
    handleSubmit,
  } = useForm<SlurmSchema>({
    resolver: zodResolver(slurmSettingsSchema),
    defaultValues: {
      SlurmSettings: currentConfig?.SlurmSettings,
    },
  })
  return (
    <Container header={<Header variant="h2">Slurm Settings</Header>}>
      <FormField
        label="Database URI"
        errorText={get(errors, 'SlurmSettings.Database.message')}
      >
        <ControlledInput control={control} name="SlurmSettings.Database.Uri" />
      </FormField>
      <FormField
        label="PasswordSecretArn"
        errorText={get(errors, 'SlurmSettings.Database.message')}
      >
        <ControlledInput
          control={control}
          name="SlurmSettings.Database.PasswordSecretArn"
        />
      </FormField>
      <FormField
        label="UserName"
        errorText={get(errors, 'SlurmSettings.Database.message')}
      >
        <ControlledInput
          control={control}
          name={`SlurmSettings.Database.UserName`}
        />
      </FormField>
      <Button onClick={() => handleSubmit(updateConfig)()}>Next</Button>
    </Container>
  )
}
