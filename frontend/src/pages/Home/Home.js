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

import { setState, useState } from '../../store'

// UI Elements
import AppLayout from "@awsui/components-react/app-layout";

// Components
import SideBar from '../../components/SideBar';

function HomeContent() {
  return <div>
    <h2>Welcome to PCluster Manager</h2>
    This site provides an interface for creating and managing AWS ParallelCluster instances.
    <br /><br />
    Please choose from one of the options on the left side-bar. If you only see the 'Home' icon,
    then your account is in 'guest' mode and will need to be upgraded by an administrator of this
    instance of PCluster Manager. Please contact one of the administrators to have your account
    upgraded.
    <br /><br />
    </div>
}

export default function Home() {
  const navigationOpen = useState(['app', 'sidebar', 'drawerOpen']);

  return (
    <AppLayout
      className="app-layout"
      headerSelector="#top-bar"
      navigationWidth="220px"
      toolsHide={true}
      splitHide={true}
      navigationOpen = {navigationOpen}
      onNavigationChange = {(e) => {setState(['app', 'sidebar', 'drawerOpen'], e.detail.open)}}
      content={<HomeContent />}
      navigation={<SideBar />}
    />
  );
}
