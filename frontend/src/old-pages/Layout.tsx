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
import {PropsWithChildren} from 'react'
import {useLocationChangeLog} from '../navigation/useLocationChangeLog'

export default function Layout({
  children,
  ...props
}: PropsWithChildren<Partial<AppLayoutProps>>) {
  const messages = useState(['app', 'messages']) || []
  useLocationChangeLog()

  return (
    <>
      <TopBar />
      <AppLayout
        headerSelector="#top-bar"
        toolsHide
        content={children}
        contentType="table"
        navigation={<SideBar />}
        notifications={<Flashbar items={messages} />}
        {...props}
      />
    </>
  )
}
