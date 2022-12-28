export type Queue = {
  Name: string
  AllocationStrategy: AllocationStrategy
  ComputeResources: MultiInstanceComputeResource[]
}

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

export type AllocationStrategy = 'lowest-price' | 'capacity-optimized'

export type ComputeResourceInstance = {InstanceType: string}

export type MultiInstanceComputeResource = ComputeResource & {
  Instances: ComputeResourceInstance[]
}

export type Tag = {
  Key: string
  Value: string
}

export type Subnet = {
  SubnetId: string
  AvailabilityZone: string
  AvailabilityZoneId: string
  VpcId: string
  Tags?: Tag[]
}
