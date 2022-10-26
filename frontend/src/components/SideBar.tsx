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
import {SideNavigation, SideNavigationProps} from '@awsui/components-react'
import * as React from 'react'
import {useTranslation} from 'react-i18next'
import {useLocation, useNavigate} from 'react-router-dom'
import {USER_ROLES_CLAIM} from '../auth/constants'
import {isAdmin, isUser, useState} from '../store'

export default function SideBar() {
  const {t} = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const activeHref = '/' + location.pathname.split('/')?.[1]
  const identity = useState(['identity', USER_ROLES_CLAIM])

  const header = React.useMemo(
    () => ({
      href: '/home',
      text: t('global.menu.header'),
    }),
    [t],
  )

  const navigationItems: ReadonlyArray<SideNavigationProps.Item> =
    React.useMemo(() => {
      return [
        {type: 'link', text: t('global.menu.home'), href: '/home'},
        isUser()
          ? {type: 'link', text: t('global.menu.clusters'), href: '/clusters'}
          : null,
        isUser()
          ? {
              type: 'link',
              text: t('global.menu.customImages'),
              href: '/custom-images',
            }
          : null,
        isUser()
          ? {
              type: 'link',
              text: t('global.menu.officialImages'),
              href: '/official-images',
            }
          : null,
        isAdmin()
          ? {type: 'link', text: t('global.menu.users'), href: '/users'}
          : null,
        {type: 'divider'},
        {
          type: 'link',
          text: t('global.menu.viewLicense'),
          href: '/license.txt',
          external: true,
        },
      ].filter(Boolean) as ReadonlyArray<SideNavigationProps.Item>
      // we need to recompute navigationItems according to identity change
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [t, identity])

  const onFollow = React.useCallback(
    event => {
      if (!event.detail.external) {
        event.preventDefault()
        navigate(event.detail.href)
      }
    },
    [navigate],
  )

  return (
    <SideNavigation
      header={header}
      activeHref={activeHref}
      onFollow={onFollow}
      items={navigationItems}
    />
  )
}
