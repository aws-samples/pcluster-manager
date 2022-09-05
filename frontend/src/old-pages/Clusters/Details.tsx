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

import {useState} from '../../store'
import {getScripts} from './util'

// UI Elements
import Tabs from '@awsui/components-react/tabs'

// Components
import Accounting from './Accounting'
import StackEvents from './StackEvents'
import Instances from './Instances'
import Filesystems from './Filesystems'
import Scheduling from './Scheduling'
import Properties from './Properties'
import Logs from './Logs'
import Loading from '../../components/Loading'

export default function ClusterTabs() {
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

  let accountingEnabled = getScripts(customActions).includes('slurm-accounting')
  let navigate = useNavigate()
  let params = useParams()

  return cluster ? (
    <Tabs
      tabs={[
        {label: 'Details', id: 'details', content: <Properties />},
        {label: 'Instances', id: 'instances', content: <Instances />},
        {label: 'Storage', id: 'storage', content: <Filesystems />},
        {label: 'Job Scheduling', id: 'scheduling', content: <Scheduling />},
        ...(accountingEnabled
          ? [{label: 'Accounting', id: 'accounting', content: <Accounting />}]
          : []),
        {label: 'Stack Events', id: 'stack-events', content: <StackEvents />},
        {label: 'Logs', id: 'logs', content: <Logs />},
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
