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

import * as React from 'react'

import {useState, setState} from '../store'
import {LoadInitialState} from '../model'

// UI Elements
import TopNavigation from '@cloudscape-design/components/top-navigation'
import {useQueryClient} from 'react-query'
import {NavigateFunction, useNavigate} from 'react-router-dom'

export function regions(selected: string) {
  const supportedRegions = [
    [
      ['US East (N. Virginia)', 'us-east-1'],
      ['US East (Ohio)', 'us-east-2'],
      ['US West (N. California)', 'us-west-1'],
      ['US West (Oregon)', 'us-west-2'],
    ],
    [
      ['Asia Pacific (Mumbai)', 'ap-south-1'],
      ['Asia Pacific (Seoul)', 'ap-northeast-2'],
      ['Asia Pacific (Singapore)', 'ap-southeast-1'],
      ['Asia Pacific (Sydney)', 'ap-southeast-2'],
      ['Asia Pacific (Tokyo)', 'ap-northeast-1'],
    ],
    [['Canada (Central)', 'ca-central-1']],
    [
      ['Europe (Frankfurt)', 'eu-central-1'],
      ['Europe (Ireland)', 'eu-west-1'],
      ['Europe (London)', 'eu-west-2'],
      ['Europe (Paris)', 'eu-west-3'],
      ['Europe (Stockholm)', 'eu-north-1'],
    ],
    [['South America (São Paulo)', 'sa-east-1']],
  ]

  const optInRegions = [
    ['Africa (Cape Town)', 'af-south-1'],
    ['Asia Pacific (Hong Kong)', 'ap-east-1'],
    ['Europe (Milan)', 'eu-south-1'],
    ['Middle East (Bahrain)', 'me-south-1'],
    ['China (Beijing)', 'cn-north-1'],
    ['China (Ningxia)', 'cn-northwest-1'],
    ['AWS GovCloud (US-East)', 'us-gov-east-1'],
    ['AWS GovCloud (US-West)', 'us-gov-west-1'],
  ]

  const optInRegion = optInRegions.filter(region => region[1] === selected)
  if (optInRegion.length > 0) {
    supportedRegions.unshift(optInRegion)
  }

  return supportedRegions
}

const regionsToDropdownItems = (
  regionGroups: string[][][],
  selected: string,
) => {
  return regionGroups.map((regions, i) => {
    return {
      type: 'menu-dropdown',
      className: 'region-group',
      id: i,
      text: '',
      items: regions.map(([regionName, region]) => {
        let className = 'region'
        if (selected === region) className += ' region-selected'

        return {
          type: 'button',
          id: region,
          text: (
            <span className={className}>
              <span className="region-name">{regionName}</span>{' '}
              <span className="region-id">{region}</span>
            </span>
          ),
        }
      }),
    }
  })
}

export const clearClusterOnRegionChange = (
  path: string,
  navigate: NavigateFunction,
): void => {
  if (path.indexOf('/clusters') > -1) {
    navigate('/clusters')
  }
}

export default function Topbar() {
  let username = useState(['identity', 'attributes', 'email'])
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const defaultRegion = useState(['aws', 'region']) || 'DEFAULT'
  const selectedRegion = useState(['app', 'selectedRegion']) || defaultRegion
  const displayedRegions = regions(selectedRegion)

  const handleLogout = () => {
    window.location.href = 'logout'
  }

  const selectRegion = (region: any) => {
    let newRegion = region.detail.id
    setState(['app', 'selectedRegion'], newRegion)
    clearClusterOnRegionChange(location.pathname, navigate)
    LoadInitialState()
    queryClient.invalidateQueries()
  }

  const profileActions = [{type: 'button', id: 'signout', text: 'Sign out'}]

  return (
    <div id="top-bar">
      <TopNavigation
        identity={{
          title: 'AWS ParallelCluster UI',
          href: '/',
          logo: {
            src: '/img/pcluster.svg',
            alt: 'AWS ParallelCluster UI Logo',
          },
        }}
        utilities={[
          ...[
            username
              ? {
                  type: 'menu-dropdown',
                  text: username || 'user',
                  iconName: 'user-profile',
                  onItemClick: handleLogout,
                  items: profileActions,
                }
              : {
                  type: 'button',
                  text: 'loading...',
                },
          ],
          ...[
            selectedRegion && {
              type: 'menu-dropdown',
              ariaLabel: 'Region',
              disableUtilityCollapse: true,
              text: (
                <span style={{fontWeight: 'normal'}}>
                  {selectedRegion || 'region'}
                </span>
              ),
              onItemClick: selectRegion,
              items: regionsToDropdownItems(displayedRegions, selectedRegion),
            },
          ],
        ]}
        // @ts-expect-error TS(2741) FIXME: Property 'overflowMenuTitleText' is missing in typ... Remove this comment to see the full error message
        i18nStrings={{
          searchIconAriaLabel: 'Search',
          searchDismissIconAriaLabel: 'Close search',
          overflowMenuTriggerText: 'More',
        }}
      />
    </div>
  )
}
