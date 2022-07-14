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
import { Link, useLocation } from "react-router-dom"
import { setState, useState, isGuest, isUser, isAdmin } from '../store'

// UI Elements
import Divider from '@mui/material/Divider';
import useNotifier from '../redux/useNotifier';

// Icons
import GridOnIcon from '@mui/icons-material/GridOn';
import ImageIcon from '@mui/icons-material/Image';
import LayersIcon from '@mui/icons-material/Layers';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from 'react-i18next';

export function SideBarIcons(props: any) {
  const drawerOpen = useState(['app', 'sidebar', 'drawerOpen']);
  
  const location = useLocation();
  let defaultPage = isGuest() ? "home" : "clusters";
  let section = location && location.pathname && location.pathname.substring(1);
  section = section && (section.indexOf('/') !== -1 ? section.substring(0, section.indexOf('/')) : section)
  section = section || defaultPage;

  return (
    <div className="sidebar-icons"
      style={{display: drawerOpen ? "none" : "block"}}>
      <Link to='/home' className={section === "home" ? "selected" : ""} key="Home">
        <HomeIcon />
      </Link>
        {isUser() &&
        <Link to='/clusters' className={section === "clusters" ? "selected" : ""} key="Clusters">
          <GridOnIcon />
        </Link>
        }
        {isUser() &&
          <Link to='/custom-images' className={section === "custom-images" ? "selected" : ""} key="Custom Images">
            <ImageIcon />
          </Link>
        }
        {isUser() &&
          <Link to='/official-images' className={section === "official-images" ? "selected" : ""} key="Official Images">
            <LayersIcon />
          </Link>
        }
        {isAdmin() &&
          <Link to='/users' className={section === "users" ? "selected" : ""} key="Users">
            <GroupIcon />
          </Link>}
    </div>
  )
}

export default function SideBar(props: any) {
  const drawerOpen = useState(['app', 'sidebar', 'drawerOpen']);
  const { t } = useTranslation();
  useNotifier();

  const location = useLocation();
  let defaultPage = isGuest() ? "home" : "clusters";
  let section = location && location.pathname && location.pathname.substring(1);
  section = section && (section.indexOf('/') !== -1 ? section.substring(0, section.indexOf('/')) : section)
  section = section || defaultPage;

  React.useEffect(() => {
    if(drawerOpen === undefined)
      setState(['app', 'sidebar', 'drawerOpen'], true);
  }, [drawerOpen]);

  return (
    <div className="sidebar">
      <Link to='/home' className={section === "home" ? "selected" : ""} key="Home">
        <HomeIcon />{t("global.menu.home")}
      </Link>
      {isUser() &&
      <Link to='/clusters' className={section === "clusters" ? "selected" : ""} key="Clusters">
        <GridOnIcon />Clusters
      </Link>
      }
      {isUser() &&
        <Link to='/custom-images' className={section === "custom-images" ? "selected" : ""} key="Custom Images">
          <ImageIcon />Custom Images
        </Link>
      }
      {isUser() &&
        <Link to='/official-images' className={section === "official-images" ? "selected" : ""} key="Official Images">
          <LayersIcon />Official Images
        </Link>
      }
      {isAdmin() &&
        <Link to='/users' className={section === "users" ? "selected" : ""} key="Users">
          <GroupIcon />Users
        </Link>}
      <Divider />
      <div style={{display: 'flex', justifyContent: "center", alignItems: "flex-start", paddingTop: "20px", paddingRight: "20px"}}>
        <img style={{display: "inline-block"}} alt="AWS Logo" width={140} src="/img/aws_logo.png" />
      </div>
    </div>
  )}
