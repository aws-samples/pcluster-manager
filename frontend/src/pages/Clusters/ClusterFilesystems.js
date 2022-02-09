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

import { useState } from '../../store'
import { getIn } from '../../util'
import { useCollection } from '@awsui/collection-hooks';

// UI Elements
import {
  Button,
  Link,
  Pagination,
  Table,
  TextFilter
} from "@awsui/components-react";

// Components
import EmptyState from '../../components/EmptyState';

function StorageId({storage}){
  const settingsKey = `${storage.StorageType}Settings`
  const fs_id = getIn(storage, [settingsKey, 'FileSystemId'])
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  return <>
    {fs_id && storage.StorageType === 'FsxLustre' && <Link external externalIconAriaLabel="Opens a new tab"
      href={`https://${region}.console.aws.amazon.com/fsx/home?region=${region}#file-system-details/${fs_id}`}
    >{fs_id}</Link>}
    {fs_id && storage.StorageType === 'Ebs' && <Link external externalIconAriaLabel="Opens a new tab"
      href={`https://${region}.console.aws.amazon.com/efs/home?region=${region}#/file-systems/${fs_id}`}
    >{fs_id}</Link>}
    {fs_id && storage.StorageType === 'Efs' && <Link external externalIconAriaLabel="Opens a new tab"
      href={`https://${region}.console.aws.amazon.com/ec2/v2/home?region=${region}#VolumeDetails:volumeId=${fs_id}`}
    >{fs_id}</Link>}
    {!fs_id && "internal"}
  </>

}

export default function ClusterFilesystems() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const clusterPath = ['clusters', 'index', clusterName];
  const storage = useState([...clusterPath, 'config', 'SharedStorage']) || [];
  const headNode = useState([...clusterPath, 'headNode']);
  const defaultRegion = useState(['aws', 'region']);
  const region = useState(['app', 'selectedRegion']) || defaultRegion;

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    storage,
    {
      filtering: {
        empty: (
          <EmptyState
            title="No filesystems"
            subtitle="No filesystems to display."
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No filesystems match the filters."
            action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
          />
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );



  return <>
    {storage &&
    <div>
    <Table
      {...collectionProps}
      trackBy="clusterName"
      columnDefinitions={[
        {
          id: "mount",
          header: "Mount Point",
          cell: item => <a href={`https://${region}.console.aws.amazon.com/systems-manager/managed-instances/${headNode.instanceId}/file-system?region=${region}&osplatform=Linux#%7B%22path%22%3A%22${item.MountDir}%22%7D`} rel="noreferrer" target="_blank">{item.MountDir}</a>,
          sortingField: "MountDir"
        },
        {
          id: "name",
          header: "Name",
          cell: item => item.Name,
          sortingField: "Name"
        },
        {
          id: "type",
          header: "Type",
          cell: item => item.StorageType,
          sortingField: "StorageType"
        },
        {
          id: "id",
          header: "id",
          cell: item => <StorageId storage={item} />,
        },
      ]}
      items={items}
      loadingText="Loading Filesystems..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter filesystems"
        />
      }
    />
    </div>
    }
    {!storage && <div>No Filesystems Found.</div>}
  </>
}
