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
import axios from 'axios'
import { store, setState, getState, clearState, updateState, clearAllState } from './store'
import { enqueueSnackbar as enqueueSnackbarAction } from './redux/snackbar_actions';
import { closeSnackbar as closeSnackbarAction } from './redux/snackbar_actions';

// UI Elements
import Button from '@mui/material/Button';

function notify(text, type = 'info', duration = 5000, dismissButton = false) {
  const closeSnackbar = (...args) => store.dispatch(closeSnackbarAction(...args));
  store.dispatch(enqueueSnackbarAction(
    {message: text,
      options: {
        variant: type,
        anchorOrigin: {vertical: 'top', horizontal: 'right'},
        autoHideDuration: duration,
        ...(dismissButton ? {action: key => (
          <Button onClick={() => {closeSnackbar(key)}}>X</Button>
        )} : {})
      },}));
}

function getHost() {
  if (process.env.NODE_ENV !== 'production')
    return 'http://localhost:5000/';
  return '';
}

function request(method, url, body = null) {
  let host = getHost();

  const requestFunc = {'put': axios.put,
    'post': axios.post,
    'get': axios.get,
    'patch': axios.patch,
    'delete': axios.delete}[method]

  const region = getState(['app', 'selectedRegion']);
  url = host + ((region && !url.includes('region')) ?  `${url}&region=${region}` : url)
  const headers = {"Content-Type": "application/json"}

  return requestFunc(url, body, headers)
}

function CreateCluster(clusterName, clusterConfig, region, dryrun=false, successCallback=null, errorCallback=null) {
  const selectedRegion = getState(['app', 'selectedRegion']);
  var url = 'api?path=/v3/clusters';
  url += dryrun ? "&dryrun=true" : ""
  url += region ? `&region=${region}` : ""
  var body = {clusterName: clusterName, clusterConfiguration: clusterConfig}
  request('post', url, body).then(response => {
    if(response.status === 202) {
      if(!dryrun && region === selectedRegion) {
        notify("Successfully created: " + clusterName, 'success');
        updateState(['clusters', 'index', clusterName], (existing) => {return {...existing, ...response.data}});
      }
      successCallback && successCallback(response.data)
    } else {
      console.log(response)
      notify(`Error (${clusterName}): ${response.data.message}`, 'error');
    }
  }).catch(error => {
    if(error.response)
    {
      //notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
      errorCallback && errorCallback(error.response.data)
      console.log(error.response.data)
    }
  })
}

function UpdateCluster(clusterName, clusterConfig, dryrun=false, successCallback=null, errorCallback=null) {
  var url = `api?path=/v3/clusters/${clusterName}`;
  url += dryrun ? "&dryrun=true" : ""
  var body = {clusterConfiguration: clusterConfig}
  request('put', url, body).then(response => {
    if(response.status === 202) {
      if(!dryrun)
      {
        notify("Successfully Updated: " + clusterName, 'success')
        updateState(['clusters', 'index', clusterName], (existing) => {return {...existing, ...response.data}});
      }
      successCallback && successCallback(response.data)
    } else {
      console.log(response)
      notify(`Error (${clusterName}): ${response.data.message}`, 'error');
    }
  }).catch(error => {
    if(error.response)
    {
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
      errorCallback && errorCallback(error.response.data)
      console.log(error.response.data)
    }
  })
}

function DescribeCluster(clusterName) {
  var url = `api?path=/v3/clusters/${clusterName}`;
  request('get', url).then(response => {
    //console.log("Describe Success", response)
    if(response.status === 200) {
      updateState(['clusters', 'index', clusterName], (existing) => {return {...existing, ...response.data}});
    }
  }).catch(error => {
    if(error.response)
    {
      var selected = store.getState().clusters.selected
      if(selected === clusterName) {
        clearState(['app', 'clusters', 'selected']);
      } else {
        console.log(error.response)
        notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
      }
    }
    console.log(error)
  })
}

function DeleteCluster(clusterName, callback=null) {
  var url = `api?path=/v3/clusters/${clusterName}`;
  request('delete', url).then(response => {
    if(response.status === 200) {
      console.log("Delete Success", response)
      callback && callback(response.data)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function ListClusters() {
  var url = 'api?path=/v3/clusters';
  request('get', url).then(response => {
    //console.log("List Success", response)
    if(response.status === 200) {
      setState(['clusters', 'list'], response.data.clusters);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error: ${error.response.data.message}`, 'error');
    console.log(error)
  });
}

function GetConfiguration(clusterName, callback=null) {
  request('get', `manager/get_cluster_configuration?cluster_name=${clusterName}`).then(response => {
    console.log("Configuration Success", response)
    if(response.status === 200) {
      setState(['clusters', 'index', clusterName, 'configuration'], response.data);
      callback && callback(response.data)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function UpdateComputeFleet(clusterName, fleetStatus) {
  request('patch', `api?path=/v3/clusters/${clusterName}/computefleet`,
    {"status": fleetStatus}
    ).then(response => {
    //console.log("Configuration Success", response)
    if(response.status === 200) {
      DescribeCluster(clusterName);
      //store.dispatch({type: 'clusters/configuration', payload: response.data})
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function GetClusterInstances(clusterName, callback) {
  request('get', `api?path=/v3/clusters/${clusterName}/instances`
    ).then(response => {
    //console.log("Instances Success", response)
    if(response.status === 200)
    {
      callback && callback(response.data)
      setState(['clusters', 'index', clusterName, 'instances'], response.data.instances);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function GetClusterStackEvents(clusterName) {
  request('get', `api?path=/v3/clusters/${clusterName}/stackevents`
    ).then(response => {
    //console.log(response)
    if(response.status === 200)
      setState(['clusters', 'index', clusterName, 'stackevents'], response.data);
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function ListClusterLogStreams(clusterName) {
  request('get', `api?path=/v3/clusters/${clusterName}/logstreams`
    ).then(response => {
    //console.log(response)
    if(response.status === 200)
      setState(['clusters', 'index', clusterName, 'logstreams'], response.data);
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function GetClusterLogEvents(clusterName, logStreamName) {
  request('get', `api?path=/v3/clusters/${clusterName}/logstreams/${logStreamName}`
    ).then(response => {
    //console.log(response)
    if(response.status === 200) {
      setState(['clusters', 'index', clusterName, 'logEventIndex', logStreamName], response.data);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${clusterName}/${logStreamName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function ListCustomImages(imageStatus = "AVAILABLE", region, callback) {
  var url;
  if(region === null || region === undefined)
    url = `api?path=/v3/images/custom&imageStatus=${imageStatus}`;
  else
    url = `api?path=/v3/images/custom&imageStatus=${imageStatus}&region=${region}`;

  request('get', url
    ).then(response => {
    //console.log(response)
    if(response.status === 200) {
      const payload = response.data.images;
      if(callback)
        callback(response.data.images);
      else
        setState(['customImages', 'list'], payload);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error retrieving images: ${error.response.data.message}`, 'error', 10000, true);
    console.log(error)
  })
}

function DescribeCustomImage(imageId) {
  var url = `api?path=/v3/images/custom/${imageId}`;
  request('get', url).then(response => {
    //console.log("Describe Success", response)
    if(response.status === 200) {
      updateState(['customImages', 'index', imageId], (existing) => {return {...existing, ...response.data}});
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${imageId}): ${error.response.data.message}`, 'error', 10000, true);
    console.log(error)
  })
}

function GetCustomImageConfiguration(imageId, callback=null) {
  request('get', `manager/get_custom_image_configuration?image_id=${imageId}`).then(response => {
    console.log("Configuration Success", response)
    if(response.status === 200) {
      setState(['customImages', 'index', imageId, 'configuration'], response.data);
      callback && callback(response.data)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${imageId}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function BuildImage(imageId, imageConfig, successCallback=null, errorCallback=null) {
  var url = 'api?path=/v3/images/custom';
  var body = {imageId: imageId, imageConfiguration: imageConfig}
  request('post', url, body).then(response => {
    if(response.status === 202) {
      notify(`Successfully queued build for ${imageId}.`, 'success')
      updateState(['customImages', 'index', imageId], (existing) => {return {...existing, ...response.data}});
      successCallback && successCallback(response.data)
    } else {
      console.log(response)
      notify(`Error creating: ${imageId} -- ${response.data.message}`, 'error');
    }
  }).catch(error => {
    if(error.response)
    {
      notify(`Error creating: ${imageId} - ${error.response.data.message}`, 'error');
      errorCallback && errorCallback(error.response.data)
    }
    console.log(error.response.data)
  })
}

function ListOfficialImages(region, callback) {
  var url;
  if(region === null || region === undefined)
    url = `api?path=/v3/images/official`;
  else
    url = `api?path=/v3/images/official&region=${region}`;

  request('get', url
  ).then(response => {
    if(response.status === 200) {
      if(callback)
        callback(response.data.images);
      else
        setState(['officialImages', 'list'], response.data.images);
    } else {
      console.log(response)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error: ${error.response.data.message}`, 'error');
    console.log(error.response)
  })
}

function ListUsers() {
  var url = 'manager/list_users';
  request('get', url
  ).then(response => {
    if(response.status === 200) {
      console.log("userlist", response.data);
      let user_index = response.data.users.reduce((acc, user) => {acc[user.Username] = user; return acc}, {});
      setState(['users', 'index'], user_index);
    } else {
      console.log(response)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error: ${error.response.data.message}`, 'error');
    console.log(error.response)
  })
}

function SetUserRole(user, role, callback) {
  var url = 'manager/set_user_role';
  let body = {username: user.Username, role: role};
  request('put', url, body
  ).then(response => {
    if(response.status === 200) {
      if(response.data.Username) {
        setState(['users', 'index', response.data.Username], response.data);
        callback && callback(response.data);
      } else {
        console.log(response.data);
        notify(`Error updatin user: ${user}`, 'error');
      }
    } else {
      console.log(response)
    }
  }).catch(error => {
    if(error.response)
      notify(`Error: ${error.response.data.message}`, 'error');
    console.log(error.response)
  })
}

function GetCustomImageStackEvents(imageId) {
  request('get', `api?path=/v3/images/custom/${imageId}/stackevents`).then(response => {
    console.log(response)
    if(response.status === 200) {
      setState(['customImages', 'index', imageId, 'stackevents'], response.data);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error: ${imageId} -- ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function ListCustomImageLogStreams(imageId) {
  request('get', `api?path=/v3/images/custom/${imageId}/logstreams`).then(response => {
    if(response.status === 200) {
      setState(['customImages', 'index', imageId, 'logstreams'], response.data);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${imageId}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function GetCustomImageLogEvents(imageId, logStreamName) {
  request('get', `api?path=/v3/images/custom/${imageId}/logstreams/${encodeURIComponent(logStreamName)}`
    ).then(response => {
    //console.log(response)
    if(response.status === 200) {
      setState(['customImages', 'index', imageId, 'logEventIndex', logStreamName], response.data);
    }
  }).catch(error => {
    if(error.response)
      notify(`Error (${imageId}/${logStreamName}): ${error.response.data.message}`, 'error');
    console.log(error)
  })
}

function LoadAwsConfig(region = null, callback) {
  var url;

  ListCustomImages("AVAILABLE", region, images => setState(['app', 'wizard', 'customImages'], images));
  ListOfficialImages(region, images => setState(['app', 'wizard', 'officialImages'], images));

  if(region === null) {
    url = `manager/get_aws_configuration`
  } else {
    url = `manager/get_aws_configuration?region=${region}`
  }

  request('get', url).then(response => {
    if(response.status === 200) {
      console.log("aws", response.data);
      setState(['aws'], response.data);
    }
    callback && callback(response.data);
  }).catch(error => {
    if(error.response)
    {
      console.log(error.response)
      notify(`Error: ${error.response.data.message}`, 'error', 10000, true);
    }
    console.log(error)
  })
}

function Ec2Action(instanceIds, action, callback) {
  let url = `manager/ec2_action?instance_ids=${instanceIds.join(',')}&action=${action}`

  request('post', url).then(response => {
    if(response.status === 200) {
      console.log("ec2_action", response.data);
    }
    callback && callback(response.data);
  }).catch(error => {
    if(error.response)
    {
      console.log(error.response)
      notify(`Error: ${error.response.data.message}`, 'error', 10000, true);
    }
    console.log(error)
  })
}

function GetDcvSession(instanceId, user, callback) {
  const region = getState(['app', 'selectedRegion']) || getState(['aws', 'region']);
  let url = `manager/get_dcv_session?instance_id=${instanceId}&user=${user || 'ec2-user'}&region=${region}`
  request('get', url).then(response => {
    if(response.status === 200) {
      console.log(response.data)
      callback && callback(response.data)
    }
  }).catch(error => {
    if(error.response)
    {
      console.log(error.response)
      notify(`Error: ${error.response.data.message}`, 'error', 10000, true);
    }
    console.log(error)
  })
}

function GetIdentity(callback) {
  const url = "manager/get_identity"
  axios.get(getHost() + url).then(response => {
    if(response.status === 200) {
      setState(['identity'], response.data);
      callback && callback(response.data)
    }
  }).catch(error => {
    if(error.response)
    {
      console.log(error.response)
      notify(`Error: ${error.response.data.message}`, 'error', 10000, true);
    }
    console.log(error)
  })
}

function LoadInitialState() {
  const region = getState(['app', 'selectedRegion']);
  clearState(['app', 'aws']);
  clearAllState();
  GetIdentity((identity) => {
    let groups = identity['cognito:groups'];
    if((groups.includes("admin")) || (groups.includes("user")))
    {
      ListClusters();
      ListCustomImages();
      ListOfficialImages();
      LoadAwsConfig(region);
    }
  });
}

export {CreateCluster, UpdateCluster, ListClusters, DescribeCluster,
  GetConfiguration, DeleteCluster, UpdateComputeFleet, GetClusterInstances,
  GetClusterStackEvents, ListClusterLogStreams, GetClusterLogEvents,
  ListCustomImages, DescribeCustomImage, GetCustomImageConfiguration,
  BuildImage, GetCustomImageStackEvents, ListCustomImageLogStreams,
  GetCustomImageLogEvents, ListOfficialImages, LoadInitialState,
  Ec2Action,LoadAwsConfig, GetDcvSession, ListUsers, SetUserRole, notify}
