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
import React, {useMemo} from 'react'

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
import {useHelpPanel} from '../../components/help-panel/HelpPanel'
import {Trans, useTranslation} from 'react-i18next'
import TitleDescriptionHelpPanel from '../../components/help-panel/TitleDescriptionHelpPanel'
import InfoLink from '../../components/InfoLink'

type Image = {
  amiId: string
  os: string
  architecture: string
  version: string
}

function OfficialImagesHelpPanel() {
  const {t} = useTranslation()
  const footerLinks = useMemo(
    () => [
      {
        title: t('officialImages.helpPanel.link.title'),
        href: t('officialImages.helpPanel.link.href'),
      },
    ],
    [t],
  )
  return (
    <TitleDescriptionHelpPanel
      title={t('officialImages.helpPanel.title')}
      description={<Trans i18nKey="officialImages.helpPanel.description" />}
      footerLinks={footerLinks}
    />
  )
}

function OfficialImagesList({images}: {images: Image[]}) {
  const {t} = useTranslation()
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
          title={t('officialImages.list.filtering.empty.title')}
          subtitle={t('officialImages.list.filtering.empty.subtitle')}
          action={<></>}
        />
      ),
      noMatch: (
        <EmptyState
          title={t('officialImages.list.filtering.noMatch.title')}
          subtitle={t('officialImages.list.filtering.noMatch.subtitle')}
          action={
            <Button onClick={() => actions.setFiltering('')}>
              {t('officialImages.list.filtering.noMatch.action')}
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
          description={t('officialImages.header.description')}
          info={<InfoLink helpPanel={<OfficialImagesHelpPanel />} />}
        >
          {t('officialImages.header.title')}
        </Header>
      }
      columnDefinitions={[
        {
          id: 'id',
          header: t('officialImages.list.columns.id'),
          cell: item => item.amiId,
          sortingField: 'amiId',
        },
        {
          id: 'os',
          header: t('officialImages.list.columns.os'),
          cell: item => item.os || '-',
          sortingField: 'os',
        },
        {
          id: 'architecture',
          header: t('officialImages.list.columns.architecture'),
          cell: item => item.architecture || '-',
          sortingField: 'architecture',
        },
        {
          id: 'version',
          header: t('officialImages.list.columns.version'),
          cell: item => item.version || '-',
        },
      ]}
      loading={!images}
      items={items}
      loadingText={t('officialImages.list.filtering.loadingText')}
      pagination={<Pagination {...paginationProps} />}
      filter={
        <TextFilter
          {...filterProps}
          countText={t('officialImages.list.filtering.countText', {
            filteredItemsCount,
          })}
          filteringAriaLabel={t(
            'officialImages.list.filtering.filteringAriaLabel',
          )}
          filteringPlaceholder={t(
            'officialImages.list.filtering.filteringPlaceholder',
          )}
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

  useHelpPanel(<OfficialImagesHelpPanel />)

  return (
    <Layout pageSlug={officialImagesSlug}>
      <OfficialImagesList images={data} />
    </Layout>
  )
}
