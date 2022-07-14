// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React from 'react';
import { useNavigate, useParams } from "react-router-dom"

import { ListClusters } from '../../model'

import { useState, getState, setState, isAdmin } from '../../store'
import { selectCluster } from './util'
import { findFirst } from '../../util'

// UI Elements
import {
  AppLayout,
  Button,
  Header,
  Pagination,
  SpaceBetween,
  SplitPanel,
  Table,
  TextFilter
} from "@awsui/components-react";

import { useCollection } from '@awsui/collection-hooks';

// Components
import EmptyState from '../../components/EmptyState';
import Status from "../../components/Status";
import Actions from './Actions';
import Details from "./Details";
import { wizardShow } from '../Configure/Configure';

function updateClusterList() {
  const selectedClusterName = getState(['app', 'clusters', 'selected']);
  const oldStatus = getState(['app', 'clusters', 'selectedStatus']);

  ListClusters((clusterList) => {
    if(selectedClusterName)
    {
      const selectedCluster = findFirst(clusterList, c => c.clusterName === selectedClusterName);
      if(selectedCluster)
      {
        if(oldStatus !== selectedCluster.clusterStatus)
          setState(['app', 'clusters', 'selectedStatus'], selectedCluster.clusterStatus);

        if((oldStatus === 'CREATE_IN_PROGRESS' && selectedCluster.clusterStatus === 'CREATE_COMPLETE') ||
          (oldStatus === 'UPDATE_IN_PROGRESS' && selectedCluster.clusterStatus === 'UPDATE_COMPLETE'))
          selectCluster(selectedClusterName);
      }
    }

  })
}

function ClusterList() {
  let clusters = useState(['clusters', 'list']);
  const selectedClusterName = useState(['app', 'clusters', 'selected']);
  let navigate = useNavigate();
  let params = useParams();

  React.useEffect(() => {
    const timerId = (setInterval(updateClusterList, 5000));
    return () => { clearInterval(timerId); }
  }, [])

  React.useEffect(() => {
    if(params.clusterName && selectedClusterName !== params.clusterName)
      selectCluster(params.clusterName, navigate);
  }, [selectedClusterName, params])

  const configure = () => {
    wizardShow(navigate);
  }

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    clusters || [],
    {
      filtering: {
        empty: (
          <EmptyState
            title="No clusters"
            subtitle="No clusters to display."
            action={<Button onClick={configure} disabled={!isAdmin()}>Create Cluster</Button>}
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No clusters match the filters."
            action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  return (
    <Table
      {...collectionProps}
      header={
        <Header
          variant="h2"
          description=""
          counter={ clusters && `(${clusters.length})` }
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              {clusters && <Button onClick={configure} variant="primary" iconName={"add-plus"} disabled={!isAdmin()}>Create Cluster</Button>}
            </SpaceBetween>}>
          Clusters
        </Header>
      }
      trackBy="clusterName"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: item => item.clusterName,
          sortingField: "clusterName"
        },
        {
          id: "status",
          header: "Status",
          cell: item => <Status status={item.clusterStatus} cluster={item} /> || "-",
          sortingField: "clusterStatus"
        },
        {
          id: "version",
          header: "Version",
          cell: item => item.version || "-"
        }
      ]}
      loading={clusters === null}
      items={items}
      selectionType="single"
      loadingText="Loading clusters..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter cluster"
        />
      }
      selectedItems={(items || []).filter((c) => c.clusterName === selectedClusterName)}
      onSelectionChange={({detail}) => {navigate(`/clusters/${detail.selectedItems[0].clusterName}`)}}
    />
  )
}

export default function Clusters () {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const cluster = useState(['clusters', 'index', clusterName]);
  const clusters = useState(['clusters', 'list']);
  let navigate = useNavigate();
  const [ splitOpen, setSplitOpen ] = React.useState(true);

  const configure = () => {
    wizardShow(navigate);
  }

  React.useEffect(() => {
    ListClusters();
  }, [])

  return (
    <AppLayout
      className='inner-app-layout'
      headerSelector="#top-bar"
      disableContentHeaderOverlap
      navigationHide
      toolsHide
      splitPanelOpen={splitOpen}
      onSplitPanelToggle={(e) => {setSplitOpen(e.detail.open)}}
      splitPanel={
        <SplitPanel
          className="bottom-panel"
          i18nStrings={{
            preferencesTitle: "Split panel preferences",
            preferencesPositionLabel: "Split panel position",
            preferencesPositionDescription:
            "Choose the default split panel position for the service.",
            preferencesPositionSide: "Side",
            preferencesPositionBottom: "Bottom",
            preferencesConfirm: "Confirm",
            preferencesCancel: "Cancel",
            closeButtonAriaLabel: "Close panel",
            openButtonAriaLabel: "Open panel",
            resizeHandleAriaLabel: "Resize split panel"
          }}
          header={
            <Header
              variant="h2"
              actions={cluster && <Actions className="spacer" />}>
              {clusterName ? `Cluster: ${clusterName}` : "No cluster selected" }
            </Header>
          }>
          {clusterName ? <Details /> : <div>Select a cluster to see its details.</div>}
        </SplitPanel>
      }
      content={<ClusterList />
      }
    />
  );
}
