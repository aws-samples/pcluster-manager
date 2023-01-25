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
import React from 'react'
import {useNavigate, useParams} from 'react-router-dom'

import {getState, useState} from '../../store'
import {getScripts} from './util'

// UI Elements
import Tabs from '@cloudscape-design/components/tabs'

// Components
import Accounting from './Accounting'
import StackEvents from './StackEvents'
import Instances from './Instances'
import Filesystems from './Filesystems'
import Scheduling from './Scheduling'
import Properties from './Properties'
import Logs from './Logs'
import Loading from '../../components/Loading'
import {useTranslation} from 'react-i18next'

export default function ClusterTabs() {
  const {t} = useTranslation()
  const clusterName = useState(['app', 'clusters', 'selected'])
  const clusterPath = ['clusters', 'index', clusterName]
  const cluster = useState(clusterPath)
  const customActions = useState([
    ...clusterPath,
    'config',
    'HeadNode',
    'CustomActions',
  ])
  const selectedClusterName = useState(['app', 'clusters', 'selected'])

  function isAccountingEnabled() {
    const accountingPath = [
      ...clusterPath,
      'config',
      'Scheduling',
      'SlurmSettings',
      'Database',
    ]
    return getState(accountingPath) ? true : false
  }

  let accountingEnabled = isAccountingEnabled()
  let navigate = useNavigate()
  let params = useParams()

  return cluster ? (
    <Tabs
      tabs={[
        {
          label: t('cluster.tabs.details'),
          id: 'details',
          content: <Properties />,
        },
        {
          label: t('cluster.tabs.instances'),
          id: 'instances',
          content: <Instances />,
        },
        {
          label: t('cluster.tabs.storage'),
          id: 'storage',
          content: <Filesystems />,
        },
        {
          label: t('cluster.tabs.scheduling'),
          id: 'scheduling',
          content: <Scheduling />,
        },
        ...(accountingEnabled
          ? [
              {
                label: t('cluster.tabs.accounting'),
                id: 'accounting',
                content: <Accounting />,
              },
            ]
          : []),
        {
          label: t('cluster.tabs.stackEvents'),
          id: 'stack-events',
          content: <StackEvents />,
        },
        {label: t('cluster.tabs.logs'), id: 'logs', content: <Logs />},
      ]}
      onChange={({detail}) => {
        navigate(`/clusters/${selectedClusterName}/${detail.activeTabId}`)
      }}
      activeTabId={params.tab || 'details'}
    />
  ) : (
    <div style={{textAlign: 'center', paddingTop: '40px'}}>
      <Loading />
    </div>
  )
}
