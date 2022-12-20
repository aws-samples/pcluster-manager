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

import {useState} from '../store'
// UI Elements
import AppLayout, {
  AppLayoutProps,
} from '@cloudscape-design/components/app-layout'
import {Flashbar} from '@cloudscape-design/components'

// Components
import TopBar from '../components/TopBar'
import SideBar from '../components/SideBar'
import {PropsWithChildren, useCallback, useMemo} from 'react'
import {useLocationChangeLog} from '../navigation/useLocationChangeLog'
import {useHelpPanel} from '../components/help-panel/HelpPanel'
import {NonCancelableEventHandler} from '@cloudscape-design/components/internal/events'
import {BreadcrumbGroupProps} from '@cloudscape-design/components/breadcrumb-group/interfaces'
import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group'
import {useTranslation} from 'react-i18next'
import _ from 'lodash'

type Slug =
  | 'clusters'
  | 'customImages'
  | 'officialImages'
  | 'users'
  | 'clusterCreate'
  | 'clusterUpdate'
type BreadcrumbsProps = {pageSlug: Slug; slugOnClick?: any}

const pageBreadcrumbItems = {
  clusters: [{transKey: 'global.menu.clusters', href: '/clusters'}],
  customImages: [
    {
      transKey: 'global.menu.customImages',
      href: '/custom-images',
    },
  ],
  officialImages: [
    {
      transKey: 'global.menu.officialImages',
      href: '/official-images',
    },
  ],
  users: [{transKey: 'global.menu.users', href: '/users'}],
  clusterCreate: [
    {transKey: 'global.menu.clusters', href: '/clusters'},
    {transKey: 'wizard.actions.create', href: '#'},
  ],
  clusterUpdate: [
    {transKey: 'global.menu.clusters', href: '/clusters'},
    {transKey: 'wizard.actions.update', href: '#'},
  ],
}

export function breadcrumbItemsFromSlug(
  slug: Slug,
  t: (key: string) => string,
): BreadcrumbGroupProps.Item[] {
  const items = pageBreadcrumbItems[slug]
  return _.map(items, ({transKey, href}) => ({text: t(transKey), href}))
}

function mainBreadcrumbItem(
  t: (key: string) => string,
): BreadcrumbGroupProps.Item {
  return {text: t('global.menu.header'), href: '/'}
}

export function Breadcrumbs({slug, onClick}: {slug: Slug; onClick?: any}) {
  const {t} = useTranslation()

  const items = useMemo(
    () => [mainBreadcrumbItem(t), ...breadcrumbItemsFromSlug(slug, t)],
    [slug, t],
  )

  return (
    <BreadcrumbGroup
      items={items}
      ariaLabel={t('global.menu.header')}
      onClick={onClick}
    />
  )
}

export default function Layout({
  children,
  pageSlug,
  slugOnClick,
  ...props
}: BreadcrumbsProps & PropsWithChildren<Partial<AppLayoutProps>>) {
  const messages = useState(['app', 'messages']) || []
  useLocationChangeLog()

  const {element, open, setVisible} = useHelpPanel()
  const updateHelpPanelVisibility: NonCancelableEventHandler<AppLayoutProps.ChangeDetail> =
    useCallback(({detail}) => setVisible(detail.open), [setVisible])

  return (
    <>
      <TopBar />
      <AppLayout
        headerSelector="#top-bar"
        content={children}
        contentType="table"
        navigation={<SideBar />}
        breadcrumbs={<Breadcrumbs slug={pageSlug} {...slugOnClick} />}
        notifications={<Flashbar items={messages} />}
        {...props}
        tools={element}
        toolsOpen={open}
        onToolsChange={updateHelpPanelVisibility}
      />
    </>
  )
}
