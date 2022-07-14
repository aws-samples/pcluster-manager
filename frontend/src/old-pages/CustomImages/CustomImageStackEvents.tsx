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
import { GetCustomImageStackEvents } from '../../model'
import { getState, useState } from '../../store'

// UI Elements
import TreeView from '@mui/lab/TreeView';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TreeItem from '@mui/lab/TreeItem';

// Components
import DateView from '../../components/DateView'
import Loading from '../../components/Loading'

function EventDetails(props: any) {
  return (
    <div style={{marginLeft: "20px"}}>
      <div>Status {props.event.resourceStatus} (<DateView date={props.event.timestamp} />)</div>
      <div>Reason: {props.event.resourceStatusReason}</div>
    </div>
  );
}

export default function CustomImageStackEvents() {
  const selected = useState(['app', 'customImages', 'selected']);
  const events = useState(['customImages', 'index', selected, 'stackevents', 'events']);

  React.useEffect(() => {
    const selected = getState(['app', 'customImages', 'selected']);
    GetCustomImageStackEvents(selected);
  }, []);

  return (
    <div>{ events ?
      <TreeView
        aria-label="stack events list"
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        sx={{ textAlign: 'left'}}>
        {events.map((event: any, i: any) => <TreeItem nodeId={event.eventId} label={event.eventId} key={event.eventId}>
          <TreeItem nodeId={event.eventId + 'details'}/><EventDetails event={event} /></TreeItem>)}
      </TreeView>
      : <Loading />}
    </div>
  );
}
