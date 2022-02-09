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

import { useState } from '../../store'

// UI Elements
import Tabs from "@awsui/components-react/tabs"

// Components
import ClusterStackEvents from './ClusterStackEvents'
import ClusterInstances from './ClusterInstances'
import ClusterFilesystems from './ClusterFilesystems'
import ClusterScheduling from './ClusterScheduling'
import ClusterProperties from './ClusterProperties'
import ClusterLogs from './ClusterLogs'
import Loading from '../../components/Loading'

export default function ClusterTabs() {

  const clusterName = useState(['app', 'clusters', 'selected']);
  const cluster = useState(['clusters', 'index', clusterName]);

  return cluster ?
      <Tabs tabs={[
        {label: "Details", id: "details", content: <ClusterProperties />},
        {label: "Instances", id: "instances", content: <ClusterInstances />},
        {label: "Filesystems", id: "filesytems", content: <ClusterFilesystems />},
        {label: "Job Scheduling", id: "scheduling", content: <ClusterScheduling />},
        {label: "Stack Events", id: "stack-events", content: <ClusterStackEvents />},
        {label: "Logs", id: "logs", content: <ClusterLogs />}
      ]} />
      : <div style={{textAlign: "center", paddingTop: "40px"}}>
        <Loading />
      </div>
}
