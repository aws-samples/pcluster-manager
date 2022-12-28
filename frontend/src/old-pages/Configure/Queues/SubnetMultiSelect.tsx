import {Multiselect, MultiselectProps} from '@cloudscape-design/components'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import React from 'react'
import {useMemo} from 'react'
import {useState} from '../../../store'
import {subnetName} from '../util'
import {Subnet} from './queues.types'

type SubnetMultiSelectProps = {
  value: string[]
  onChange: NonCancelableEventHandler<MultiselectProps.MultiselectChangeDetail>
}

function SubnetMultiSelect({value, onChange}: SubnetMultiSelectProps) {
  const vpc = useState(['app', 'wizard', 'vpc'])
  const subnets = useState(['aws', 'subnets'])
  const filteredSubnets: Subnet[] = useMemo(
    () =>
      subnets &&
      subnets.filter((s: Subnet) => {
        return vpc ? s.VpcId === vpc : true
      }),
    [subnets, vpc],
  )

  const subnetOptions = useMemo(() => {
    return filteredSubnets.map((subnet: Subnet) => {
      return {
        value: subnet.SubnetId,
        label: subnet.SubnetId,
        description:
          subnet.AvailabilityZone +
          ` - ${subnet.AvailabilityZoneId}` +
          (subnetName(subnet) ? ` (${subnetName(subnet)})` : ''),
      }
    })
  }, [filteredSubnets])

  return (
    <Multiselect
      selectedOptions={subnetOptions.filter(option => {
        return value.includes(option.value)
      })}
      onChange={onChange}
      options={subnetOptions}
    />
  )
}

export {SubnetMultiSelect}
