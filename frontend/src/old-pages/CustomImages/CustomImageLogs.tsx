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

// Model + Store
import { ListCustomImageLogStreams, GetCustomImageLogEvents } from '../../model'
import { setState, useState, getState } from '../../store'

// UI Elements
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Loading from '../../components/Loading'

function LogEvents(props: any) {
  return (
    <div style={{borderTop: "1px solid #AAA", fontSize: "10pt" }}>
      {props.events.events.map((event: any, i: any) => <div key={event.timestamp + i.toString()}>{event.timestamp + i.toString()} - {event.message}</div>)}
    </div>
  );
}

export default function CustomImageLogs() {

  const [ split, setSplit ] = React.useState(80);
  const [ isSelected, setSelected ] = React.useState(false);

  const selected = useState(['app', 'customImages', 'selected']);
  const streams = useState(['customImages', 'index', selected, 'logstreams']);
  const selectedLogStreamName = useState(['app', 'customImages', 'selectedLogStreamName']);
  const logEvents = useState(['customImages', 'index', selected, 'logstreams', 'logEventIndex', selectedLogStreamName]);

  const select = (logStreamName: any) => {
    const selected = getState(['app', 'customImages', 'selected']);
    setState(['app', 'customImages', 'selectedLogStreamName'], logStreamName);
    GetCustomImageLogEvents(selected, logStreamName);
    setSplit(10);
    setSelected(true);
  }

  const unselect = () => {
    setSplit(80);
    setSelected(false);
  }

  React.useEffect(() => {
    const selected = getState(['app', 'customImages', 'selected']);
    ListCustomImageLogStreams(selected);
  }, []);

  return (
    <div>
      { streams ?
        <div style={{display: 'flex'}}>
          <div style={{textAlign: 'left', flexDirection: 'column', flex: split, width: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '10px'}}>
            {streams.logStreams.map((s: any, i: any) => <div onClick={() => {
              select(s.logStreamName)}} style={{cursor: 'pointer'
            }} key={s.logStreamName} title={s.logStreamId}>{s.logStreamName}</div>)}
          </div>
          <div style={{ flex: 100 - split, paddingLeft: "10px", borderLeft: "1px solid #AAA"}}>
            <div style={{ marginBottom: '20px', whiteSpace: "nowrap" }}>
              {isSelected ?
              <ChevronRightIcon style={{cursor: 'pointer'}} onClick={() => {unselect();}}/>
              // @ts-expect-error TS(2554) FIXME: Expected 1 arguments, but got 0.
              :  <ChevronLeftIcon style={{cursor: 'pointer'}} onClick={() => {select();}}/>}
              {selectedLogStreamName && <div style={{display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{selectedLogStreamName}</div>}
            </div>
            {isSelected && (logEvents ? <LogEvents events={logEvents} /> : <Loading />) }
          </div>
        </div>
        : <Loading />
      }
    </div>
  );
}
