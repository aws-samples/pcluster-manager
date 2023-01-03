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

import {ListOfficialImages} from '../../model'
import {useCollection} from '@cloudscape-design/collection-hooks'

// UI Elements
import {
  Button,
  Header,
  Pagination,
  Table,
  TextFilter,
} from '@cloudscape-design/components'

// Components
import EmptyState from '../../components/EmptyState'
import {useQuery} from 'react-query'
import {useState} from '../../store'
import Layout from '../Layout'
import {DefaultHelpPanel} from '../../components/help-panel/DefaultHelpPanel'
import {useHelpPanel} from '../../components/help-panel/HelpPanel'

type Image = {
  amiId: string
  os: string
  architecture: string
  version: string
}

function OfficialImagesList({images}: {images: Image[]}) {
  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(images || [], {
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
            <Button onClick={() => actions.setFiltering('')}>
              Clear filter
            </Button>
          }
        />
      ),
    },
    pagination: {pageSize: 10},
    sorting: {},
    selection: {},
  })

  return (
    <Table
      {...collectionProps}
      resizableColumns
      trackBy="amiId"
      variant="full-page"
      stickyHeader
      header={
        <Header
          variant="awsui-h1-sticky"
          counter={items && `(${items.length})`}
        >
          Official Images
        </Header>
      }
      columnDefinitions={[
        {
          id: 'id',
          header: 'Id',
          cell: item => item.amiId,
          sortingField: 'amiId',
        },
        {
          id: 'os',
          header: 'OS',
          cell: item => item.os || '-',
          sortingField: 'os',
        },
        {
          id: 'architecture',
          header: 'Architecture',
          cell: item => item.architecture || '-',
          sortingField: 'architecture',
        },
        {
          id: 'version',
          header: 'Version',
          cell: item => item.version || '-',
        },
      ]}
      loading={!images}
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
  )
}

const officialImagesSlug = 'officialImages'
export default function OfficialImages() {
  const defaultRegion = useState(['aws', 'region'])
  const region = useState(['app', 'selectedRegion']) || defaultRegion
  const {data} = useQuery('OFFICIAL_IMAGES', () => ListOfficialImages(region))

  useHelpPanel(<DefaultHelpPanel />)

  return (
    <Layout pageSlug={officialImagesSlug}>
      <OfficialImagesList images={data} />
    </Layout>
  )
}
