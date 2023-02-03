// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import {Region} from '../../types/base'
import {ClusterName, ComputeFleetStatus} from '../../types/clusters'
import {InstanceState, Instance, NodeType} from '../../types/instances'
import React from 'react'
import {useNavigate} from 'react-router-dom'
import {useTranslation} from 'react-i18next'

import {GetClusterInstances, Ec2Action} from '../../model'
import {
  setState,
  clearState,
  useState,
  getState,
  consoleDomain,
} from '../../store'

// UI Elements
import {
  Button,
  Header,
  Link,
  Pagination,
  SpaceBetween,
  Table,
  TextFilter,
} from '@cloudscape-design/components'

import {useCollection} from '@cloudscape-design/collection-hooks'

// Components
import {InstanceStatusIndicator} from '../../components/Status'
import EmptyState from '../../components/EmptyState'
import DateView from '../../components/date/DateView'

function InstanceActions({instance}: {instance?: Instance}) {
  const {t} = useTranslation()
  const navigate = useNavigate()

  const clusterName = useState(['app', 'clusters', 'selected'])
  const fleetStatus: ComputeFleetStatus = useState([
    'clusters',
    'index',
    clusterName,
    'computeFleetStatus',
  ])
  const logHref = `/clusters/${clusterName}/logs?instance=${
    instance && instance.instanceId
  }`
  const [startPending, setStartPending] = React.useState(false)
  const [stopPending, setStopPending] = React.useState(false)

  const resetPending = () => {
    setStopPending(false)
    setStartPending(false)
  }

  const refresh = () => {
    const clusterName = getState(['app', 'clusters', 'selected'])
    clusterName &&
      GetClusterInstances(clusterName, () => {
        resetPending
      })
  }

  const stopInstance = React.useCallback(
    (instance: Instance) => {
      setStopPending(true)
      Ec2Action([instance.instanceId], 'stop_instances', refresh)
    },
    [instance],
  )

  const startInstance = React.useCallback(
    (instance: Instance) => {
      setStartPending(true)
      Ec2Action([instance.instanceId], 'start_instances', refresh)
    },
    [instance],
  )

  const isComputeFleetStopped = React.useMemo(
    () => fleetStatus === ComputeFleetStatus.Stopped,
    [fleetStatus],
  )
  const isHeadNodeRunning = React.useMemo(
    () =>
      instance &&
      instance.nodeType === NodeType.HeadNode &&
      instance.state === InstanceState.Running,
    [instance],
  )
  const isHeadNodeStopped = React.useMemo(
    () =>
      instance &&
      instance.nodeType === NodeType.HeadNode &&
      instance.state === InstanceState.Stopped,
    [instance],
  )

  return (
    <SpaceBetween direction="horizontal" size="s">
      <Button
        disabled={!(instance && isComputeFleetStopped && isHeadNodeRunning)}
        loading={stopPending}
        onClick={() => {
          stopInstance(instance!)
        }}
      >
        {t('cluster.instances.actions.stop')}
      </Button>
      <Button
        disabled={!(instance && isComputeFleetStopped && isHeadNodeStopped)}
        loading={startPending}
        onClick={() => {
          startInstance(instance!)
        }}
      >
        {t('cluster.instances.actions.start')}
      </Button>
      <Button
        href={logHref}
        disabled={!instance}
        onClick={e => {
          navigate(logHref)
          e.preventDefault()
        }}
      >
        {t('cluster.instances.actions.logs')}
      </Button>
    </SpaceBetween>
  )
}

export default function ClusterInstances() {
  let defaultRegion = useState(['aws', 'region']) || ''
  const region: Region = useState(['app', 'selectedRegion']) || defaultRegion
  const {t} = useTranslation()

  const clusterName: ClusterName = useState(['app', 'clusters', 'selected'])
  const instances: Instance[] = useState([
    'clusters',
    'index',
    clusterName,
    'instances',
  ])
  const [selectedInstances, setSelectedInstances] = React.useState<Instance[]>(
    [],
  )

  const onSelectionChangeCallback = React.useCallback(({detail}) => {
    setSelectedInstances(detail.selectedItems)
  }, [])

  React.useEffect(() => {
    const tick = () => {
      const clusterName = getState(['app', 'clusters', 'selected'])
      clusterName && GetClusterInstances(clusterName)
    }
    const clusterName = getState(['app', 'clusters', 'selected'])
    clusterName && GetClusterInstances(clusterName)
    const timerId = setInterval(tick, 10000)
    return () => {
      clearInterval(timerId)
    }
  }, [])

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(instances || [], {
    filtering: {
      empty: (
        <EmptyState
          title={t('cluster.instances.filtering.empty.title')}
          subtitle={t('cluster.instances.filtering.empty.subtitle')}
          action={<span>:(</span>}
        />
      ),
      noMatch: (
        <EmptyState
          title={t('cluster.instances.filtering.noMatch.title')}
          subtitle={t('cluster.instances.filtering.noMatch.subtitle')}
          action={
            <Button onClick={() => actions.setFiltering('')}>
              {t('cluster.instances.filtering.clearFilter')}
            </Button>
          }
        />
      ),
    },
    pagination: {pageSize: 10},
    sorting: {},
    selection: {},
  })

  return (
    <Table
      {...collectionProps}
      header={
        <Header
          variant="h3"
          description=""
          counter={instances && `(${instances.length})`}
          actions={<InstanceActions instance={selectedInstances[0]} />}
        >
          {t('cluster.instances.title')}
        </Header>
      }
      trackBy="instanceId"
      columnDefinitions={[
        {
          id: 'id',
          header: t('cluster.instances.id'),
          cell: instance => (
            <Link
              external
              externalIconAriaLabel={t('global.openNewTab')}
              href={`${consoleDomain(
                region,
              )}/ec2/v2/home?region=${region}#InstanceDetails:instanceId=${
                instance.instanceId
              }`}
            >
              {instance.instanceId}
            </Link>
          ),
          sortingField: 'instanceId',
        },
        {
          id: 'instance-type',
          header: t('cluster.instances.instance'),
          cell: instance => instance.instanceType,
          sortingField: 'instanceType',
        },
        {
          id: 'launch-time',
          header: t('cluster.instances.launchedTime'),
          cell: instance => <DateView date={instance.launchTime} />,
          sortingField: 'launchTime',
        },
        {
          id: 'node-type',
          header: t('cluster.instances.type'),
          cell: instance => instance.nodeType,
          sortingField: 'nodeType',
        },
        {
          id: 'private-ip',
          header: t('cluster.instances.privateIp'),
          cell: instance => instance.privateIpAddress,
          sortingField: 'privateIpAddress',
        },
        {
          id: 'public-ip',
          header: t('cluster.instances.publicIp'),
          cell: instance => instance.publicIpAddress,
          sortingField: 'publicIpAddress',
        },
        {
          id: 'state',
          header: t('cluster.instances.state'),
          cell: instance => <InstanceStatusIndicator instance={instance} />,
          sortingField: 'state',
        },
      ]}
      selectionType="single"
      selectedItems={selectedInstances}
      onSelectionChange={onSelectionChangeCallback}
      loading={instances === null}
      items={items}
      loadingText="Loading instances..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter instances"
        />
      }
    />
  )
}
