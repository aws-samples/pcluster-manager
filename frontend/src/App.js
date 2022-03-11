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

import React from 'react';

import { LoadInitialState} from './model'

import { useState } from './store'
import './App.css';

import Clusters from "./pages/Clusters/Clusters"
import Configure from "./pages/Configure/Configure"
import CustomImages from "./pages/CustomImages/CustomImages"
import OfficialImages from "./pages/OfficialImages/OfficialImages"
import Users from "./pages/Users/Users"
import Home from "./pages/Home/Home"

import "@awsui/global-styles/index.css"

// UI Elements
import CssBaseline from '@mui/material/CssBaseline';

// Components
import TopBar from './components/TopBar';
import Loading from './components/Loading'

export default function App() {

  const identity = useState(['identity']);
  const groups = useState(['identity', 'cognito:groups']);
  const section = useState(['app', 'section']);

  const isGuest = () => {
    return identity && (!groups || ((!groups.includes("admin")) && (!groups.includes("user"))));
  }

  let defaultPage = isGuest() ? "home" : "clusters";

  React.useEffect(() => {
    LoadInitialState();
  }, [])

  console.log("section: ", section);

  return <>
      <TopBar />
      <CssBaseline />
      {identity ?
        {"home": <Home />,
         "clusters": <Clusters />,
         "configure": <Configure />,
         "custom-images": <CustomImages />,
         "official-images": <OfficialImages />,
         "users": <Users />}[section || defaultPage]
        : <Loading />
      }
  </>;
}
