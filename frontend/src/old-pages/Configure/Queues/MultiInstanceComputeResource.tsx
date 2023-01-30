import {
  Box,
  Button,
  ColumnLayout,
  FormField,
  Input,
  Multiselect,
  MultiselectProps,
  Checkbox,
} from '@cloudscape-design/components'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import {useCallback, useEffect, useMemo} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {clearState, setState, useState} from '../../../store'
import {HelpTextInput, useInstanceGroups} from '../Components'
import {
  ComputeResourceInstance,
  MultiInstanceComputeResource,
  QueueValidationErrors,
} from './queues.types'

const queuesPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues']
const queuesErrorsPath = ['app', 'wizard', 'errors', 'queues']
const defaultInstanceType = 'c5n.large'

export function allInstancesSupportEFA(
  instances: ComputeResourceInstance[],
  efaInstances: Set<string>,
): boolean {
  if (!instances || !instances.length) {
    return false
  }
  return instances.every(instance => efaInstances.has(instance.InstanceType))
}

export function ComputeResource({
  index,
  queueIndex,
  computeResource,
  canUseEFA,
}: any) {
  const parentPath = useMemo(() => [...queuesPath, queueIndex], [queueIndex])
  const computeResources: MultiInstanceComputeResource[] = useState([
    ...parentPath,
    'ComputeResources',
  ])
  const path = useMemo(
    () => [...parentPath, 'ComputeResources', index],
    [index, parentPath],
  )
  const errorsPath = [...queuesErrorsPath, queueIndex, 'computeResource', index]
  const typeError = useState([...errorsPath, 'type'])

  const instanceTypePath = useMemo(() => [...path, 'Instances'], [path])
  const instances: ComputeResourceInstance[] = useState(instanceTypePath) || []

  const memoryBasedSchedulingEnabledPath = [
    'app',
    'wizard',
    'config',
    'Scheduling',
    'SlurmSettings',
    'EnableMemoryBasedScheduling',
  ]
  const enableMemoryBasedScheduling = useState(memoryBasedSchedulingEnabledPath)

  const disableHTPath = [...path, 'DisableSimultaneousMultithreading']
  const disableHT = useState(disableHTPath)

  const efaInstances = new Set<string>(useState(['aws', 'efa_instance_types']))
  const enableEFA = useState([...path, 'Efa', 'Enabled']) || false

  const enablePlacementGroupPath = useMemo(
    () => [...parentPath, 'Networking', 'PlacementGroup', 'Enabled'],
    [parentPath],
  )

  const minCount = useState([...path, 'MinCount'])
  const maxCount = useState([...path, 'MaxCount'])

  const instanceGroups = useInstanceGroups()
  const instanceOptions = useMemo(
    () =>
      Object.keys(instanceGroups).map(groupName => {
        return {
          label: groupName,
          options: instanceGroups[groupName].map(([value, label, icon]) => ({
            label: value,
            iconUrl: icon,
            description: label,
            value: value,
          })),
        }
      }),
    [instanceGroups],
  )

  const {t} = useTranslation()

  const remove = () => {
    setState(
      [...parentPath, 'ComputeResources'],
      [
        ...computeResources.slice(0, index),
        ...computeResources.slice(index + 1),
      ],
    )
  }

  const setMinCount = (staticCount: any) => {
    const dynamicCount = maxCount - minCount
    if (staticCount > 0)
      setState([...path, 'MinCount'], !isNaN(staticCount) ? staticCount : 0)
    else clearState([...path, 'MinCount'])
    setState(
      [...path, 'MaxCount'],
      (!isNaN(staticCount) ? staticCount : 0) +
        (!isNaN(dynamicCount) ? dynamicCount : 0),
    )
  }

  const setMaxCount = (dynamicCount: any) => {
    const staticCount = minCount
    setState(
      [...path, 'MaxCount'],
      (!isNaN(staticCount) ? staticCount : 0) +
        (!isNaN(dynamicCount) ? dynamicCount : 0),
    )
  }

  const setSchedulableMemory = (
    schedulableMemoryPath: string[],
    schedulableMemory: string,
  ) => {
    let schedulableMemoryNumber = parseInt(schedulableMemory)
    if (enableMemoryBasedScheduling && !isNaN(schedulableMemoryNumber)) {
      setState(schedulableMemoryPath, schedulableMemoryNumber)
    } else {
      clearState(schedulableMemoryPath)
    }
  }

  const setDisableHT = (disable: any) => {
    if (disable) setState(disableHTPath, disable)
    else clearState(disableHTPath)
  }

  const setEnableEFA = useCallback(
    (enable: any) => {
      if (enable) {
        setState([...path, 'Efa', 'Enabled'], enable)
        setState(enablePlacementGroupPath, enable)
      } else {
        clearState([...path, 'Efa'])
        clearState(enablePlacementGroupPath)
      }
    },
    [enablePlacementGroupPath, path],
  )

  useEffect(() => {
    if (!canUseEFA) {
      setEnableEFA(false)
    }
  }, [canUseEFA, setEnableEFA])

  const setInstances: NonCancelableEventHandler<MultiselectProps.MultiselectChangeDetail> =
    useCallback(
      ({detail}) => {
        const selectedInstances = (detail.selectedOptions.map(option => ({
          InstanceType: option.value,
        })) || []) as ComputeResourceInstance[]
        setState(instanceTypePath, selectedInstances)
        if (!allInstancesSupportEFA(selectedInstances, efaInstances)) {
          setEnableEFA(false)
        }
      },
      [efaInstances, instanceTypePath, setEnableEFA],
    )

  return (
    <div className="compute-resource">
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
        <Box margin={{top: 'xs'}} textAlign="right">
          {index > 0 && <Button onClick={remove}>Remove Resource</Button>}
        </Box>
        <ColumnLayout columns={2}>
          <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
            <FormField label={t('wizard.queues.computeResource.staticNodes')}>
              <Input
                value={computeResource.MinCount || 0}
                type="number"
                onChange={({detail}) => setMinCount(parseInt(detail.value))}
              />
            </FormField>
            <FormField label={t('wizard.queues.computeResource.dynamicNodes')}>
              <Input
                value={Math.max(
                  (computeResource.MaxCount || 0) -
                    (computeResource.MinCount || 0),
                  0,
                ).toString()}
                type="number"
                onChange={({detail}) => setMaxCount(parseInt(detail.value))}
              />
            </FormField>
          </div>
          <FormField
            label={t('wizard.queues.computeResource.instanceType')}
            errorText={typeError}
          >
            <Multiselect
              selectedOptions={instances.map(instance => ({
                value: instance.InstanceType,
                label: instance.InstanceType,
              }))}
              tokenLimit={3}
              onChange={setInstances}
              options={instanceOptions}
            />
          </FormField>
          {enableMemoryBasedScheduling && (
            <HelpTextInput
              name={t('wizard.queues.schedulableMemory.name')}
              path={path}
              errorsPath={errorsPath}
              configKey={'SchedulableMemory'}
              onChange={({detail}) =>
                setSchedulableMemory(
                  [...path, 'SchedulableMemory'],
                  detail.value,
                )
              }
              description={t('wizard.queues.schedulableMemory.description')}
              placeholder={t('wizard.queues.schedulableMemory.placeholder')}
              help={t('wizard.queues.schedulableMemory.help')}
              type="number"
            />
          )}
        </ColumnLayout>
        <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
          <Checkbox
            checked={disableHT}
            onChange={_e => {
              setDisableHT(!disableHT)
            }}
            description={t(
              'wizard.queues.computeResource.disableHT.description',
            )}
          >
            <Trans i18nKey="wizard.queues.computeResource.disableHT.label" />
          </Checkbox>
          <Checkbox
            disabled={
              !allInstancesSupportEFA(instances, efaInstances) || !canUseEFA
            }
            checked={enableEFA}
            onChange={_e => {
              setEnableEFA(!enableEFA)
            }}
          >
            <Trans i18nKey="wizard.queues.computeResource.enableEfa" />
          </Checkbox>
        </div>
      </div>
    </div>
  )
}

export function createComputeResource(
  queueIndex: number,
  crIndex: number,
): MultiInstanceComputeResource {
  return {
    Name: `queue${queueIndex}-compute-resource-${crIndex}`,
    Instances: [
      {
        InstanceType: defaultInstanceType,
      },
    ],
    MinCount: 0,
    MaxCount: 4,
  }
}

export function updateComputeResourcesNames(
  computeResources: MultiInstanceComputeResource[],
  newQueueName: string,
): MultiInstanceComputeResource[] {
  return computeResources.map((cr, i) => ({
    ...cr,
    Name: `${newQueueName}-compute-resource-${i}`,
  }))
}

export function validateComputeResources(
  computeResources: MultiInstanceComputeResource[],
): [boolean, QueueValidationErrors] {
  let errors = computeResources.reduce<QueueValidationErrors>((acc, cr, i) => {
    if (!cr.Instances || !cr.Instances.length) {
      acc[i] = 'instance_types_empty'
    }
    return acc
  }, {})
  return [Object.keys(errors).length === 0, errors]
}
