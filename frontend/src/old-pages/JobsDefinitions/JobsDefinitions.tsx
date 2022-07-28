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
import { useCollection } from '@awsui/collection-hooks';
import {
  AppLayout, Button, Header, Pagination, SpaceBetween, Table, TextFilter
} from "@awsui/components-react";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import { getState, isAdmin, setState } from '../../store';

function JobDefinitionsList() {
  let jobDefinitions = getState(['jobs-definitions', 'list']);
  const [selectedJobDefinitions, setSelectedJobDefinitions] = React.useState([])

  let navigate = useNavigate();
  // @ts-expect-error TS(2339) FIXME: Property 'id' does not exist on type 'never'.
  const onEditJobDefinition = () => (navigate(`/jobs-definitions/${selectedJobDefinitions[0].id}`))
  // @ts-expect-error TS(2339) FIXME: Property 'id' does not exist on type 'never'.
  const onExecuteJobDefinition = () => (navigate(`/jobs/${selectedJobDefinitions[0].id}`))


  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    jobDefinitions || [],
    {
      filtering: {
        empty: (
          <EmptyState
            title="No jobs definitions"
            subtitle="No jobs definitions to display."
            action={<Button disabled={!isAdmin()}>Create</Button>}
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No jobs definitions match the filters."
            action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  return (<Table {...collectionProps} header={<Header variant="h2" description="" counter={jobDefinitions && `(${jobDefinitions.length})`} actions={<SpaceBetween direction="horizontal" size="xs">
    <Button onClick={onExecuteJobDefinition} variant="primary" iconName={"caret-right-filled"} disabled={selectedJobDefinitions.length == 0}>Execute</Button>
    <Button onClick={onEditJobDefinition} variant="normal" iconName={"edit"} disabled={!isAdmin() || selectedJobDefinitions.length == 0}>Edit</Button>
    <Button variant="primary" iconName={"add-plus"} disabled={!isAdmin()}>Create</Button>
  </SpaceBetween>}>
    Jobs Definitions
  </Header>} columnDefinitions={[
    {
      id: "id",
      header: "Id",
      cell: item => (item as any).id,
      sortingField: "jobDefinitionId"
    },
    {
      id: "label",
      header: "Label",
      cell: item => (item as any).label,
      sortingField: "jobDefinitionLabel"
    }

  ]}
    loading={jobDefinitions === null}
    items={items}
    trackBy="id"
    selectionType="single"
    loadingText="Loading job definitions..."
    pagination={<Pagination {...paginationProps} />}
    filter={<TextFilter {...filterProps}
      countText={`Results: ${filteredItemsCount}`}
      filteringAriaLabel="Filter job definitions" />}
    selectedItems={selectedJobDefinitions}
    onSelectionChange={({ detail }) => {
      // @ts-expect-error TS(2345) FIXME: Argument of type 'unknown[]' is not assignable to ... Remove this comment to see the full error message
      setSelectedJobDefinitions(detail.selectedItems);
    }}
  />
  )
}

export default function JobsDefinitions() {

  return <AppLayout
    className="inner-app-layout"
    headerSelector="#top-bar"
    disableContentHeaderOverlap
    navigationHide
    toolsHide
    onNavigationChange={(e) => { setState(['app', 'sidebar', 'drawerOpen'], e.detail.open) }}
    content={<JobDefinitionsList />}
  />
}
