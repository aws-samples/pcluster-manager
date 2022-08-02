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
import { useSearchParams } from "react-router-dom"

// Model
import { ListClusterLogStreams, GetClusterLogEvents } from '../../model'
import { clearState, getState, setState, useState } from '../../store'
import { useCollection } from '@awsui/collection-hooks';

// UI Elements
import Loading from '../../components/Loading'
import HelpTooltip from '../../components/HelpTooltip'
import {
  Button,
  CollectionPreferences,
  ExpandableSection,
  Pagination,
  Table,
  TextFilter
} from "@awsui/components-react";

// Components
import EmptyState from '../../components/EmptyState';

function LogEvents() {
  const selected = getState(['app', 'clusters', 'selected']);
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);
  const events = useState(['clusters', 'index', selected, 'logEventIndex', selectedLogStreamName]);

  const columns = useState(['app', 'clusters', 'logs', 'columns']) || ['message']
  const pageSize = useState(['app', 'clusters', 'logs', 'pageSize']) || 100

  const pending = useState(['app', 'clusters', 'logs', 'pending']);

  let [searchParams, setSearchParams] = useSearchParams();

  const refresh = () => {
    setState(['app', 'clusters', 'logs', 'pending'], true);
    const clusterName = getState(['app', 'clusters', 'selected']);
    const logStreamName = getState(['app', 'clusters', 'selectedLogStreamName']);
    if(clusterName && logStreamName)
    {
      GetClusterLogEvents(clusterName, logStreamName, () => clearState(['app', 'clusters', 'logs', 'pending']), () => clearState(['app', 'clusters', 'logs', 'pending']));
    }
  }

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    (events && events.events) || [],
    {
      filtering: {
        empty: (
          <EmptyState
            title='No logs'
            subtitle='No logs to display.'
          />
        ),
        noMatch: (
          <EmptyState
            title='No matches'
            subtitle='No logs match the filters.'
            action={
              <Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: pageSize },
      sorting: {},
      selection: {},
    }
  );

  React.useEffect(() => {
    filterProps.onChange({detail: {filteringText: searchParams.get("filter") || ""}})
  }, [searchParams]);

  // @ts-expect-error TS(2322) FIXME: Type '"row"' is not assignable to type 'Direction ... Remove this comment to see the full error message
  return <div><div style={{ marginBottom: '10px', display: 'flex', direction: 'row', gap: '16px', alignItems: 'center' }}><div>{selectedLogStreamName}</div><Button loading={pending} onClick={refresh} iconName='refresh'/></div>
    <div style={{ borderTop: '1px solid #AAA', fontSize: '10pt', overflow: 'auto', whiteSpace: 'nowrap' }}>
      <Table {...collectionProps} resizableColumns wrapLines visibleColumns={columns} variant='container' columnDefinitions={[
        {
            id: 'timestamp',
            header: 'timestamp',
            cell: item => (item as any).timestamp,
            sortingField: 'timestamp'
        },
        {
            id: 'message',
            header: 'message',
            cell: item => <pre style={{ margin: 0 }}>{(item as any).message}</pre>,
        },
    ]} loading={events === null} items={items} loadingText="Loading Logs..." pagination={<Pagination {...paginationProps}/>} filter={<TextFilter {...filterProps} filteringText={searchParams.get('filter') || ''} onChange={(e) => { searchParams.set('filter', e.detail.filteringText); setSearchParams(searchParams); filterProps.onChange(e); }} countText={`Results: ${filteredItemsCount}`} filteringAriaLabel="Filter logs"/>} preferences={<CollectionPreferences onConfirm={({ detail }) => {
            setState(['app', 'clusters', 'logs', 'columns'], detail.visibleContent);
            setState(['app', 'clusters', 'logs', 'pageSize'], detail.pageSize);
        }} title="Preferences" confirmLabel="Confirm" cancelLabel="Cancel" preferences={{
            pageSize: pageSize,
            visibleContent: columns
        }} pageSizePreference={{
            title: "Select page size",
            options: [
                { value: 100, label: "100 Logs" },
                { value: 250, label: "250 Logs" },
                { value: 500, label: "500 Logs" }
            ]
        }} visibleContentPreference={{
            title: "Select visible content",
            options: [
                {
                    label: "Log columns",
                    options: [
                        {
                            id: "timestamp",
                            label: "Timestamp",
                        },
                        { id: "message", label: "Message", editable: false
                        }
                    ]
                }
            ]
        }}/>}/>
    </div>
  </div>;
}

function StreamList({
  instanceId
}: any) {
  const logStreams = useState(['app', 'clusters', 'logs', 'index', instanceId, 'streams']) || [];
  const ip = useState(['app', 'clusters', 'logs', 'index', instanceId, 'ip']);
  const fnames = Object.keys(logStreams).sort()
  const selectedLogStreamName = useState(['app', 'clusters', 'selectedLogStreamName']);
  let [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if(searchParams.get('instance') && (searchParams.get('instance') === instanceId) && searchParams.get('filename') && (`${ip}.${instanceId}.${searchParams.get('filename')}` !== selectedLogStreamName))
    {
      const selected = getState(['app', 'clusters', 'selected']);
      const logStreamName = `${ip}.${instanceId}.${searchParams.get('filename')}`;
      setState(['app', 'clusters', 'selectedLogStreamName'], logStreamName);
      GetClusterLogEvents(selected, logStreamName);
    }
  }, [searchParams, instanceId]);


  return <div title={instanceId}>
    <ExpandableSection header={ip} onChange={({detail}) => {if(detail.expanded){setSearchParams({instance: instanceId})}}} expanded={searchParams.get("instance") === instanceId}>
      {fnames.map((fname) => <div key={fname} onClick={() => setSearchParams({filename: fname, instance: instanceId})} style={{marginLeft: '10px', cursor: 'pointer', fontWeight: selectedLogStreamName === logStreams[fname].logStreamName ? 'bold' : 'normal'}}>{fname}</div>)}
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
    {logStreamIndex && Object.keys(logStreamIndex).filter(k => k !== instanceId).sort().map(instanceId => <StreamList key={instanceId} instanceId={instanceId} />)}
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
