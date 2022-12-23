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
import {ClusterInfoSummary} from './types/clusters'
import {
  clearAllState,
  clearState,
  getState,
  setState,
  updateState,
} from './store'
import {generateRandomId} from './util'

// UI Elements
import {AppConfig} from './app-config/types'
import {getAppConfig} from './app-config'
import {axiosInstance, executeRequest, HTTPMethod} from './http/executeRequest'
import {getCsrfToken} from './auth/getCsrfToken'
import {ILogger} from './logger/ILogger'
import {setCsrfTokenHeader} from './http/setCsrfTokenHeader'
import i18n from './i18n'

// Types
type Callback = (arg?: any) => void

function notify(text: any, type = 'info', id?: string, dismissible = true) {
  let messageId = id || generateRandomId()
  let newMessage = {
    type: type,
    content: text,
    id: messageId,
    dismissible: dismissible,
    onDismiss: () =>
      updateState(['app', 'messages'], (currentMessages: Array<any>) =>
        currentMessages.filter(message => message.id !== messageId),
      ),
  }

  const updateFn = (currentMessages: Array<any>) => {
    for (let message of currentMessages || [])
      if (message.id === messageId) {
        Object.assign(message, newMessage)
        return currentMessages
      }
    let newMessages = currentMessages || []
    newMessages.push(newMessage)
    return newMessages
  }

  updateState(['app', 'messages'], updateFn)
}

function request(method: HTTPMethod, url: string, body: any = undefined) {
  const appConfig: AppConfig = getState(['app', 'appConfig'])
  const region = getState(['app', 'selectedRegion'])

  url =
    region && !url.includes('region')
      ? url.includes('?')
        ? `${url}&region=${region}`
        : `${url}?region=${region}`
      : url

  return executeRequest(method, url, body, appConfig)
}

function CreateCluster(
  clusterName: any,
  clusterConfig: any,
  region: string,
  selectedRegion: string,
  disableRollback = false,
  dryrun = false,
  successCallback?: Callback,
  errorCallback?: Callback,
) {
  var url = 'api?path=/v3/clusters'
  url += dryrun ? '&dryrun=true' : ''
  url += disableRollback ? '&rollbackOnFailure=false' : ''
  url += region ? `&region=${region}` : ''
  var body = {clusterName: clusterName, clusterConfiguration: clusterConfig}
  request('post', url, body)
    .then((response: any) => {
      if (response.status === 202) {
        if (!dryrun && region === selectedRegion) {
          notify('Successfully created: ' + clusterName, 'success')
          updateState(['clusters', 'index', clusterName], (existing: any) => {
            return {...existing, ...response.data}
          })
        }
        successCallback && successCallback(response.data)
      } else {
        console.log(response)
        notify(`Error (${clusterName}): ${response.data.message}`, 'error')
      }
    })
    .catch((error: any) => {
      if (error.response) {
        errorCallback && errorCallback(error.response.data)
        console.log(error.response.data)
      }
    })
}

function UpdateCluster(
  clusterName: any,
  clusterConfig: any,
  dryrun = false,
  forceUpdate: any,
  successCallback?: Callback,
  errorCallback?: Callback,
) {
  var url = `api?path=/v3/clusters/${clusterName}`
  url += dryrun ? '&dryrun=true' : ''
  url += forceUpdate ? '&forceUpdate=true' : ''
  var body = {clusterConfiguration: clusterConfig}
  request('put', url, body)
    .then((response: any) => {
      if (response.status === 202) {
        if (!dryrun) {
          notify('Successfully Updated: ' + clusterName, 'success')
          updateState(['clusters', 'index', clusterName], (existing: any) => {
            return {...existing, ...response.data}
          })
        }
        successCallback && successCallback(response.data)
      } else {
        console.log(response)
        notify(`Error (${clusterName}): ${response.data.message}`, 'error')
      }
    })
    .catch((error: any) => {
      if (error.response) {
        errorCallback && errorCallback(error.response.data)
        console.log(error.response.data)
      }
    })
}

async function DescribeCluster(clusterName: string, errorCallback?: Callback) {
  var url = `api?path=/v3/clusters/${clusterName}`
  try {
    const response = await request('get', url)
    if (response.status === 200) {
      updateState(['clusters', 'index', clusterName], (existing: any) => {
        return {...existing, ...response.data}
      })
    }
    return response.data || {}
  } catch (error: any) {
    if (error.response) {
      errorCallback && errorCallback()
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error')
    }
    console.log(error)
    throw error
  }
}

function DeleteCluster(clusterName: any, callback?: Callback) {
  var url = `api?path=/v3/clusters/${clusterName}`
  request('delete', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('Delete Success', response)
        callback && callback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

async function ListClusters(): Promise<ClusterInfoSummary[]> {
  var url = 'api?path=/v3/clusters'
  try {
    const {data} = await request('get', url)
    setState(['clusters', 'list'], data?.clusters)
    return data?.clusters || []
  } catch (error) {
    if ((error as any).response) {
      notify(`Error: ${(error as any).response.data.message}`, 'error')
    }
    throw error
  }
}

function GetConfiguration(clusterName: any, callback?: Callback) {
  request(
    'get',
    `manager/get_cluster_configuration?cluster_name=${clusterName}`,
  )
    .then((response: any) => {
      console.log('Configuration Success', response)
      if (response.status === 200) {
        setState(
          ['clusters', 'index', clusterName, 'configuration'],
          response.data,
        )
        callback && callback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function UpdateComputeFleet(clusterName: any, fleetStatus: any) {
  request('patch', `api?path=/v3/clusters/${clusterName}/computefleet`, {
    status: fleetStatus,
  })
    .then((response: any) => {
      //console.log("Configuration Success", response)
      if (response.status === 200) {
        DescribeCluster(clusterName)
        //store.dispatch({type: 'clusters/configuration', payload: response.data})
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function GetClusterInstances(clusterName: any, callback?: Callback) {
  request('get', `api?path=/v3/clusters/${clusterName}/instances`)
    .then((response: any) => {
      //console.log("Instances Success", response)
      if (response.status === 200) {
        callback && callback(response.data)
        setState(
          ['clusters', 'index', clusterName, 'instances'],
          response.data.instances,
        )
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function GetClusterStackEvents(clusterName: any) {
  request('get', `api?path=/v3/clusters/${clusterName}/stackevents`)
    .then((response: any) => {
      //console.log(response)
      if (response.status === 200)
        setState(
          ['clusters', 'index', clusterName, 'stackevents'],
          response.data,
        )
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function ListClusterLogStreams(clusterName: any) {
  request('get', `api?path=/v3/clusters/${clusterName}/logstreams`)
    .then((response: any) => {
      //console.log(response)
      if (response.status === 200)
        setState(
          ['clusters', 'index', clusterName, 'logstreams'],
          response.data,
        )
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${clusterName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function GetClusterLogEvents(
  clusterName: any,
  logStreamName: any,
  successCallback?: Callback,
  failureCallback?: Callback,
) {
  let url = `api?path=/v3/clusters/${clusterName}/logstreams/${logStreamName}`
  request('get', url)
    .then((response: any) => {
      //console.log(response)
      if (response.status === 200) {
        setState(
          ['clusters', 'index', clusterName, 'logEventIndex', logStreamName],
          response.data,
        )
        successCallback && successCallback(response.data)
      }
    })
    .catch((error: any) => {
      failureCallback && failureCallback()
      if (error.response)
        notify(
          `Error (${clusterName}/${logStreamName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function ListCustomImages(
  imageStatus?: string,
  region?: string,
  callback?: Callback,
) {
  imageStatus ||= 'AVAILABLE'
  var url
  if (!region) url = `api?path=/v3/images/custom&imageStatus=${imageStatus}`
  else
    url = `api?path=/v3/images/custom&imageStatus=${imageStatus}&region=${region}`

  request('get', url)
    .then((response: any) => {
      //console.log(response)
      if (response.status === 200) {
        const payload = response.data.images
        if (callback) callback(response.data.images)
        else setState(['customImages', 'list'], payload)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error retrieving images: ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function DescribeCustomImage(imageId: any) {
  var url = `api?path=/v3/images/custom/${imageId}`
  request('get', url)
    .then((response: any) => {
      //console.log("Describe Success", response)
      if (response.status === 200) {
        updateState(['customImages', 'index', imageId], (existing: any) => {
          return {...existing, ...response.data}
        })
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error (${imageId}): ${error.response.data.message}`, 'error')
      console.log(error)
    })
}

function GetCustomImageConfiguration(imageId: any, callback?: Callback) {
  request('get', `manager/get_custom_image_configuration?image_id=${imageId}`)
    .then((response: any) => {
      console.log('Configuration Success', response)
      if (response.status === 200) {
        setState(
          ['customImages', 'index', imageId, 'configuration'],
          response.data,
        )
        callback && callback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error (${imageId}): ${error.response.data.message}`, 'error')
      console.log(error)
    })
}

function BuildImage(
  imageId: any,
  imageConfig: any,
  successCallback?: Callback,
  errorCallback?: Callback,
) {
  var url = 'api?path=/v3/images/custom'
  var body = {imageId: imageId, imageConfiguration: imageConfig}
  request('post', url, body)
    .then((response: any) => {
      if (response.status === 202) {
        notify(`Successfully queued build for ${imageId}.`, 'success')
        updateState(['customImages', 'index', imageId], (existing: any) => {
          return {...existing, ...response.data}
        })
        successCallback && successCallback(response.data)
      } else {
        console.log(response)
        notify(
          `Error creating: ${imageId} -- ${response.data.message}`,
          'error',
        )
      }
    })
    .catch((error: any) => {
      if (error.response) {
        notify(
          `Error creating: ${imageId} - ${error.response.data.message}`,
          'error',
        )
        errorCallback && errorCallback(error.response.data)
      }
      console.log(error.response.data)
    })
}

async function ListOfficialImages(region?: string) {
  const url = `api?path=/v3/images/official${region ? `&region=${region}` : ''}`
  try {
    const {data} = await request('get', url)
    return data?.images || []
  } catch (error) {
    if ((error as any).response) {
      notify(`Error: ${(error as any).response.data.message}`, 'error')
    }
    throw error
  }
}

function ListUsers() {
  var url = 'manager/list_users'
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('userlist', response.data)
        let user_index = response.data.users.reduce((acc: any, user: any) => {
          acc[user.Username] = user
          return acc
        }, {})
        setState(['users', 'index'], user_index)
      } else {
        console.log(response)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      console.log(error.response)
    })
}

function CreateUser(user: any, successCallback?: Callback) {
  var url = 'manager/create_user'
  request('post', url, user)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('user added:', response.data)
        let returned_user = response.data
        setState(['users', 'index', returned_user.Username], returned_user)
        return successCallback && successCallback(response.data)
      } else {
        console.log(response)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      console.log(error.response)
    })
}

function DeleteUser(user: any, successCallback?: Callback) {
  var url = `manager/delete_user?username=${user.Username}`
  request('delete', url)
    .then((response: any) => {
      if (response.status === 200) {
        let returned_user = response.data
        console.log(`user ${returned_user.Username} deleted`)
        return successCallback && successCallback(response.data)
      } else {
        console.log(response)
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      console.log(error.response)
    })
}

function GetCustomImageStackEvents(imageId: any) {
  request('get', `api?path=/v3/images/custom/${imageId}/stackevents`)
    .then((response: any) => {
      console.log(response)
      if (response.status === 200) {
        setState(
          ['customImages', 'index', imageId, 'stackevents'],
          response.data,
        )
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error: ${imageId} -- ${error.response.data.message}`, 'error')
      console.log(error)
    })
}

function ListCustomImageLogStreams(imageId: any) {
  request('get', `api?path=/v3/images/custom/${imageId}/logstreams`)
    .then((response: any) => {
      if (response.status === 200) {
        setState(
          ['customImages', 'index', imageId, 'logstreams'],
          response.data,
        )
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(`Error (${imageId}): ${error.response.data.message}`, 'error')
      console.log(error)
    })
}

function GetCustomImageLogEvents(imageId: any, logStreamName: any) {
  request(
    'get',
    `api?path=/v3/images/custom/${imageId}/logstreams/${encodeURIComponent(
      logStreamName,
    )}`,
  )
    .then((response: any) => {
      //console.log(response)
      if (response.status === 200) {
        setState(
          ['customImages', 'index', imageId, 'logEventIndex', logStreamName],
          response.data,
        )
      }
    })
    .catch((error: any) => {
      if (error.response)
        notify(
          `Error (${imageId}/${logStreamName}): ${error.response.data.message}`,
          'error',
        )
      console.log(error)
    })
}

function GetInstanceTypes(region?: string, callback?: Callback) {
  var url
  if (!region) {
    url = `manager/get_instance_types`
  } else {
    url = `manager/get_instance_types?region=${region}`
  }

  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        setState(['aws', 'instanceTypes'], response.data.instance_types)
      }
      callback && callback(response.data)
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function LoadAwsConfig(region?: string, callback?: Callback) {
  var url

  ListCustomImages('AVAILABLE', region, (images: any) =>
    setState(['app', 'wizard', 'customImages'], images),
  )
  ListOfficialImages(region).then(images =>
    setState(['app', 'wizard', 'officialImages'], images),
  )

  if (!region) {
    url = `manager/get_aws_configuration`
  } else {
    url = `manager/get_aws_configuration?region=${region}`
  }

  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('aws', response.data)
        const {fsx_filesystems, fsx_volumes, ...data} = response.data
        setState(['aws'], {
          fsxFilesystems: extractFsxFilesystems(fsx_filesystems),
          fsxVolumes: extractFsxVolumes(fsx_volumes),
          ...data,
        })
        GetInstanceTypes(region)
      }
      callback && callback(response.data)
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

const extractFsxFilesystems = (filesystems: any) => {
  const mappedFilesystems = filesystems
    .map((fs: any) => ({
      id: fs.FileSystemId,
      name: nameFromFilesystem(fs),
      type: fs.FileSystemType,
    }))
    .map((fs: any) => ({
      ...fs,
      displayName: `${fs.id} ${fs.name}`,
    }))

  return {
    lustre: mappedFilesystems.filter((fs: any) => fs.type === 'LUSTRE'),
    zfs: mappedFilesystems.filter((fs: any) => fs.type === 'OPENZFS'),
    ontap: mappedFilesystems.filter((fs: any) => fs.type === 'ONTAP'),
  }
}

const nameFromFilesystem = (filesystem: any) => {
  const {Tags: tags} = filesystem
  if (!tags) {
    return ''
  }
  const nameTag = filesystem.Tags.find((tag: any) => tag.Key === 'Name')
  return nameTag ? nameTag.Value : ''
}

const extractFsxVolumes = (volumes: any) => {
  const mappedVolumes = volumes
    .map((vol: any) => ({
      id: vol.VolumeId,
      name: vol.Name,
      type: vol.VolumeType,
    }))
    .map((vol: any) => ({
      ...vol,
      displayName: `${vol.id} ${vol.name}`,
    }))

  return {
    zfs: mappedVolumes.filter((vol: any) => vol.type === 'OPENZFS'),
    ontap: mappedVolumes.filter((vol: any) => vol.type === 'ONTAP'),
  }
}

function GetVersion() {
  var url = `manager/get_version`
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('api_version', response.data)
        var [major, minor, patch] = response.data.version.split('.')
        var major_int = parseInt(major)
        var minor_int = parseInt(minor)
        setState(['app', 'version'], {
          full: response.data.version,
          major: major_int,
          minor: minor_int,
          patch: patch,
        })
        setState(['app', 'enableMfa'], response.data.enable_mfa)
      }
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function Ec2Action(instanceIds: any, action: any, callback?: Callback) {
  let url = `manager/ec2_action?instance_ids=${instanceIds.join(
    ',',
  )}&action=${action}`

  request('post', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log('ec2_action', response.data)
      }
      callback && callback(response.data)
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function GetDcvSession(instanceId: any, user: any, callback?: Callback) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  let url = `manager/get_dcv_session?instance_id=${instanceId}&user=${
    user || 'ec2-user'
  }&region=${region}`
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        callback && callback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

// Queue Operations
function QueueStatus(
  clusterName: any,
  instanceId: any,
  user: any,
  successCallback?: Callback,
) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  let url = `manager/queue_status?instance_id=${instanceId}&user=${
    user || 'ec2-user'
  }&region=${region}`
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        setState(['clusters', 'index', clusterName, 'jobs'], response.data.jobs)
        successCallback && successCallback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function CancelJob(
  instanceId: any,
  user: any,
  jobId: any,
  callback?: Callback,
) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  let url = `manager/cancel_job?instance_id=${instanceId}&user=${
    user || 'ec2-user'
  }&region=${region}&job_id=${jobId}`
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        callback && callback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function JobInfo(
  instanceId: any,
  user: any,
  jobId: any,
  successCallback?: Callback,
  failureCallback?: Callback,
) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  let url = `manager/scontrol_job?instance_id=${instanceId}&user=${
    user || 'ec2-user'
  }&region=${region}&job_id=${jobId}`
  request('get', url)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        successCallback && successCallback(response.data)
      }
    })
    .catch((error: any) => {
      console.log('jif', error)
      if (error.response) {
        failureCallback && failureCallback(error.response)
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function SlurmAccounting(
  clusterName: any,
  instanceId: any,
  user: any,
  args: any,
  successCallback?: Callback,
  failureCallback?: Callback,
) {
  const region =
    getState(['app', 'selectedRegion']) || getState(['aws', 'region'])
  let url = `manager/sacct?instance_id=${instanceId}&cluster_name=${clusterName}&user=${
    user || 'ec2-user'
  }&region=${region}`
  request('post', url, args)
    .then((response: any) => {
      if (response.status === 200) {
        console.log(response.data)
        successCallback && successCallback(response.data)
      }
    })
    .catch((error: any) => {
      if (error.response) {
        failureCallback && failureCallback(error.response)
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

function GetIdentity(successCallback?: Callback) {
  const url = 'manager/get_identity'
  request('get', url)
    .then(response => {
      if (response.status === 200) {
        setState(['identity'], response.data)
        successCallback && successCallback(response.data)
      }
    })
    .catch(error => {
      if (error.response) {
        console.log(error.response)
        notify(`Error: ${error.response.data.message}`, 'error')
      }
      console.log(error)
    })
}

async function GetAppConfig() {
  try {
    const appConfig = await getAppConfig(axiosInstance)
    setState(['app', 'appConfig'], appConfig)
    return appConfig
  } catch (error) {
    if ((error as any).response) {
      notify(`Error: ${(error as any).response.data.message}`, 'error')
    }
    throw error
  }
}

async function LoadCsrfToken(logger: ILogger): Promise<string | null> {
  try {
    const token = await getCsrfToken(axiosInstance)
    setCsrfTokenHeader(axiosInstance, token)
    logger.info(`Set X-CSRF-Token header to ${token}`)
    return token
  } catch (error) {
    logger.error('Could not fetch CSRF token')
    notify(i18n.t('global.errors.csrfError'), 'error')
    return null
  }
}

async function LoadInitialState(logger: ILogger) {
  const region = getState(['app', 'selectedRegion'])
  clearState(['app', 'aws'])
  clearAllState()
  await LoadCsrfToken(logger)
  GetVersion()
  await GetAppConfig()
  GetIdentity(_ => {
    ListUsers()
    ListClusters()
    ListCustomImages()
    ListOfficialImages()
    LoadAwsConfig(region)
  })
}

export {
  CreateCluster,
  UpdateCluster,
  ListClusters,
  DescribeCluster,
  GetConfiguration,
  DeleteCluster,
  UpdateComputeFleet,
  GetClusterInstances,
  GetClusterStackEvents,
  ListClusterLogStreams,
  GetClusterLogEvents,
  ListCustomImages,
  DescribeCustomImage,
  GetCustomImageConfiguration,
  BuildImage,
  GetCustomImageStackEvents,
  ListCustomImageLogStreams,
  GetCustomImageLogEvents,
  ListOfficialImages,
  LoadInitialState,
  Ec2Action,
  LoadAwsConfig,
  GetDcvSession,
  QueueStatus,
  CancelJob,
  SlurmAccounting,
  JobInfo,
  ListUsers,
  notify,
  CreateUser,
  DeleteUser,
}
