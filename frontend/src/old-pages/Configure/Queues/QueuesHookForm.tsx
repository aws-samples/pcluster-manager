import {
  Box,
  Button,
  ColumnLayout,
  Container,
  FormField,
  Header,
  SpaceBetween,
} from '@awsui/components-react'
import {useCallback} from 'react'
import {useFieldArray, useForm, useWatch} from 'react-hook-form'
import {Trans, useTranslation} from 'react-i18next'
import {ControlledInput} from '../../../components/hook-form/Input'
import {ControlledSelect} from '../../../components/hook-form/Select'
import {ControlledToggle} from '../../../components/hook-form/Toggle'
import {getState, setState, useState} from '../../../store'
import {ControlledSubnetSelect, useInstanceGroups} from '../Components'
import {Queue} from './queues.types'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'

const CAPACITY_TYPES: [string, string, string][] = [
  ['ONDEMAND', 'On-Demand', '/img/od.svg'],
  ['SPOT', 'Spot', '/img/spot.svg'],
]

const schema = z.object({
  Scheduling: z.object({
    SlurmQueues: z.array(
      z.object({
        SubnetIds: z.string().transform(subnet => [subnet]),
        ComputeResources: z.array(
          z.object({
            Name: z.string(),
            MinCount: z.number(),
            MaxCount: z.number(),
            InstanceType: z.string().min(1, {message: 'Required'}),
          }),
        ),
      }),
    ),
  }),
})

type QueueType = z.infer<typeof schema>

// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
function itemToIconOption([value, label, icon]) {
  return {value: value, label: label, ...(icon ? {iconUrl: icon} : {})}
}

export const QueuesHookForm = () => {
  const initialState = getState(['app', 'wizard', 'config', 'Scheduling'])
  // TODO: add button to validate form and patch state
  const {t} = useTranslation()
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<QueueType>({
    // defaultValues: {}; you can populate the fields by this attribute
    resolver: zodResolver(schema),
    defaultValues: {
      Scheduling: initialState,
    },
  })
  const {fields, append, remove} = useFieldArray({
    control,
    name: 'Scheduling.SlurmQueues',
  })

  const addQueue = useCallback(() => {
    append({
      Name: `queue${fields.length}`,
      ComputeResources: [
        {
          Name: 'cr-0',
          MinCount: 2,
          MaxCount: 4,
          InstanceType: '',
        },
      ],
    })
  }, [append, fields.length])

  return (
    <ColumnLayout>
      <Container
        header={
          <Header variant="h2">{t('wizard.queues.container.title')}</Header>
        }
      >
        <div>
          <SpaceBetween direction="vertical" size="l">
            {fields.map((queue, queueIndex) => (
              <div className="queue" key={queue.id}>
                <div className="queue-properties">
                  <Box margin={{bottom: 'xs'}}>
                    <Header
                      variant="h3"
                      actions={
                        queueIndex > 0 ? (
                          <Button onClick={() => remove(queueIndex)}>
                            Remove Queue
                          </Button>
                        ) : null
                      }
                    >
                      <SpaceBetween direction="horizontal" size="xs">
                        <span>Queue: {queue.Name} </span>
                      </SpaceBetween>
                    </Header>
                  </Box>
                  <ColumnLayout columns={2}>
                    <FormField label={t('wizard.queues.subnet.label')}>
                      <ControlledSubnetSelect
                        control={control}
                        name={`Scheduling.SlurmQueues.${queueIndex}.SubnetIds`}
                      />
                    </FormField>
                    <FormField label={t('wizard.queues.purchaseType.label')}>
                      <ControlledSelect
                        control={control as any}
                        name={`Scheduling.SchedulerQueues.${queueIndex}.CapacityType`}
                        options={CAPACITY_TYPES.map(itemToIconOption)}
                      />
                    </FormField>
                  </ColumnLayout>
                  <Box variant="div" margin={{vertical: 'xs'}}>
                    <ControlledToggle
                      control={control as any}
                      name={`Scheduling.SchedulerQueues.${queueIndex}.Networking.PlacementGroup.Enabled`}
                    >
                      <Trans i18nKey="wizard.queues.placementGroup.label" />
                    </ControlledToggle>
                  </Box>
                  <ComputeResources
                    queueIndex={queueIndex}
                    control={control}
                    errors={errors}
                  />
                </div>
              </div>
            ))}
          </SpaceBetween>
        </div>
        <div className="wizard-compute-add">
          <Button onClick={addQueue} iconName={'add-plus'}>
            {t('wizard.queues.addQueueButton.label')}
          </Button>
          <Button
            onClick={handleSubmit(data => {
              console.log('new config', getState(['app', 'wizard', 'config']))
              setState(
                ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues'],
                data.Scheduling.SlurmQueues,
              )
            })}
          >
            Validate and update store
          </Button>
        </div>
      </Container>
    </ColumnLayout>
  )
}

const tInstances = new Set<string>(['t2.micro', 't2.medium'])

const ComputeResources = ({
  queueIndex,
  control,
  errors,
}: {
  queueIndex: number
  control: any
  errors: any
}) => {
  const {fields, remove, append} = useFieldArray({
    control,
    name: `Scheduling.SlurmQueues.${queueIndex}.ComputeResources`,
  })

  const addComputeResource = useCallback(() => {
    append({
      Name: `cr-${fields.length}`,
      MinCount: 0,
      MaxCount: 4,
      InstanceType: 't2.micro',
    })
  }, [append, fields.length])
  return (
    <Container>
      {fields.map((cr, crIndex) => (
        <ComputeResource
          key={cr.id}
          queueIndex={queueIndex}
          crIndex={crIndex}
          control={control}
          remove={remove}
          errors={errors}
        />
      ))}
      <Button onClick={addComputeResource}>Add Resource</Button>
    </Container>
  )
}

// @ts-expect-error TS(7031) FIXME: Binding element 'value' implicitly has an 'any' ty... Remove this comment to see the full error message
const instanceToOption = ([value, label, icon]) => {
  return {label: value, iconUrl: icon, description: label, value: value}
}

const ComputeResource = ({
  queueIndex,
  crIndex,
  control,
  remove,
  errors,
}: {
  queueIndex: number
  crIndex: number
  control: any
  remove: any
  errors: any
}) => {
  const {t} = useTranslation()
  const instanceType = useWatch({
    control,
    name: `Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.InstanceType`,
  })
  const efaInstances = new Set(useState(['aws', 'efa_instance_types']))
  const instanceGroups = useInstanceGroups()

  return (
    <div className="compute-resource">
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <Box margin={{top: 'xs'}} textAlign="right">
          {crIndex > 0 && (
            <Button onClick={() => remove(crIndex)}>Remove Resource</Button>
          )}
        </Box>
        <ColumnLayout columns={2}>
          <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
            <FormField label={t('wizard.queues.computeResource.staticNodes')}>
              <ControlledInput
                control={control as any}
                name={`Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.MinCount`}
                type="number"
              />
            </FormField>
            <FormField label={t('wizard.queues.computeResource.dynamicNodes')}>
              <ControlledInput
                control={control as any}
                name={`Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.MaxCount`}
                type="number"
              />
            </FormField>
          </div>
          <FormField
            label={t('wizard.queues.computeResource.instanceType')}
            errorText={
              errors.Scheduling?.SlurmQueues[queueIndex]?.ComputeResources[
                crIndex
              ]?.InstanceType?.message
            }
          >
            <ControlledSelect
              control={control}
              name={`Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.InstanceType`}
              options={Object.keys(instanceGroups).map(groupName => {
                return {
                  label: groupName,
                  options: instanceGroups[groupName].map(instanceToOption),
                }
              })}
            />
          </FormField>
        </ColumnLayout>
        <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
          <ControlledToggle
            disabled={tInstances.has(instanceType)}
            control={control}
            name={`Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.DisableSimultaneousMultithreading`}
          >
            <Trans i18nKey="wizard.queues.computeResource.disableHT" />
          </ControlledToggle>
          <ControlledToggle
            disabled={!efaInstances.has(instanceType)}
            control={control}
            name={`Scheduling.SlurmQueues.${queueIndex}.ComputeResources.${crIndex}.Efa.Enabled`}
          >
            <Trans i18nKey="wizard.queues.computeResource.enableEfa" />
          </ControlledToggle>
        </div>
      </div>
    </div>
  )
}
