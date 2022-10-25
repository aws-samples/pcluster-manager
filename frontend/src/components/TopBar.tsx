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
import TopNavigation from '@awsui/components-react/top-navigation'
import {useQueryClient} from 'react-query'

function regions(selected: any) {
  let supportedRegions = [
    [
      ['US East (N. Virginia)', 'us-east-1'],
      ['US East (Ohio)', 'us-east-2'],
      ['US West (N. California)', 'us-west-1'],
      ['US West (Oregon)', 'us-west-2'],
    ],
    [['Africa (Cape Town)', 'af-south-1']],
    [
      ['Asia Pacific (Hong Kong)', 'ap-east-1'],
      ['Asia Pacific (Mumbai)', 'ap-south-1'],
      ['Asia Pacific (Osaka)', 'ap-northeast-3'],
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
      ['Europe (Milan)', 'eu-south-1'],
      ['Europe (Paris)', 'eu-west-3'],
      ['Europe (Stockholm)', 'eu-north-1'],
    ],
    [['Middle East (Bahrain)', 'me-south-1']],
    [['South America (São Paulo)', 'sa-east-1']],
    [
      ['China (Beijing)', 'cn-north-1'],
      ['China (Ningxia)', 'cn-northwest-1'],
    ],
  ]

  if (selected === 'us-gov-west-1')
    supportedRegions = [
      [
        //["US Gov (east-1)", "us-gov-east-1"],
        ['US Gov (west-1)', 'us-gov-west-1'],
      ],
    ]

  return supportedRegions.map((regions, i) => {
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

export default function Topbar() {
  let username = useState(['identity', 'attributes', 'email'])
  const queryClient = useQueryClient()

  const defaultRegion = useState(['aws', 'region']) || 'DEFAULT'
  const region = useState(['app', 'selectedRegion']) || defaultRegion

  const handleLogout = () => {
    window.location.href = 'logout'
  }

  const selectRegion = (region: any) => {
    let newRegion = region.detail.id
    setState(['app', 'selectedRegion'], newRegion)
    LoadInitialState()
    queryClient.invalidateQueries()
  }

  const profileActions = [{type: 'button', id: 'signout', text: 'Sign out'}]

  return (
    <TopNavigation
      id="top-bar"
      className="top-bar"
      expandToViewport
      // @ts-expect-error TS(2741) FIXME: Property 'href' is missing in type '{ title: strin... Remove this comment to see the full error message
      identity={{
        title: 'AWS ParallelCluster Manager',
        logo: {
          src: '/img/pcluster.svg',
          alt: 'AWS ParallelCluster Manager Logo',
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
          region && {
            type: 'menu-dropdown',
            ariaLabel: 'Region',
            disableUtilityCollapse: true,
            text: (
              <span style={{fontWeight: 'normal'}}>{region || 'region'}</span>
            ),
            onItemClick: selectRegion,
            items: regions(region),
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
  )
}
