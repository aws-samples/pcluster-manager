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
import { ListOfficialImages } from '../../model'
import { useCollection } from '@awsui/collection-hooks';

// UI Elements
import {
  Button,
  Container,
  Header,
  Pagination,
  Table,
  TextFilter
} from "@awsui/components-react";

// Components
import EmptyState from '../../components/EmptyState';
import Loading from '../../components/Loading'

type Image = {
  amiId: string,
  os: string,
  architecture: string,
  version: string,
}

function OfficialImagesList({ images}: { images: Image[]}) {
  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    images,
    {
      filtering: {
        empty: (
          <EmptyState
            title="No images"
            subtitle="No images to display."
            action={<></>}
          />
        ),
        noMatch: (
          <EmptyState
            title="No matches"
            subtitle="No images match the filters."
            action={
              <Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
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
      resizableColumns
      trackBy="amiId"
      columnDefinitions={[
        {
          id: "id",
          header: "Id",
          cell: item => item.amiId,
          sortingField: "amiId"
        },
        {
          id: "os",
          header: "OS",
          cell: item => item.os || "-",
          sortingField: "os"
        },
        {
          id: "architecture",
          header: "Architecture",
          cell: item => item.architecture || "-",
          sortingField: "architecture"
        },
        {
          id: "version",
          header: "Version",
          cell: item => item.version || "-",
        }
      ]}
      loading={images === null}
      items={items}
      loadingText="Loading images..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter images"
        />
      }
    />
  );
}

export default function OfficialImages() {
  const images = useState(['officialImages', 'list']);

  React.useEffect(() => {
    ListOfficialImages();
  }, [])

  return <Container
    header={
      <Header
        variant="h2"
        description=""
        counter={ images && `(${images.length})` }>
        Official Images
      </Header>
    }>
    {images ? <OfficialImagesList images={images} /> : <Loading />}
  </Container>
}
