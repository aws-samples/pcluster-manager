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
import React from 'react';

// Model
import { ListClusterLogStreams, GetClusterLogEvents } from '../../model'
import { clearState, getState, setState, useState } from '../../store'

// UI Elements
import Loading from '../../components/Loading'
import {
  Button,
  ExpandableSection
} from "@awsui/components-react";

function LogEvents() {
  const selected = getState(['app', 'clusters', 'selected']);
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);
  const events = useState(['clusters', 'index', selected, 'logEventIndex', selectedLogStreamName]);

  const pending = useState(['app', 'clusters', 'logs', 'pending']);

  const refresh = () => {
    setState(['app', 'clusters', 'logs', 'pending'], true);
    const clusterName = getState(['app', 'clusters', 'selected']);
    const logStreamName = getState(['app', 'clusters', 'selectedLogStreamName']);
    if(clusterName && logStreamName)
    {
      GetClusterLogEvents(clusterName, logStreamName, () => clearState(['app', 'clusters', 'logs', 'pending']), () => clearState(['app', 'clusters', 'logs', 'pending']));
    }
  }

  return <div><div style={{marginBottom: "10px", display: "flex", direction: "row", gap: "16px", alignItems: "center"}}><div>{selectedLogStreamName}</div><Button loading={pending} onClick={refresh}>Refresh</Button></div>
    <div style={{borderTop: "1px solid #AAA", fontSize: "10pt", overflow: "auto", whiteSpace: "nowrap"}}>
      {events.events.map((event, i) => <div key={event.timestamp + i.toString()} title={event.timestamp}>{event.message}</div>)}
    </div>
  </div>
}

function StreamList({instanceId}) {
  const logStreamIndex = useState(['app', 'clusters', 'logs', 'index']);
  const logStreams = logStreamIndex[instanceId].streams;
  const ip = logStreamIndex[instanceId].ip;
  const fnames = Object.keys(logStreams).sort()
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);

  const select = (logStream) => {
    const logStreamName = logStream.logStreamName;
    const selected = getState(['app', 'clusters', 'selected']);
    setState(['app', 'clusters', 'selectedLogStreamName'], logStreamName);
    GetClusterLogEvents(selected, logStreamName);
  }

  return <div title={instanceId}>
    <ExpandableSection header={ip}>
      {fnames.map((fname) => <div onClick={() => select(logStreams[fname])} style={{marginLeft: '10px', cursor: 'pointer', fontWeight: selectedLogStreamName === logStreams[fname].logStreamName ? 'bold' : 'normal'}}>{fname}</div>)}
    </ExpandableSection>
  </div>
}

function LogStreamList() {
  const logStreamIndex = useState(['app', 'clusters', 'logs', 'index']);
  const selected = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', selected];
  const headNode = useState([...clusterPath, 'headNode']);
  const instanceId = (headNode && headNode.instanceId) || '';
  return <div style={{width: "150px"}}>
    <div><b>HeadNode</b></div>
    {instanceId && <StreamList instanceId={instanceId} />}
    <div><b>Compute</b></div>
    {Object.keys(logStreamIndex).filter(k => k !== instanceId).sort().map(instanceId => <StreamList instanceId={instanceId} />)}
  </div>
}

export default function ClusterLogs() {
  const selected = getState(['app', 'clusters', 'selected']);
  const logStreamIndexPath = ['app', 'clusters', 'logs', 'index'];
  const streams = useState(['clusters', 'index', selected, 'logstreams']);
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);
  const logEvents = useState(['clusters', 'index', selected, 'logEventIndex', selectedLogStreamName]);

  for(let stream of ((streams && streams['logStreams']) || []))
  {
    let [ip, id, fname] = stream.logStreamName.split('.');
    if(!getState([...logStreamIndexPath, id, 'streams', fname]))
    {
      setState([...logStreamIndexPath, id, 'streams', fname], stream);
      setState([...logStreamIndexPath, id, 'ip'], ip);
    }
  }


  React.useEffect(() => {
    const selected = getState(['app', 'clusters', 'selected']);
    ListClusterLogStreams(selected);
  }, []);

  return <div>
    { streams ?
      <div style={{display: 'flex', flexDirection: 'row'}}>
          <LogStreamList />
        <div style={{width: "calc(100% - 165px)", overflowX: "auto"}}>
          {selectedLogStreamName && (logEvents ? <LogEvents /> : <Loading />) }
          {!selectedLogStreamName && "Please select a log stream from the left." }
        </div>
      </div>
      : <Loading />
    }
  </div>;
}
