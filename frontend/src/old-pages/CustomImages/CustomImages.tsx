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
import {ImageInfoSummary} from '../../types/images'
import React from 'react'
import {useSelector} from 'react-redux'

import {ListCustomImages, DescribeCustomImage} from '../../model'

import {setState, useState, getState, clearState} from '../../store'

import {useCollection} from '@cloudscape-design/collection-hooks'

// Components
import EmptyState from '../../components/EmptyState'
import ImageBuildDialog from './ImageBuildDialog'
import CustomImageDetails from './CustomImageDetails'

// UI Elements
import {
  Button,
  Header,
  Pagination,
  Select,
  SpaceBetween,
  SplitPanel,
  Table,
  TextFilter,
} from '@cloudscape-design/components'
import Layout from '../Layout'
import {DefaultHelpPanel} from '../../components/help-panel/DefaultHelpPanel'
import {useHelpPanel} from '../../components/help-panel/HelpPanel'

const imageBuildPath = ['app', 'customImages', 'imageBuild']

// selectors
const selectCustomImagesList = (state: any): ImageInfoSummary[] =>
  state.customImages.list

function CustomImagesList() {
  const images = useSelector(selectCustomImagesList)

  const [selected, setSelected] = React.useState<ImageInfoSummary[]>([])

  const imageStatus = useState(['app', 'customImages', 'selectedImageStatus'])

  let select = (image: ImageInfoSummary) => {
    setSelected([image])
    DescribeCustomImage(image.imageId)
    setState(['app', 'customImages', 'selected'], image.imageId)
  }

  const buildImage = () => {
    setState([...imageBuildPath, 'dialog'], true)
  }

  const refreshImages = () => {
    clearState(['customImages', 'list'])
    clearState(['app', 'customImages', 'selected'])
    ListCustomImages(imageStatus || 'AVAILABLE')
  }

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
          action={
            <Button onClick={buildImage} iconName={'add-plus'}>
              Build Image
            </Button>
          }
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
      trackBy="imageId"
      variant="full-page"
      header={
        <Header
          variant="awsui-h1-sticky"
          description=""
          counter={images && `(${images.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                className="action"
                onClick={refreshImages}
                iconName={'refresh'}
              >
                Refresh
              </Button>
              <StatusSelect />
              <Button
                className="action"
                onClick={buildImage}
                iconName={'add-plus'}
              >
                Build Image
              </Button>
            </SpaceBetween>
          }
        >
          Custom Images
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: 'Name',
          cell: image => image.imageId,
          sortingField: 'imageId',
        },
        {
          id: 'ami-id',
          header: 'AMI ID',
          cell: image => (image.ec2AmiInfo ? image.ec2AmiInfo.amiId : ''),
        },
        {
          id: 'status',
          header: 'Status',
          cell: image => image.imageBuildStatus || '-',
          sortingField: 'imageBuildStatus',
        },
        {
          id: 'region',
          header: 'Region',
          cell: image => image.region || '-',
          sortingField: 'region',
        },
        {
          id: 'version',
          header: 'Version',
          cell: image => image.version || '-',
        },
      ]}
      loading={!images}
      items={items}
      selectionType="single"
      loadingText="Loading Images..."
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={`Results: ${filteredItemsCount}`}
          filteringAriaLabel="Filter image"
        />
      }
      selectedItems={selected}
      onSelectionChange={e => {
        select(e.detail.selectedItems[0])
      }}
    />
  )
}

function StatusSelect() {
  const [status, setStatus] = React.useState({
    label: 'Available',
    value: 'AVAILABLE',
  })

  return (
    <Select
      className="status-select"
      placeholder="Status"
      selectedOption={status}
      onChange={({detail}) => {
        console.log(detail.selectedOption)
        // @ts-expect-error TS(2345) FIXME: Argument of type 'OptionDefinition' is not assigna... Remove this comment to see the full error message
        setStatus(detail.selectedOption)
        setState(
          ['app', 'customImages', 'selectedImageStatus'],
          detail.selectedOption.value,
        )
        ListCustomImages(detail.selectedOption.value)
      }}
      options={[
        {label: 'Available', value: 'AVAILABLE'},
        {label: 'Pending', value: 'PENDING'},
        {label: 'Failed', value: 'FAILED'},
      ]}
      selectedAriaLabel="Selected"
    />
  )
}

const customImageSlug = 'customImages'

export default function CustomImages() {
  const imageId = useState(['app', 'customImages', 'selected'])
  const images = useSelector(selectCustomImagesList)

  const [splitOpen, setSplitOpen] = React.useState(true)

  useHelpPanel(<DefaultHelpPanel />)

  React.useEffect(() => {
    const imageStatus = getState(['app', 'customImages', 'selectedImageStatus'])
    ListCustomImages(imageStatus || 'AVAILABLE')
  }, [])

  return (
    <Layout
      pageSlug={customImageSlug}
      splitPanelOpen={splitOpen}
      onSplitPanelToggle={e => {
        setSplitOpen(e.detail.open)
      }}
      splitPanel={
        <SplitPanel
          i18nStrings={{
            preferencesTitle: 'Split panel preferences',
            preferencesPositionLabel: 'Split panel position',
            preferencesPositionDescription:
              'Choose the default split panel position for the service.',
            preferencesPositionSide: 'Side',
            preferencesPositionBottom: 'Bottom',
            preferencesConfirm: 'Confirm',
            preferencesCancel: 'Cancel',
            closeButtonAriaLabel: 'Close panel',
            openButtonAriaLabel: 'Open panel',
            resizeHandleAriaLabel: 'Resize split panel',
          }}
          header={imageId ? `Image: ${imageId}` : 'No image selected'}
        >
          {imageId ? (
            <CustomImageDetails />
          ) : (
            <div>
              <h3 style={{userSelect: 'none'}}>Select an image above</h3>
            </div>
          )}
        </SplitPanel>
      }
    >
      <>
        <CustomImagesList />
        <ImageBuildDialog />
      </>
    </Layout>
  )
}
