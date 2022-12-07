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
import {ClusterStatus} from '../../types/clusters'
import React from 'react'
import {useNavigate} from 'react-router-dom'

// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'js-y... Remove this comment to see the full error message
import jsyaml from 'js-yaml'

import {setState, useState, ssmPolicy, consoleDomain} from '../../store'
import {
  UpdateComputeFleet,
  GetConfiguration,
  GetDcvSession,
  DeleteCluster,
  DescribeCluster,
  ListClusters,
} from '../../model'
import {findFirst, clusterDefaultUser} from '../../util'
import {loadTemplate} from '../Configure/util'
import {useTranslation} from 'react-i18next'

import Button from '@cloudscape-design/components/button'
import SpaceBetween from '@cloudscape-design/components/space-between'

import {
  DeleteDialog,
  showDialog,
  hideDialog,
} from '../../components/DeleteDialog'
import {StopDialog, stopComputeFleet} from './StopDialog'

export default function Actions() {
  const clusterName = useState(['app', 'clusters', 'selected'])
  const clusterPath = ['clusters', 'index', clusterName]
  const cluster = useState(clusterPath)
  const defaultRegion = useState(['aws', 'region'])
  const region = useState(['app', 'selectedRegion']) || defaultRegion
  const headNode = useState([...clusterPath, 'headNode'])
  let navigate = useNavigate()
  const {t} = useTranslation()

  const apiVersion = useState(['app', 'version', 'full'])
  const clusterVersion = useState([...clusterPath, 'version'])

  const fleetStatus = useState([...clusterPath, 'computeFleetStatus'])
  const clusterStatus = useState([...clusterPath, 'clusterStatus'])
  const dcvEnabled = useState([
    ...clusterPath,
    'config',
    'HeadNode',
    'Dcv',
    'Enabled',
  ])

  function isSsmPolicy(p: any) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy(region)
  }
  const iamPolicies = useState([
    ...clusterPath,
    'config',
    'HeadNode',
    'Iam',
    'AdditionalIamPolicies',
  ])
  const ssmEnabled = iamPolicies && findFirst(iamPolicies, isSsmPolicy)

  const startFleet = () => {
    UpdateComputeFleet(clusterName, 'START_REQUESTED')
  }

  const editConfiguration = () => {
    setState(['app', 'wizard', 'clusterName'], clusterName)
    setState(['app', 'wizard', 'page'], 'cluster')
    setState(['app', 'wizard', 'editing'], true)

    navigate('/configure')

    GetConfiguration(clusterName, (configuration: any) => {
      loadTemplate(jsyaml.load(configuration))
    })
  }

  const deleteCluster = () => {
    console.log(`Deleting: ${clusterName}`)
    DeleteCluster(clusterName, (_resp: any) => {
      DescribeCluster(clusterName)
      ListClusters()
    })
    hideDialog('deleteCluster')
  }

  const shellCluster = (instanceId: any) => {
    window.open(
      `${consoleDomain(
        region,
      )}/systems-manager/session-manager/${instanceId}?region=${region}`,
    )
  }

  const ssmFilesystem = (instanceId: any) => {
    let user = clusterDefaultUser(cluster)
    const path = encodeURIComponent(`/home/${user}/`)
    window.open(
      `${consoleDomain(
        region,
      )}/systems-manager/managed-instances/${instanceId}/file-system?region=${region}&osplatform=Linux#%7B%22path%22%3A%22${path}%22%7D`,
    )
  }

  const dcvConnect = (instance: any) => {
    let callback = (dcvInfo: any) => {
      window.open(
        `https://${instance.publicIpAddress}:${dcvInfo.port}?authToken=${dcvInfo.session_token}#${dcvInfo.session_id}`,
      )
    }
    let user = clusterDefaultUser(cluster)
    GetDcvSession(instance.instanceId, user, callback)
  }

  return (
    <div style={{marginLeft: '20px'}}>
      <DeleteDialog
        id="deleteCluster"
        header="Delete Cluster?"
        deleteCallback={deleteCluster}
      >
        {t('cluster.list.dialogs.delete', {clusterName: clusterName})}
      </DeleteDialog>
      <StopDialog clusterName={clusterName} />
      <SpaceBetween direction="horizontal" size="xs">
        <Button
          iconName="edit"
          className="action"
          disabled={
            clusterStatus === ClusterStatus.CreateInProgress ||
            clusterStatus === ClusterStatus.DeleteInProgress ||
            clusterStatus === ClusterStatus.CreateFailed ||
            clusterVersion !== apiVersion
          }
          variant="normal"
          onClick={editConfiguration}
        >
          {t('cluster.list.actions.edit')}
        </Button>
        {fleetStatus === 'STOPPED' && (
          <Button iconName="status-positive" variant="normal" onClick={startFleet}>
            {t('cluster.list.actions.start')}
          </Button>
        )}
        {fleetStatus === 'RUNNING' && (
          <Button iconName="status-stopped" variant="normal" onClick={stopComputeFleet}>
            {t('cluster.list.actions.stop')}
          </Button>
        )}
        <Button
          iconName="close"
          disabled={clusterStatus === ClusterStatus.DeleteInProgress}
          onClick={() => {
            showDialog('deleteCluster')
          }}
        >
          {t('cluster.list.actions.delete')}
        </Button>
        {headNode &&
          headNode.publicIpAddress &&
          headNode.publicIpAddress !== '' &&
          ssmEnabled && (
            <Button
              iconName="folder-open"
              disabled={clusterStatus === ClusterStatus.DeleteInProgress}
              onClick={() => {
                ssmFilesystem(headNode.instanceId)
              }}
            >
              {t('cluster.list.actions.filesystem')}
            </Button>
          )}
        {headNode &&
          headNode.publicIpAddress &&
          headNode.publicIpAddress !== '' &&
          ssmEnabled && (
            <Button
              iconName="caret-right-filled"
              disabled={clusterStatus === ClusterStatus.DeleteInProgress}
              onClick={() => {
                shellCluster(headNode.instanceId)
              }}
            >
              {t('cluster.list.actions.shell')}
            </Button>
          )}
        {headNode &&
          headNode.publicIpAddress &&
          headNode.publicIpAddress !== '' &&
          dcvEnabled && (
            <Button
              disabled={clusterStatus === ClusterStatus.DeleteInProgress}
              onClick={() => {
                dcvConnect(headNode)
              }}
            >
              {t('cluster.list.actions.dcv')}
            </Button>
          )}
      </SpaceBetween>
    </div>
  )
}
