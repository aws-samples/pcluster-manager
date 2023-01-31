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
import {Ec2AmiState, ImageInfoSummary} from '../../types/images'
import React, {useMemo} from 'react'
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
  Link,
  Pagination,
  Select,
  SpaceBetween,
  SplitPanel,
  Table,
  TextFilter,
} from '@cloudscape-design/components'
import Layout from '../Layout'
import {useHelpPanel} from '../../components/help-panel/HelpPanel'
import {TFunction, Trans, useTranslation} from 'react-i18next'
import InfoLink from '../../components/InfoLink'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'

const imageBuildPath = ['app', 'customImages', 'imageBuild']

// selectors
const selectCustomImagesList = (state: any): ImageInfoSummary[] =>
  state.customImages.list

function CustomImagesList() {
  const {t} = useTranslation()
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
          title={t('customImages.list.filtering.empty.title')}
          subtitle={t('customImages.list.filtering.empty.subtitle')}
          action={
            <Button onClick={buildImage}>
              {t('customImages.list.filtering.empty.action')}
            </Button>
          }
        />
      ),
      noMatch: (
        <EmptyState
          title={t('customImages.list.filtering.noMatch.title')}
          subtitle={t('customImages.list.filtering.noMatch.subtitle')}
          action={
            <Button onClick={() => actions.setFiltering('')}>
              {t('customImages.list.filtering.noMatch.action')}
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
      stickyHeader
      header={
        <Header
          variant="awsui-h1-sticky"
          info={<InfoLink helpPanel={<CustomImagesHelpPanel />} />}
          description={
            <Trans i18nKey="customImages.header.description">
              <Link
                variant="primary"
                external
                externalIconAriaLabel={t('global.openNewTab')}
                href="https://docs.aws.amazon.com/parallelcluster/latest/ug/custom-ami-v3.html"
              ></Link>
            </Trans>
          }
          counter={images && `(${images.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button className="action" onClick={refreshImages}>
                {t('customImages.actions.refresh')}
              </Button>
              <StatusSelect />
              <Button className="action" onClick={buildImage}>
                {t('customImages.actions.build')}
              </Button>
            </SpaceBetween>
          }
        >
          {t('customImages.header.title')}
        </Header>
      }
      columnDefinitions={[
        {
          id: 'name',
          header: t('customImages.list.columns.name'),
          cell: image => image.imageId,
          sortingField: 'imageId',
        },
        {
          id: 'ami-id',
          header: t('customImages.list.columns.amiId'),
          cell: image => (image.ec2AmiInfo ? image.ec2AmiInfo.amiId : ''),
        },
        {
          id: 'status',
          header: t('customImages.list.columns.status'),
          cell: image => image.imageBuildStatus || '-',
          sortingField: 'imageBuildStatus',
        },
        {
          id: 'region',
          header: t('customImages.list.columns.region'),
          cell: image => image.region || '-',
          sortingField: 'region',
        },
        {
          id: 'version',
          header: t('customImages.list.columns.version'),
          cell: image => image.version || '-',
        },
      ]}
      loading={!images}
      items={items}
      selectionType="single"
      loadingText={t('customImages.list.filtering.loadingText')}
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={t('customImages.list.filtering.countText', {
            filteredItemsCount,
          })}
          filteringAriaLabel={t(
            'customImages.list.filtering.filteringAriaLabel',
          )}
          filteringPlaceholder={t(
            'customImages.list.filtering.filteringPlaceholder',
          )}
        />
      }
      selectedItems={selected}
      onSelectionChange={e => {
        select(e.detail.selectedItems[0])
      }}
    />
  )
}

type Status = Ec2AmiState.Available | Ec2AmiState.Pending | Ec2AmiState.Failed

function statusToOption(t: TFunction, status: Status) {
  switch (status) {
    case Ec2AmiState.Available:
      return {
        label: t('customImages.actions.statusSelect.available'),
        value: Ec2AmiState.Available,
      }
    case Ec2AmiState.Pending:
      return {
        label: t('customImages.actions.statusSelect.pending'),
        value: Ec2AmiState.Pending,
      }
    case Ec2AmiState.Failed:
      return {
        label: t('customImages.actions.statusSelect.failed'),
        value: Ec2AmiState.Failed,
      }
  }
}

function StatusSelect() {
  const {t} = useTranslation()
  const defaultStatus = statusToOption(t, Ec2AmiState.Available)
  const [status, setStatus] = React.useState(defaultStatus)

  return (
    <Select
      className="status-select"
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
        statusToOption(t, Ec2AmiState.Available),
        statusToOption(t, Ec2AmiState.Pending),
        statusToOption(t, Ec2AmiState.Failed),
      ]}
      selectedAriaLabel={t(
        'customImages.actions.statusSelect.selectedAriaLabel',
      )}
    />
  )
}

function CustomImagesHelpPanel() {
  const {t} = useTranslation()
  const footerLinks = useMemo(
    () => [
      {
        title: t('customImages.helpPanel.amiCustomizationlink.title'),
        href: t('customImages.helpPanel.amiCustomizationlink.href'),
      },
      {
        title: t('customImages.helpPanel.buildImagePropertieslink.title'),
        href: t('customImages.helpPanel.buildImagePropertieslink.href'),
      },
    ],
    [t],
  )
  return (
    <TitleDescriptionHelpPanel
      title={t('customImages.helpPanel.title')}
      description={<Trans i18nKey="customImages.helpPanel.description" />}
      footerLinks={footerLinks}
    />
  )
}

const customImageSlug = 'customImages'

export default function CustomImages() {
  const {t} = useTranslation()
  const imageId = useState(['app', 'customImages', 'selected'])

  const [splitOpen, setSplitOpen] = React.useState(true)

  useHelpPanel(<CustomImagesHelpPanel />)

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
            preferencesTitle: t('global.splitPanel.preferencesTitle'),
            preferencesPositionLabel: t(
              'global.splitPanel.preferencesPositionLabel',
            ),
            preferencesPositionDescription: t(
              'global.splitPanel.preferencesPositionDescription',
            ),
            preferencesPositionSide: t(
              'global.splitPanel.preferencesPositionSide',
            ),
            preferencesPositionBottom: t(
              'global.splitPanel.preferencesPositionBottom',
            ),
            preferencesConfirm: t('global.splitPanel.preferencesConfirm'),
            preferencesCancel: t('global.splitPanel.preferencesCancel'),
            closeButtonAriaLabel: t('global.splitPanel.closeButtonAriaLabel'),
            openButtonAriaLabel: t('global.splitPanel.openButtonAriaLabel'),
            resizeHandleAriaLabel: t('global.splitPanel.resizeHandleAriaLabel'),
          }}
          header={
            imageId
              ? t('customImages.splitPanel.imageSelectedText', {imageId})
              : t('customImages.splitPanel.noImageSelectedText')
          }
        >
          {imageId ? (
            <CustomImageDetails />
          ) : (
            <div>
              <h3 style={{userSelect: 'none'}}>
                {t('customImages.splitPanel.selectImageText')}
              </h3>
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
