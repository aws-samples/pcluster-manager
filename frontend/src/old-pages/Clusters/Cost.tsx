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

import { useState, consoleDomain, setState } from '../../store'
import { getIn } from '../../util'
import { useCollection } from '@awsui/collection-hooks';


// UI Elements
import {
  Button,
  Box,
  BarChart
} from "@awsui/components-react";

// Components
import EmptyState from '../../components/EmptyState';
import { ActivateTags, GetTagStatus, GetGraphData } from '../../model';


export default function Cost() {
  const clusterName = useState(['app', 'clusters', 'selected']);
  const defaultRegion = useState(['aws', 'region']);
  const tag_active = useState(['app', 'tags', 'active']);
  const usage_data = useState(['app', 'costs', 'data']); 


  // Check tag status
  const check_tags = () => {
    const status_update = (value: any) => {
      setState(['app', 'tags', 'active'], value['TagStatus']);
    }
    GetTagStatus(status_update)
  }

  // Activate all the tags
  const Activate_Tags = () => {
    const success = () => {
      setState(['app', 'tags', 'active'], true);
    }
    ActivateTags(success)
  }

  // Load in the usage data for the graph
  const get_graph_data = () => {
    const loading = (value: any) => {
      setState(['app', 'costs', 'data'], value['ResultsByTime']);
    }
    GetGraphData(loading)
  }

  React.useEffect(() => {
      check_tags()
      get_graph_data()
  },[])

  return <> 
  <Button disabled={tag_active} onClick={Activate_Tags}>Activate Tags</Button> 
  <BarChart
  series={[
    {
      title: "t2.micro",
      type: "bar",
      data: [
        { x: new Date(1601103600000), y: 12 },
        { x: new Date(1601110800000), y: 18 },
        { x: new Date(1601118000000), y: 15 },
        { x: new Date(1601125200000), y: 9 },
        { x: new Date(1601132400000), y: 18 }
      ]
    },
    {
      title: "hpc6a.48xlarge",
      type: "bar",
      data: [
        { x: new Date(1601103600000), y: 8 },
        { x: new Date(1601110800000), y: 11 },
        { x: new Date(1601118000000), y: 12 },
        { x: new Date(1601125200000), y: 11 },
        { x: new Date(1601132400000), y: 13 }
      ]
    },
    {
      title: "t2.large",
      type: "bar",
      data: [
        { x: new Date(1601103600000), y: 7 },
        { x: new Date(1601110800000), y: 9 },
        { x: new Date(1601118000000), y: 8 },
        { x: new Date(1601125200000), y: 7 },
        { x: new Date(1601132400000), y: 5 }
      ]
    },
    {
      title: "No Instance Type***",
      type: "bar",
      data: [
        { x: new Date(1601103600000), y: 14 },
        { x: new Date(1601110800000), y: 8 },
        { x: new Date(1601118000000), y: 6 },
        { x: new Date(1601125200000), y: 4 },
        { x: new Date(1601132400000), y: 6 }
      ]
    }
  ]}
  xDomain={[
    // usage_data.map(day =>
    //   new Date(day.TimePeriod['Start'])
    // )
    //   TimePeriod = day['TimePeriod']
    //   Date_value =  TimePeriod['Start']
    // new Date(Date_value),
    new Date(1601103600000),
    new Date(1601110800000),
    new Date(1601118000000),
    new Date(1601125200000),
    new Date(1601132400000),
  ]}
  yDomain={[0, 50]}
  i18nStrings={{
    filterLabel: "Filter displayed data",
    filterPlaceholder: "Filter data",
    filterSelectedAriaLabel: "selected",
    legendAriaLabel: "Legend",
    chartAriaRoleDescription: "line chart",
    xTickFormatter: e =>
      e
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: !1
        })
        .split(",")
        .join("\n")
  }}
  ariaLabel="Stacked bar chart"
  errorText="Error loading data."
  height={300}
  hideFilter
  loadingText="Loading chart"
  recoveryText="Retry"
  stackedBars
  xScaleType="categorical"
  xTitle="Date"
  yTitle="Cost(s) $"
  empty={
    <Box textAlign="center" color="inherit">
      <b>No data available</b>
      <Box variant="p" color="inherit">
        There is no data available
      </Box>
    </Box>
  }
  noMatch={
    <Box textAlign="center" color="inherit">
      <b>No matching data</b>
      <Box variant="p" color="inherit">
        There is no matching data to display
      </Box>
      <Button>Clear filter</Button>
    </Box>
  }
/> </>
}