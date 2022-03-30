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
import { consoleDomain, getState, setState, clearState, useState } from '../../store'
import { useCollection } from '@awsui/collection-hooks';

// UI Elements
import {
  Button,
  Container,
  CollectionPreferences,
  Header,
  Pagination,
  SpaceBetween,
  StatusIndicator,
  Table,
  TextFilter
} from '@awsui/components-react';

// Components
import DateView from '../../components/DateView'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState';

function EventStatus({status}) {
  const statusIndicatorMap = {'DELETE_FAILED': 'error',
    'UPDATE_FAILED': 'error',
    'ROLLBACK_FAILED': 'error',
    'CREATE_FAILED': 'error',
    'DELETE_COMPLETE': 'success',
    'CREATE_COMPLETE': 'success',
    'ROLLBACK_COMPLETE': 'success',
    'UPDATE_COMPLETE': 'success',
    'CREATE_IN_PROGRESS': 'info',
    'DELETE_IN_PROGRESS': 'info',
    'UPDATE_IN_PROGRESS': 'info',
    'ROLLBACK_IN_PROGRESS': 'error'
  }
  return <StatusIndicator type={status in statusIndicatorMap ? statusIndicatorMap[status] : 'info'}>{status}</StatusIndicator>
}

export default function ClusterStackEvents() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const events = useState(['clusters', 'index', clusterName, 'stackevents', 'events']);
  const columns = useState(['app', 'clusters', 'stackevents', 'columns']) || ['timestamp', 'logicalId', 'status', 'statusReason']
  const pageSize = useState(['app', 'clusters', 'stackevents', 'pageSize']) || 100
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  const clusterPath = ['clusters', 'index', clusterName];
  const cluster = useState(clusterPath);
  let cfnHref = `${consoleDomain(region)}/cloudformation/home?region=${region}#/stacks?filteringStatus=active&filteringText=${clusterName}`;
  if(cluster)
    cfnHref = `${consoleDomain(region)}/cloudformation/home?region=${region}#/stacks/events?filteringStatus=active&filteringText=${clusterName}&viewNested=true&hideStacks=false&stackId=${encodeURIComponent(cluster.cloudformationStackArn)}`

  React.useEffect(() => {
    const clusterName = getState(['app', 'clusters', 'selected']);
    const cluster = getState(['clusters', 'index', clusterName]);
    GetClusterStackEvents(clusterName);

    let timerId = (setInterval(() => {
      if(cluster.clusterStatus !== 'CREATE_IN_PROGRESS')
      {
        console.log("done creating...")
        clearInterval(timerId);
      } else {
        console.log("getting more events...")
        GetClusterStackEvents(clusterName);
      }
    }, 5000));
    return () => { timerId && clearInterval(timerId); }

  }, []);

  const refreshStackEvents = () => {
    clearState(['clusters', 'index', clusterName, 'stackevents']);
    GetClusterStackEvents(clusterName);
  }

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    events || [],
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

  return events ?
    <Container
      header={<Header
        variant='h2'
        counter={ filteredItemsCount && `(${filteredItemsCount})` }
        actions={<SpaceBetween direction='horizontal' size='s'>
          <Button onClick={refreshStackEvents} iconName="refresh" />
          <Button iconName='external' href={cfnHref}>View in CloudFormation</Button>
        </SpaceBetween>}>
        Events</Header>}>
      <Table
        {...collectionProps}
        resizableColumns
        wrapLines
        visibleColumns={columns}
        variant='container'
        columnDefinitions={[
          {
            id: 'timestamp',
              header: 'Timestamp',
              cell: item => <DateView date={item.timestamp} />,
              sortingField: 'timestamp'
          },
          {
            id: 'logicalId',
            header: 'Logical ID',
            cell: item => item.logicalResourceId,
          },
          {
            id: 'status',
            header: 'Status',
            cell: item => <EventStatus status={item.resourceStatus} />,
          },
          {
            id: 'statusReason',
            header: 'Status reason',
            cell: item => item.resourceStatusReason,
          },
        ]}
        loading={events === null}
        items={items}
        loadingText="Loading Logs..."
        pagination={<Pagination {...paginationProps} />}
        filter={
          <TextFilter
            {...filterProps}
            countText={`Results: ${filteredItemsCount}`}
            filteringAriaLabel="Filter logs"
          />
        }
        preferences={
          <CollectionPreferences
            onConfirm={({detail}) => {
              setState(['app', 'clusters', 'stackevents', 'columns'], detail.visibleContent);
              setState(['app', 'clusters', 'stackevents', 'pageSize'], detail.pageSize);
            }}
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize: pageSize,
              visibleContent: columns}}
            pageSizePreference={{
              title: "Select page size",
              options: [
                { value: 100, label: "100 Logs" },
                { value: 250, label: "250 Logs" },
                { value: 500, label: "500 Logs" }
              ]
            }}
            visibleContentPreference={{
              title: "Select visible content",
              options: [
                {
                  label: "Log columns",
                  options: [
                    { id: "timestamp", label: "Timestamp",},
                    { id: "logicalId", label: "Logical ID"},
                    { id: "status", label: "Status"},
                    { id: "statusReason", label: "Status reason"},
                  ]
                }
              ]
            }}
          />}
      />
    </Container>
    : <Loading />
}
