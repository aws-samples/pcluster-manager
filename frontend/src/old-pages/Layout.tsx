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

type Slug = 'clusters' | 'customImages' | 'officialImages' | 'users'
type TransBreadcrumbItem = {transKey: string; href: string}

const transKeyPrefix = 'global.menu'

const pageBreadcrumbItems: Record<Slug, TransBreadcrumbItem> = {
  clusters: {transKey: `${transKeyPrefix}.clusters`, href: '#clusters'},
  customImages: {
    transKey: `${transKeyPrefix}.customImages`,
    href: '#custom-images',
  },
  officialImages: {
    transKey: `${transKeyPrefix}.officialImages`,
    href: '#official-images',
  },
  users: {transKey: `${transKeyPrefix}.users`, href: '#users'},
}

export function breadcrumbItemFromSlug(
  slug: Slug,
  t: (key: string) => string,
): BreadcrumbGroupProps.Item {
  const {transKey, href} = pageBreadcrumbItems[slug]
  console.log('TRANS KEY', transKey)
  return {text: t(transKey), href}
}

export function breadcrumbItem(
  transKey: string,
  t: (key: string) => string,
): BreadcrumbGroupProps.Item {
  return {text: t(transKey), href: '#'}
}

const mainBreadcrumbTransItem: TransBreadcrumbItem = {
  transKey: `${transKeyPrefix}.header`,
  href: '/',
}

function mainBreadcrumbItem(
  t: (key: string) => string,
): BreadcrumbGroupProps.Item {
  const {transKey, href} = mainBreadcrumbTransItem
  return {text: t(transKey), href}
}

function processBreadcrumbSlugs(slugs: string[], t: (key: string) => string) {
  if (!slugs || slugs.length < 1) {
    return []
  }

  return _.map<string, BreadcrumbGroupProps.Item>(slugs, slug => {
    if (pageBreadcrumbItems.hasOwnProperty(slug)) {
      return breadcrumbItemFromSlug(slug as Slug, t)
    }

    return breadcrumbItem(slug, t)
  })
}

export function Breadcrumbs({
  slugs,
  onClick,
}: {
  slugs: string[]
  onClick?: any
}) {
  const {t} = useTranslation()

  const items = useMemo(
    () => [mainBreadcrumbItem(t), ...processBreadcrumbSlugs(slugs, t)],
    [slugs, t],
  )

  const ariaLabel = useMemo(() => t(`${transKeyPrefix}.header`), [t])

  return (
    <BreadcrumbGroup items={items} ariaLabel={ariaLabel} onClick={onClick} />
  )
}

export default function Layout({
  children,
  breadcrumbs,
  ...props
}: PropsWithChildren<Partial<AppLayoutProps>>) {
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
        breadcrumbs={breadcrumbs}
        notifications={<Flashbar items={messages} />}
        {...props}
        tools={element}
        toolsOpen={open}
        onToolsChange={updateHelpPanelVisibility}
      />
    </>
  )
}
