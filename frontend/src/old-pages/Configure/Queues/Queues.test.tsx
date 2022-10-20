import {
  allInstancesSupportEFA,
  createComputeResource,
  validateComputeResources,
} from './MultiInstanceComputeResource'

describe('Given a list of instances', () => {
  const subject = allInstancesSupportEFA
  const efaInstances = new Set<string>(['t2.micro', 't2.medium'])

  describe("when it's empty", () => {
    it('should deactivate EFA', () => {
      expect(subject([], efaInstances)).toBe(false)
    })
  })

  describe('when every instance supports EFA', () => {
    it('should enable EFA', () => {
      expect(
        subject(
          [{InstanceType: 't2.micro'}, {InstanceType: 't2.medium'}],
          efaInstances,
        ),
      ).toBe(true)
    })
  })

  describe('when not every instance supports EFA', () => {
    it('should deactivate EFA', () => {
      expect(
        subject(
          [{InstanceType: 't2.micro'}, {InstanceType: 't2.large'}],
          efaInstances,
        ),
      ).toBe(false)
    })
  })
})

describe('Given a list of queues', () => {
  const subject = createComputeResource
  describe('when creating a new compute resource', () => {
    it('should create it with a default instance type', () => {
      expect(subject(0, 0).Instances).toHaveLength(1)
    })
  })
})

describe('Given a list of compute resources', () => {
  const subject = validateComputeResources
  describe('when all of them have at least one instance type', () => {
    it('should not return an error', () => {
      const [valid] = subject([
        {
          Name: 'test1',
          MinCount: 0,
          MaxCount: 2,
          Instances: [{InstanceType: 't2.micro'}, {InstanceType: 't2.medium'}],
        },
        {
          Name: 'test2',
          MinCount: 0,
          MaxCount: 2,
          Instances: [{InstanceType: 't2.micro'}],
        },
      ])

      expect(valid).toBe(true)
    })
  })

  describe('when one of these compute resources has no instance types', () => {
    it('should return a validation error', () => {
      const [valid, errors] = subject([
        {
          Name: 'test1',
          MinCount: 0,
          MaxCount: 2,
          Instances: [{InstanceType: 't2.micro'}, {InstanceType: 't2.medium'}],
        },
        {
          Name: 'test2',
          MinCount: 0,
          MaxCount: 2,
          Instances: [],
        },
      ])

      expect(valid).toBe(false)
      expect(errors[1]).toBe('instance_types_empty')
    })
  })
})
