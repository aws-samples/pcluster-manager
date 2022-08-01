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

// UI Elements
import {
  Button,
  Box,
  BarChart,
  DateRangePicker,
  Container,
  Header,
  SpaceBetween,
  Table,
  ProgressBar
} from "@awsui/components-react";

// Components
import HelpTooltip from '../../components/HelpTooltip'
import { ActivateTags, GetTagStatus, GetGraphData, GetBudget } from '../../model';

export default function Cost() {
  const [dateValue, setDateValue] = React.useState(undefined);
  const defaultRegion = useState(['aws', 'region']) || 'us-east-1';
  const region = useState(['app', 'selectedRegion']) || defaultRegion;
  const cluster_name = useState(['app', 'clusters', 'selected']);
  const tag_active = useState(['app', 'tags', 'active']);
  const y_axis = useState(['app', 'cost', cluster_name, 'max']);
  const x_axis = useState(['app', 'cost', cluster_name, 'dates']) || [];
  const graph_data = useState(['app', 'cost', cluster_name, 'graph_data']) || [];
  const start_url = useState(['app', 'cost', cluster_name, 'Start']) || [];
  const end_url = useState(['app', 'cost', cluster_name, 'End']) || [];
  const budget_used = useState(['app', 'cost', cluster_name, 'budget']) || [];
  const table_data = useState(['app', 'cost', cluster_name, 'table_data']) || [];
  const url_data = useState(['app', 'cost', cluster_name, 'object']) || [];
  const account_id =  useState(['app', 'account']) || [];

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

  // Get Budget Limit(Monthly)
  const get_budget = () => {
    const budget_data = (value: any) => {
      let budget = value['Budget']
      let percent_used =  (budget.CalculatedSpend.ActualSpend.Amount / budget.BudgetLimit.Amount) * 100;
      setState(['app','cost', cluster_name, 'budget'], percent_used);
    }
    GetBudget(budget_data, cluster_name, account_id)
  }

  // Create URL for Cost Explorer Link
  const create_url = () => {
    let data = [
      {
        "dimension": "TagKeyValue",
        "values": null,
        "include": true,
        "children": [
          {
            "dimension": "parallelcluster:cluster-name",
            "values": [
              cluster_name,
            ],
            "include": true,
            "children": null
          }
        ]
      }
    ]
    setState(['app', 'cost', cluster_name, 'object'], data)
  }

  // Pull cost and usage from CE API
  const get_graph_data = (Start: string, End: string) => {
    const query_costs = (data: any) => {
      const usage_data = data['ResultsByTime'];
      const dates: Date[] = [];
      const instance_types = new Set();
      const day_costs: any[] = [];
      let table_cost_data = [];
      let day_info: any[] = [];
      let total = 0;
      let max = 0;
      let instance_cost = 0;
      let total_range_cost = 0;
  
      // Find XDomain
      const x_domain = usage_data?.map((obj: any) => {
          dates.push(new Date(obj.TimePeriod.End));
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
                    instance_cost = Number(obj2.Metrics.NetUnblendedCost.Amount) + instance_cost
                    total = Number(obj2.Metrics.NetUnblendedCost.Amount) + total
                    total_range_cost = Number(obj2.Metrics.NetUnblendedCost.Amount) + total_range_cost;
                    day_info.push({
                      x: new Date(obj.TimePeriod.End),
                      y: Number(parseFloat(obj2.Metrics.NetUnblendedCost.Amount).toFixed(2)),
                    },)
                }
              })
              // Find highest Cost data in range of days
              if (total > max) {
                max = total
              }
              total = 0
          })
          // Cost Data for each day
          if (type == 'NoInstanceType') {
            type = 'NoInstanceType*'
          }
          day_costs.push({
            title: type,
            type: 'bar',
            data: day_info,
          })
          day_info = []
          // Cost Data for each instance type
          if (table_cost_data.length != instance_types.size) {
            table_cost_data.push({
              name: type,
              alt: '$' + instance_cost.toFixed(2),
              description: `Total Cost for  ${type} instances from ${Start} to ${End}`,
              type: "1A",
              size: "xxLarge"
            })
          }
          instance_cost = 0
    }) 
    // Total Cost data for range of days
    table_cost_data.push({
      name: <b> All Instance Types </b>,
      alt: <b> ${total_range_cost.toFixed(2)} </b>,
      description: <b> Total Cost for all instance types from {Start} to {End} </b>,
      type: "1A",
      size: "xxLarge"
    })
    setState(['app', 'cost', cluster_name, 'graph_data'], day_costs);
    setState(['app', 'cost', cluster_name, 'dates'], dates);
    setState(['app', 'cost', cluster_name, 'max'], max);
    setState(['app', 'cost', cluster_name, 'table_data'], table_cost_data);
    get_budget()
    table_cost_data = [];
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
    setState(['app', 'cost', cluster_name, 'End'],String(end_value));
    setState(['app', 'cost', cluster_name, 'Start'], String(start_value));
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
      create_url();
  },[])

  return (
    <Container
      header={
        <Header
          variant="h2"
          actions={
            <SpaceBetween
              direction="horizontal"
              size="l"
            >
              <Button disabled={tag_active} onClick={activate_tags} variant="primary">Activate Tags</Button>
              <DateRangePicker
              onChange={({ detail }) => {fetchGraphData(detail.value); setDateValue(detail.value);}}
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
        <ProgressBar
      value={budget_used}
      additionalInfo="Create a Budget with an identical name as your respective cluster for accurate information"
      description="Progress"
      label="Cost Usage of Budget"
    />
        <HelpTooltip> 
            If you haven't created a budget, create a custom cost budget on <a href="https://us-east-1.console.aws.amazon.com/billing/home?#/budgets/overview" target="_blank"> AWS Budgets</a>.
        </HelpTooltip>
        <Button
          href={`https://${region}.console.aws.amazon.com/cost-management/home?region=${region}"#/custom?groupBy=InstanceType&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&excludeCategorizedResources=false&excludeForecast=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&filter=${JSON.stringify(url_data)}&chartStyle=Stack&forecastTimeRangeOption=None&usageAs=usageQuantity&startDate=${start_url}&endDate=${end_url}`}
          target='-blank'
          iconAlign="right"
          iconName="external"
        >
          View Data in Cost Explorer
        </Button> 
            </SpaceBetween>
          }
        >
        Cluster Costs
        </Header>
      }
    >
      <SpaceBetween size="xxl">
         <BarChart
        series={graph_data}
        xDomain={x_axis}
        yDomain={[0,(y_axis * 1.9)]}
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
      <Table
      columnDefinitions={[
      {
        id: "variable",
        header: "Instance Type",
        cell: item => item.name || "-",
        sortingField: "name"
      },
      {
        id: "alt",
        header: "Total Cost",
        cell: item => item.alt || "-",
        sortingField: "alt"
      },
      {
        id: "description",
        header: "Summary",
        cell: item => item.description || "-"
      }
      ]}
      items={table_data}
      loadingText="Loading resources"
      sortingDisabled
      empty={
        <Box textAlign="center" color="inherit">
          <b>No resources</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            No resources to display.
          </Box>
          <Button>Create resource</Button>
        </Box>
      }
      header={<Header> Cluster Costs </Header>}
    />
    <div> *The <b>NoInstanceType</b> category includes miscellaneous costs such as EBS, read more about <a href="https://aws.amazon.com/ebs/pricing/" target="-blank"> EBS Pricing</a>.</div>

    </SpaceBetween>
    </Container>
  );
}