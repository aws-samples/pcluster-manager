import {
  Box,
  Button,
  ColumnLayout,
  FormField,
  Input,
  Multiselect,
  MultiselectProps,
  Select,
  Toggle,
} from '@awsui/components-react'
import {NonCancelableEventHandler} from '@awsui/components-react/internal/events'
import {useCallback, useMemo} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {clearState, setState, useState} from '../../../store'
import {HelpTextInput, useInstanceGroups} from '../Components'
import {
  CRAllocationStrategy,
  MultiInstanceComputeResource,
  QueueValidationErrors,
} from './queues.types'

const queuesPath = ['app', 'wizard', 'config', 'Scheduling', 'SlurmQueues']
const queuesErrorsPath = ['app', 'wizard', 'errors', 'queues']
const defaultInstanceType = 'c5n.large'

const useAllocationStrategyOptions = () => {
  const {t} = useTranslation()
  const options = useMemo(
    () => [
      {
        label: t('wizard.queues.allocationStrategy.lowestPrice'),
        value: 'lowest-price',
      },
      {
        label: t('wizard.queues.allocationStrategy.capacityOptimized'),
        value: 'capacity-optimized',
      },
    ],
    [t],
  )
  return options
}

export function allInstancesSupportEFA(
  instanceTypes: string[],
  efaInstances: Set<string>,
): boolean {
  if (!instanceTypes || !instanceTypes.length) {
    return false
  }
  return instanceTypes.every(instance => efaInstances.has(instance))
}

export function ComputeResource({index, queueIndex, computeResource}: any) {
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
  const allocationStrategyOptions = useAllocationStrategyOptions()

  const instanceTypePath = useMemo(() => [...path, 'InstanceTypes'], [path])
  const instanceTypes: string[] = useState(instanceTypePath) || []
  const allocationStrategy: CRAllocationStrategy = useState([
    ...path,
    'AllocationStrategy',
  ])

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

  const efaPath = [...path, 'Efa']

  const efaInstances = new Set<string>(useState(['aws', 'efa_instance_types']))
  const enableEFAPath = [...path, 'Efa', 'Enabled']
  const enableEFA = useState(enableEFAPath) || false

  const enablePlacementGroupPath = [
    ...parentPath,
    'Networking',
    'PlacementGroup',
    'Enabled',
  ]

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
        setState(enableEFAPath, enable)
        setState(enablePlacementGroupPath, enable)
      } else {
        clearState(efaPath)
        clearState(enablePlacementGroupPath)
      }
    },
    [efaPath, enablePlacementGroupPath, enableEFAPath],
  )

  const setAllocationStrategy = useCallback(
    ({detail}) => {
      setState([...path, 'AllocationStrategy'], detail.selectedOption.value)
    },
    [path],
  )

  const setInstanceTypes: NonCancelableEventHandler<MultiselectProps.MultiselectChangeDetail> =
    useCallback(
      ({detail}) => {
        const selectedInstanceTypes = (detail.selectedOptions.map(
          option => option.value,
        ) || []) as string[]
        setState(instanceTypePath, selectedInstanceTypes)
        if (!allInstancesSupportEFA(selectedInstanceTypes, efaInstances)) {
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
              selectedOptions={instanceTypes.map(instance => ({
                value: instance,
                label: instance,
              }))}
              tokenLimit={3}
              onChange={setInstanceTypes}
              options={instanceOptions}
            />
          </FormField>
          <FormField label={t('wizard.queues.allocationStrategy.title')}>
            <Select
              options={allocationStrategyOptions}
              selectedOption={
                allocationStrategyOptions.find(
                  as => as.value === allocationStrategy,
                )!
              }
              onChange={setAllocationStrategy}
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
          <Toggle
            checked={disableHT}
            onChange={_e => {
              setDisableHT(!disableHT)
            }}
          >
            <Trans i18nKey="wizard.queues.computeResource.disableHT" />
          </Toggle>
          <Toggle
            disabled={!allInstancesSupportEFA(instanceTypes, efaInstances)}
            checked={enableEFA}
            onChange={_e => {
              setEnableEFA(!enableEFA)
            }}
          >
            <Trans i18nKey="wizard.queues.computeResource.enableEfa" />
          </Toggle>
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
    InstanceTypes: [defaultInstanceType],
    AllocationStrategy: 'lowest-price',
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
    if (!cr.InstanceTypes || !cr.InstanceTypes.length) {
      acc[i] = 'instance_types_empty'
    }
    return acc
  }, {})
  return [Object.keys(errors).length === 0, errors]
}
