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

import {setState, useState} from '../store'
import {Outlet} from 'react-router-dom'

// UI Elements
import AppLayout from '@awsui/components-react/app-layout'
import {Flashbar} from '@awsui/components-react'

// Components
import TopBar from '../components/TopBar'
import SideBar from '../components/SideBar'

export default function Layout() {
  const messages = useState(['app', 'messages'])

  return (
    <>
      <TopBar />
      <AppLayout
        className="app-layout"
        headerSelector="#top-bar"
        navigationWidth={220}
        toolsHide
        content={
          <>
            <div style={{marginBottom: '30px'}}>
              <Flashbar items={messages} />
            </div>
            <Outlet />
          </>
        }
        navigation={<SideBar />}
      />
    </>
  )
}
