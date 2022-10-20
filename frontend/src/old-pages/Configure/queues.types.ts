export type QueueValidationErrors = Record<
  number,
  'instance_type_unique' | 'instance_types_empty'
>

export type ComputeResource = {
  Name: string
  MinCount: number
  MaxCount: number
}

export type SingleInstanceComputeResource = ComputeResource & {
  InstanceType: string
}

export type CRAllocationStrategy = 'lowest-price' | 'capacity-optimized'

export type MultiInstanceComputeResource = ComputeResource & {
  InstanceTypes: string[]
  AllocationStrategy: CRAllocationStrategy
}
