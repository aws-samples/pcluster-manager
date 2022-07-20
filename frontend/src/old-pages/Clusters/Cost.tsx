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
import { useState, consoleDomain, setState, clearState } from '../../store'
// import { getIn } from '../../util'
// import { useCollection } from '@awsui/collection-hooks';


// UI Elements
import {
  Button,
  Box,
  BarChart,
  DateRangePicker,
  Container,
  Header,
  SpaceBetween,
} from "@awsui/components-react";

// Components
import HelpTooltip from '../../components/HelpTooltip'
import { ActivateTags, GetTagStatus, GetGraphData } from '../../model';
import { Star } from '@mui/icons-material';
import { totalmem } from 'os';

export default function Cost() {
  const cluster_name = useState(['app', 'clusters', 'selected']);
  const tag_active = useState(['app', 'tags', 'active']);
  const y_domain = useState(['app', 'cost', cluster_name, 'max']);
  const [dateValue, setDateValue] = React.useState(undefined);
  const dates = useState(['app', 'cost', cluster_name, 'dates']) || [];
  const stack_info = useState(['app', 'cost', cluster_name, 'stack_info']) || [];

  // Check tag status
  const check_tags = () => {
    const status_update = (value: {TagStatus?: boolean} ) => {
      setState(['app', 'tags', 'active'], value['TagStatus']);
    }
    GetTagStatus(status_update)
  }

  // Activate all the tags
  const activate_tags = () => {
    const status_update = () => {
      setState(['app', 'tags', 'active'], true);
    }
    ActivateTags(status_update)
  }

  // Pull cost and usage from CE API
  const get_graph_data = (Start: string, End: string) => {
    const query_costs = (data: any) => {
      const usage_data = data['ResultsByTime'];
      const dates: Date[] = [];
      const instance_types = new Set();
      const stack_info: any[] = [];
      let day_info: any[] = [];
      let total = 0;
      let max = 0;
  
      // Find XDomain
      const x_domain = usage_data?.map((obj: any) => {
          dates.push(new Date(obj.TimePeriod.Start));
      })
    
      // Find All Instance Types
      const data_instance_types = usage_data?.map((obj: any) => {
        let data_by_instance_type = obj.Groups;
        const days = data_by_instance_type?.map((obj2: any) => {
            instance_types.add(obj2.Keys[0]);
        })
      })
  
      // Create a data set for each instance type
      instance_types.forEach((type) => {
          const costs = usage_data?.map((obj: any) => {
              let data_by_instance_type = obj.Groups;
              const day_data = data_by_instance_type?.map((obj2: any) => {
                if (obj2.Keys[0] == type) {
                    total = Number(obj2.Metrics.NetUnblendedCost.Amount) + total
                    day_info.push({
                      x: new Date(obj.TimePeriod.Start),
                      y: Number(parseFloat(obj2.Metrics.NetUnblendedCost.Amount).toFixed(2)),
                    },)
                }
              })
              if (total > max) {
                max = total
              }
              total = 0
          })
          stack_info.push({
            title: type,
            type: 'bar',
            data: day_info,
          })
          day_info = []
    }) 
    setState(['app', 'cost', cluster_name, 'stack_info'], stack_info);
    setState(['app', 'cost', cluster_name, 'dates'], dates);
    setState(['app', 'cost', cluster_name, 'max'], max);
    }
    GetGraphData(query_costs, cluster_name, Start, End)
  }

  const fetchGraphData = (val: any) => {
    let start_value = ""
    let end_value = ""
    if (!val) {
      let current_date = new Date();
      let start = new Date(current_date.setDate(current_date.getDate()-7));
      let start_string = new Date(start).toISOString().split('T');
      let end_string = new Date().toISOString().split('T');
      start_value = String(start_string[0]);
      end_value = String(end_string[0]);
    } 
    else {
      if (val.type === 'relative') {
        if (val.unit === 'day') {
          let current_date = new Date()
          let start = new Date(current_date.setDate(current_date.getDate()-val.amount));
          let start_string = new Date(start).toISOString().split('T');
          let end_string = new Date().toISOString().split('T');
          start_value = String(start_string[0]);
          end_value = String(end_string[0]);
        }
      } 
      else {
        const start = new Date(val.startDate).toISOString().split('T');
        const end = new Date(val.endDate).toISOString().split('T');
        start_value = String(start[0]);
        end_value = String(end[0])
      }
    }
    get_graph_data(String(start_value), String(end_value));
  }

  // These will be called once on loading of page
  React.useEffect(() => {
      check_tags()
      const Default = {
          key: 'previous-7-days',
          type: 'relative',
          unit: 'day',
          amount: 7,
        };
      fetchGraphData(Default);
      setDateValue(Default);
  },[])

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween
              direction="horizontal"
              size="xs"
            >
              <DateRangePicker
              onChange={({ detail }) => {fetchGraphData(detail.value); setDateValue(detail.value); }}
                value={dateValue}
                relativeOptions={[
                  {
                    key: "previous-30-days",
                    amount: 30,
                    unit: "day",
                    type: "relative"
                  },
                  {
                    key: "previous-14-days",
                    amount: 14,
                    unit: "day",
                    type: "relative"
                  },
                  {
                    key: "previous-7-days",
                    amount: 7,
                    unit: "day",
                    type: "relative"
                  },
                  {
                    key: "previous-1-day",
                    amount: 1,
                    unit: "day",
                    type: "relative"
                  }
                ]}
                i18nStrings={{
                  todayAriaLabel: "Today",
                  nextMonthAriaLabel: "Next month",
                  previousMonthAriaLabel: "Previous month",
                  customRelativeRangeDurationLabel: "Duration",
                  customRelativeRangeDurationPlaceholder:
                    "Enter duration",
                  customRelativeRangeOptionLabel: "Custom range",
                  customRelativeRangeOptionDescription:
                    "Set a custom range of days in the past. Use Days as Unit of Time.",
                  customRelativeRangeUnitLabel: "Unit of time",
                  formatRelativeRange: e => {
                    const t =
                      1 === e.amount ? e.unit : `${e.unit}s`;
                    return `Last ${e.amount} ${t}`;
                  },
                  formatUnit: (e, t) => (1 === t ? e : `${e}s`),
                  dateTimeConstraintText:
                    "Select any Range of days. Use 24 hour format.",
                  relativeModeTitle: "Relative range",
                  absoluteModeTitle: "Absolute range",
                  relativeRangeSelectionHeading: "Choose a range",
                  startDateLabel: "Start date",
                  endDateLabel: "End date",
                  startTimeLabel: "Start time",
                  endTimeLabel: "End time",
                  clearButtonLabel: "Clear and dismiss",
                  cancelButtonLabel: "Cancel",
                  applyButtonLabel: "Apply"
                }}
                placeholder="Filter by a date range" />
        <Button disabled={tag_active} onClick={activate_tags} variant="primary">Activate Tags</Button> 
        <HelpTooltip> 
        The NoInstanceType category includes miscellaneous costs such as EBS, read more about <a href="https://aws.amazon.com/ebs/pricing/" target="-blank"> EBS Pricing</a>.
        </HelpTooltip>
            </SpaceBetween>
          }
        >
          Cluster Costs
        </Header>
      }
    >
         <BarChart
        series={stack_info}
        xDomain={dates}
        // Set Max Dynamically
        yDomain={[0,(y_domain * 2)]}
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
                // hour: "numeric",
                // minute: "numeric",
                // hour12: !1
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
      ></BarChart>
    </Container>
  );
}