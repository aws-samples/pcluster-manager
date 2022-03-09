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
import { GetClusterStackEvents } from '../../model'
import { getState, clearState, useState } from '../../store'

// UI Elements
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';
import { Button } from '@awsui/components-react';

// Components
import DateView from '../../components/DateView'
import Loading from '../../components/Loading'

function EventDetails(props) {
  return (
    <div style={{marginLeft: "20px"}}>
      <div>Status {props.event.resourceStatus} (<DateView date={props.event.timestamp} />)</div>
      <div>Reason: {props.event.resourceStatusReason}</div>
    </div>
  );
}

export default function ClusterStackEvents() {
  const selected = useState(['app', 'clusters', 'selected']);
  const events = useState(['clusters', 'index', selected, 'stackevents', 'events']);

  React.useEffect(() => {
    const selected = getState(['app', 'clusters', 'selected']);
    GetClusterStackEvents(selected);
  }, []);

  const refreshStackEvents = () => {
    clearState(['clusters', 'index', selected, 'stackevents']);
    GetClusterStackEvents(selected);
  }

  return <div>{ events ?
    <div>
      <Button onClick={refreshStackEvents} iconName="refresh">Refresh</Button>
      <TreeView
        aria-label="stack events list"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ textAlign: 'left'}}>
        {events.map((event, i) => <TreeItem nodeId={event.eventId} label={event.eventId} key={event.eventId}>
          <TreeItem nodeId={event.eventId + 'details'}/><EventDetails event={event} /></TreeItem>)}
      </TreeView>
    </div>
    : <Loading />}
  </div>
}
