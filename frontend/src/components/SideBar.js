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
import * as React from 'react';
import { setState, useState, isAdmin} from '../store'

// UI Elements
import Divider from '@mui/material/Divider';
import useNotifier from '../redux/useNotifier';

// Icons
import GridOnIcon from '@mui/icons-material/GridOn';
import ImageIcon from '@mui/icons-material/Image';
import LayersIcon from '@mui/icons-material/Layers';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';

export function SideBarIcons(props) {
  let identity = useState(['identity']);
  let groups = useState(['identity', 'cognito:groups']) || [];
  const drawerOpen = useState(['app', 'sidebar', 'drawerOpen']);

  const isGuest = () => {
    return identity && (!groups || ((!groups.includes("admin")) && (!groups.includes("user"))));
  }

  const isUser = () => {
    return groups && ((groups.includes("admin")) || (groups.includes("user")));
  }

  let defaultPage = isGuest() ? "home" : "clusters";
  const section = useState(['app', 'section']) || defaultPage;

  const setSection = (section) => {
    setState(['app', 'section'], section)
  }

  return (
    <div className="sidebar-icons"
      style={{display: drawerOpen ? "none" : "block"}}>
      <div className={section === "home" ? "selected" : ""} key="Home" onClick={() => setSection('home')}>
        <HomeIcon />
      </div>
        {isUser() &&
        <div className={section === "clusters" ? "selected" : ""} key="Clusters" onClick={() => setSection('clusters')}>
          <GridOnIcon />
        </div>
        }
        {isUser() &&
          <div className={section === "custom-images" ? "selected" : ""} key="Custom Images" onClick={() => setSection('custom-images')}>
            <ImageIcon />
          </div>
        }
        {isUser() &&
          <div className={section === "official-images" ? "selected" : ""} key="Official Images" onClick={() => setSection('official-images')}>
            <LayersIcon />
          </div>
        }
        {isAdmin() &&
          <div className={section === "users" ? "selected" : ""} key="Users" onClick={() => setSection('users')}>
            <GroupIcon />
          </div>}
    </div>
  )
}

export default function SideBar(props) {
  let identity = useState(['identity']);
  let groups = useState(['identity', 'cognito:groups']);
  const drawerOpen = useState(['app', 'sidebar', 'drawerOpen']);

  const isGuest = () => {
    return identity && (!groups || ((!groups.includes("admin")) && (!groups.includes("user"))));
  }

  const isUser = () => {
    return groups && ((groups.includes("admin")) || (groups.includes("user")));
  }
  let defaultPage = isGuest() ? "home" : "clusters";
  const section = useState(['app', 'section']) || defaultPage;

  useNotifier();
  const setSection = (section) => {
    setState(['app', 'section'], section)
  }

  React.useEffect(() => {
    if(drawerOpen === undefined)
      setState(['app', 'sidebar', 'drawerOpen'], true);
  }, [drawerOpen]);

  return (
    <div className="sidebar">
      <div className={section === "home" ? "selected" : ""} key="Home" onClick={() => setSection('home')}>
        <HomeIcon />Home
      </div>
      {isUser() &&
      <div className={section === "clusters" ? "selected" : ""} key="Clusters" onClick={() => setSection('clusters')}>
        <GridOnIcon />Clusters
      </div>
      }
      {isUser() &&
        <div className={section === "custom-images" ? "selected" : ""} key="Custom Images" onClick={() => setSection('custom-images')}>
          <ImageIcon />Custom Images
        </div>
      }
      {isUser() &&
        <div className={section === "official-images" ? "selected" : ""} key="Official Images" onClick={() => setSection('official-images')}>
          <LayersIcon />Official Images
        </div>
      }
      {isAdmin() && <div className={section === "users" ? "selected" : ""} key="Users" onClick={() => setSection('users')}>
          <GroupIcon />Users
      </div>}
      <Divider />
    </div>
  )}
