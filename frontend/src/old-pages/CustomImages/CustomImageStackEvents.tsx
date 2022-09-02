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

// Model
import {GetCustomImageStackEvents} from '../../model'
import {getState, useState} from '../../store'

// UI Elements
import {ExpandableSection} from '@awsui/components-react'

// Components
import DateView from '../../components/DateView'
import Loading from '../../components/Loading'

type Event = {
  resourceStatus: string
  resourceStatusReason: string
  timestamp: string
}

function EventDetails({event}: {event: Event}) {
  return (
    <div style={{marginLeft: '20px'}}>
      <div>
        Status {event.resourceStatus} (<DateView date={event.timestamp} />)
      </div>
      <div>Reason: {event.resourceStatusReason}</div>
    </div>
  )
}

export default function CustomImageStackEvents() {
  const selected = useState(['app', 'customImages', 'selected'])
  const events = useState([
    'customImages',
    'index',
    selected,
    'stackevents',
    'events',
  ])

  React.useEffect(() => {
    const selected = getState(['app', 'customImages', 'selected'])
    GetCustomImageStackEvents(selected)
  }, [])

  if (!events) return <Loading />

  return events.map((event: any) => (
    <ExpandableSection header={event.eventId} key={event.eventId}>
      <EventDetails event={event} />
    </ExpandableSection>
  ))
}
