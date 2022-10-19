export type QueueValidationErrors = Record<number, 'instance_type_unique'>

export type ComputeResource = {
  Name: string
  MinCount: number
  MaxCount: number
}

export type SingleInstanceComputeResource = ComputeResource & {
  InstanceType: string
}
