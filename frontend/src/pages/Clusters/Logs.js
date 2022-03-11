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
import { getState, setState, useState } from '../../store'

// UI Elements
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Loading from '../../components/Loading'
import {
  Button
} from "@awsui/components-react";

function LogEvents({events}) {
  return (
    <div style={{borderTop: "1px solid #AAA", fontSize: "10pt", width: "100%", overflow: "auto", whiteSpace: "nowrap"}}>
      {events.events.map((event, i) => <div key={event.timestamp + i.toString()}>{event.timestamp + i.toString()} - {event.message}</div>)}
    </div>
  );
}

export default function ClusterLogs() {

  const [ split, setSplit ] = React.useState(80);
  const [ isSelected , setSelected ] = React.useState(false);

  const pendingPath = ['app', 'clusters', 'logs', 'pending'];

  const selected = useState(['app', 'clusters', 'selected']);
  const pending = useState(pendingPath);
  const streams = useState(['clusters', 'index', selected, 'logstreams']);
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);
  const logEvents = useState(['clusters', 'index', selected, 'logEventIndex', selectedLogStreamName]);

  const clusterPath = ['clusters', 'index', selected];
  const headNode = useState([...clusterPath, 'headNode']);
  const instanceId = (headNode && headNode.instanceId) || '';

  const headNodeStreams = ((streams && streams['logStreams']) || []).filter((e) => e.logStreamName.includes(instanceId))
  const computeStreams = ((streams && streams['logStreams']) || []).filter((e) => !e.logStreamName.includes(instanceId))

  const refresh = () => {
    setState(pendingPath, true);
    const selected = getState(['app', 'clusters', 'selected']);
    const logStreamName = getState(['app', 'clusters', 'selectedLogStreamName']);
    GetClusterLogEvents(selected, logStreamName, () => setState(pendingPath, false));
  }

  const select = (logStreamName) => {
    const selected = getState(['app', 'clusters', 'selected']);
    setState(['app', 'clusters', 'selectedLogStreamName'], logStreamName);
    GetClusterLogEvents(selected, logStreamName);
    setSplit(10);
    setSelected(true);
  }

  const unselect = () => {
    setSplit(80);
    setSelected(false);
  }

  React.useEffect(() => {
    const selected = getState(['app', 'clusters', 'selected']);
    ListClusterLogStreams(selected);
  }, []);

  return <div>
    { streams ?
      <div style={{display: 'flex'}}>
        <div style={{textAlign: 'left', flexDirection: 'column', flex: split, width: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px'}}>
          <Button loading={pending} disabled={!selectedLogStreamName} onClick={refresh} iconName="refresh">Refresh</Button>
          <div><b>HeadNode</b></div>
          {headNodeStreams.map((stream, i) => <div onClick={() => {select(stream.logStreamName)}} style={{cursor: 'pointer'}} key={stream.logStreamName} title={stream.logStreamName}>{stream.logStreamName}</div>)}
          <div><b>Compute</b></div>
          {computeStreams.map((stream, i) => <div onClick={() => {select(stream.logStreamName)}} style={{cursor: 'pointer'}} key={stream.logStreamName} title={stream.logStreamName}>{stream.logStreamName}</div>)}
        </div>
        <div style={{ flex: 100 - split, paddingLeft: "10px", borderLeft: "1px solid #AAA"}}>
          <div style={{ marginBottom: '20px', whiteSpace: "nowrap" }}>
            {isSelected ? <ChevronRightIcon style={{cursor: 'pointer'}} onClick={() => {unselect();}}/> :  <ChevronLeftIcon style={{cursor: 'pointer'}} onClick={() => {setSelected(false); setSplit(80)}}/>}
            {selectedLogStreamName && <div style={{display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{selectedLogStreamName}</div>}
          </div>
          {isSelected && (logEvents ? <LogEvents events={logEvents} /> : <Loading />) }
        </div>
      </div>
      : <Loading />
    }
  </div>;
}
