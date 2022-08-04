// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React, { useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom"
import { ListClusters } from '../../model'
import { useState, clearState, setState, isAdmin } from '../../store'
import { selectCluster } from './util'
import { findFirst } from '../../util'
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
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

import EmptyState from '../../components/EmptyState';
import Status from "../../components/Status";
import Actions from './Actions';
import Details from "./Details";
import { wizardShow } from '../Configure/Configure';
import AddIcon from '@mui/icons-material/Add';

export interface Cluster {
  cloudformationStackArn: string,
  cloudformationStackStatus: string,
  clusterName: string,
  clusterStatus: string,
  region: string,
  version: string
}

type ClusterListProps = {
  clusters: Cluster[]
}

function ClusterList({ clusters }: ClusterListProps) {
  const selectedClusterName = useState(['app', 'clusters', 'selected']);
  let navigate = useNavigate();
  let params = useParams();
  const { t } = useTranslation();

  React.useEffect(() => {
    if(params.clusterName && selectedClusterName !== params.clusterName)
      selectCluster(params.clusterName, navigate);
  }, [selectedClusterName, params, navigate])

  const onSelectionChangeCallback = React.useCallback(
    ({ detail }) => {
      navigate(`/clusters/${(detail.selectedItems[0] as Cluster).clusterName}`);
  }, [navigate]);

  const configure = () => {
    wizardShow(navigate);
  }

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    clusters || [],
    {
      filtering: {
        empty: (
          <EmptyState
            title={t("cluster.list.filtering.empty.title")}
            subtitle={t("cluster.list.filtering.empty.subtitle")}
            action={<Button onClick={configure} disabled={!isAdmin()}>{t("cluster.list.filtering.empty.action")}</Button>}
          />
        ),
        noMatch: (
          <EmptyState
            title={t("cluster.list.filtering.noMatch.title")}
            subtitle={t("cluster.list.filtering.noMatch.subtitle")}
            action={<Button onClick={() => actions.setFiltering('')}>{t("cluster.list.filtering.noMatch.action")}</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  return (<Table {...collectionProps} header={<Header variant="h2" description="" counter={clusters && `(${clusters.length})`} actions={<SpaceBetween direction="horizontal" size="xs">
              {selectedClusterName && <Actions/>}
              {clusters && <Button className="action" onClick={configure} variant="primary" disabled={!isAdmin()}>
                <div className="container">
                  <AddIcon/> {t("cluster.list.actions.create")}
                </div>
              </Button>}
            </SpaceBetween>}>
          Clusters
        </Header>} trackBy="clusterName" columnDefinitions={[
        {
            id: "name",
            header: t("cluster.list.cols.name"),
            cell: item => (item as any).clusterName,
            sortingField: "clusterName"
        },
        {
            id: "status",
            header: t("cluster.list.cols.status"),
            cell: item => <Status status={(item as any).clusterStatus} cluster={item}/> || "-",
            sortingField: "clusterStatus"
        },
        {
            id: "version",
            header: t("cluster.list.cols.version"),
            cell: item => (item as any).version || "-"
        }
    ]}
    loading={clusters === null}
    items={items}
    selectionType="single"
    loadingText={t("cluster.list.loadingText")}
    pagination={<Pagination {...paginationProps}/>}
    filter={<TextFilter {...filterProps}
    countText={`${t("cluster.list.countText")} ${filteredItemsCount}`}
    filteringAriaLabel={t("cluster.list.filteringAriaLabel")}/>}
    selectedItems={(items || []).filter((c) => (c as any).clusterName === selectedClusterName)}
    onSelectionChange={onSelectionChangeCallback}
    />
  )
}

export default function Clusters () {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const [ splitOpen, setSplitOpen ] = React.useState(true);
  const { t } = useTranslation();
  const { data } = useQuery('LIST_CLUSTERS', () => ListClusters(),  {
    refetchInterval: 5000,
  });
  const selectedClusterName = useState(['app', 'clusters', 'selected']);
  const oldStatus = useState(['app', 'clusters', 'selectedStatus']);
  let navigate = useNavigate();

  useEffect(() => {
    if(selectedClusterName) {
      const selectedCluster = findFirst(data, (c: Cluster) => c.clusterName === selectedClusterName);
      if(selectedCluster) {
        if(oldStatus !== selectedCluster.clusterStatus) {
          setState(['app', 'clusters', 'selectedStatus'], selectedCluster.clusterStatus);
        }
        if((oldStatus === 'CREATE_IN_PROGRESS' && selectedCluster.clusterStatus === 'CREATE_COMPLETE') || (oldStatus === 'UPDATE_IN_PROGRESS' && selectedCluster.clusterStatus === 'UPDATE_COMPLETE')) {
            selectCluster(selectedClusterName, null);
        } else if (oldStatus === 'DELETE_IN_PROGRESS') {
          clearState(['app', 'clusters', 'selected']);
          navigate('/clusters');
        }
      }
    }
  }, [selectedClusterName, oldStatus, data, navigate])

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
            preferencesTitle: t("cluster.list.splitPanel.preferencesTitle"),
            preferencesPositionLabel: t("cluster.list.splitPanel.preferencesPositionLabel"),
            preferencesPositionDescription: t("cluster.list.splitPanel.preferencesPositionDescription"),
            preferencesPositionSide: t("cluster.list.splitPanel.preferencesPositionSide"),
            preferencesPositionBottom: t("cluster.list.splitPanel.preferencesPositionBottom"),
            preferencesConfirm: t("cluster.list.splitPanel.preferencesConfirm"),
            preferencesCancel: t("cluster.list.splitPanel.preferencesCancel"),
            closeButtonAriaLabel: t("cluster.list.splitPanel.closeButtonAriaLabel"),
            openButtonAriaLabel: t("cluster.list.splitPanel.openButtonAriaLabel"),
            resizeHandleAriaLabel: t("cluster.list.splitPanel.resizeHandleAriaLabel"),
          }}
          header={clusterName ? `Cluster: ${clusterName}` : t("cluster.list.splitPanel.noClusterSelectedText") }>
          {clusterName ? <Details /> : <div>{t("cluster.list.splitPanel.selectClusterText")}</div>}
        </SplitPanel>
      }
      content={<ClusterList clusters={data}/>
      }
    />
  );
}
