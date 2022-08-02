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
  const clusterName = useState(['app', 'clusters', 'selected']);
  const tagActive = useState(['app', 'tags', 'active']);
  const yAxis = useState(['app', 'cost', clusterName, 'max']);
  const xAxis = useState(['app', 'cost', clusterName, 'dates']) || [];
  const graphData = useState(['app', 'cost', clusterName, 'graphData']) || [];
  const startUrl = useState(['app', 'cost', clusterName, 'Start']) || [];
  const endUrl = useState(['app', 'cost', clusterName, 'End']) || [];
  const budgetUsed = useState(['app', 'cost', clusterName, 'budget']) || [];
  const tableData = useState(['app', 'cost', clusterName, 'tableData']) || [];
  const urlData = useState(['app', 'cost', clusterName, 'object']) || [];
  const accountId =  useState(['app', 'account']) || [];
  const Options = [
    {
      key: "previous-30-days",
      amount: 30,
      unit: "day",
      type: "relative",
    },
    {
      key: "previous-14-days",
      amount: 14,
      unit: "day",
      type: "relative",
    },
    {
      key: "previous-7-days",
      amount: 7,
      unit: "day",
      type: "relative",
    },
    {
      key: "previous-1-day",
      amount: 1,
      unit: "day",
      type: "relative",
    }
  ]

  const checkTags = () => {   // Check tag status
    const statusUpdate = (value: {TagStatus?: boolean}) => {
      setState(['app', 'tags', 'active'], value['TagStatus']);
    }
    GetTagStatus(statusUpdate)
  }

  const activateTags = () => {   // Activate all the tags
    const statusUpdate = () => {
      setState(['app', 'tags', 'active'], true);
    }
    ActivateTags(statusUpdate)
  }

  const getBudget = () => {   // Get percentage of budget used
    const budgetData = (value: any) => {
      let budget = value['Budget']
      let percentUsed =  (budget.CalculatedSpend.ActualSpend.Amount / budget.BudgetLimit.Amount) * 100;
      setState(['app','cost', clusterName, 'budget'], percentUsed);
    }
    GetBudget(budgetData, clusterName, accountId)
  }

  const createUrl = () => {   // Create URL for Cost Explorer Link
    let data = [
      {
        "dimension": "TagKeyValue",
        "values": null,
        "include": true,
        "children": [
          {
            "dimension": "parallelcluster:cluster-name",
            "values": [
              clusterName,
            ],
            "include": true,
            "children": null
          }
        ]
      }
    ]
    setState(['app', 'cost', clusterName, 'object'], data)
  }

  const getGraphData = (Start: string, End: string) => { // Pull cost and usage from CE API
    const queryCosts = (data: any) => {
      const usageData = data['ResultsByTime'];
      let instanceTypes = new Set();
      let dayCosts: any[] = [];
      let dates: Date[] = [];
      let tableCostData = [];
      let dayInfo: any[] = [];
      let total = 0;
      let max = 0;
      let instanceCost = 0;
      let totalRangeCost = 0;
  
      usageData?.forEach((day: any) => { // Find XDomain
        dates.push(new Date(day.TimePeriod.End));
      })

      usageData?.forEach((date: any) => { // Find all instance types
        let dataByInstanceType = date.Groups;
        dataByInstanceType?.forEach((type: any) => {
          instanceTypes.add(type.Keys[0]);
        })
      })
      
      instanceTypes.forEach((type) => { // Create a data set for each instance type
          const costs = usageData?.map((date: any) => {
              let dataByInstanceType = date.Groups;
              const day_data = dataByInstanceType?.map((instanceType: any) => {
                if (instanceType.Keys[0] == type) {
                    instanceCost = Number(instanceType.Metrics.NetUnblendedCost.Amount) + instanceCost
                    total = Number(instanceType.Metrics.NetUnblendedCost.Amount) + total
                    totalRangeCost = Number(instanceType.Metrics.NetUnblendedCost.Amount) + totalRangeCost;
                    dayInfo.push({
                      x: new Date(date.TimePeriod.End),
                      y: Number(parseFloat(instanceType.Metrics.NetUnblendedCost.Amount).toFixed(2)),
                    },)
                }
              })
              max = Math.max(max, total) // Find highest Cost data in range of days
              total = 0
          })
          if (type == 'NoInstanceType') { // Cost Data for each day
            type = 'NoInstanceType*'
          }
          dayCosts.push({
            title: type,
            type: 'bar',
            data: dayInfo,
          })
          dayInfo = []
          if (tableCostData.length != instanceTypes.size) { // Cost Data for each instance type
            tableCostData.push({
              name: type,
              alt: '$' + instanceCost.toFixed(2),
              description: `Total Cost for  ${type} instances from ${Start} to ${End}`,
              type: "1A",
              size: "xxLarge"
            })
          }
          instanceCost = 0
    }) 
    tableCostData.push({ // Total Cost data for range of days
      name: <b> All Instance Types </b>,
      alt: <b> ${totalRangeCost.toFixed(2)} </b>,
      description: <b> Total Cost for all instance types from {Start} to {End} </b>,
      type: "1A",
      size: "xxLarge"
    })
    setState(['app', 'cost', clusterName, 'graphData'], dayCosts);
    setState(['app', 'cost', clusterName, 'dates'], dates);
    setState(['app', 'cost', clusterName, 'max'], max);
    setState(['app', 'cost', clusterName, 'tableData'], tableCostData);
    getBudget()
    tableCostData = [];
    }
    GetGraphData(queryCosts, clusterName, Start, End)
  }

  const fetchGraphData = (val: any) => {
    let startValue = ""
    let endValue = ""
    if (!val) {
      let currentDate = new Date();
      let start = new Date(currentDate.setDate(currentDate.getDate()-7));
      let startString = new Date(start).toISOString().split('T');
      let endString = new Date().toISOString().split('T');
      startValue = String(startString[0]);
      endValue = String(endString[0]);
    } 
    else {
      if (val.type === 'relative') {
        if (val.unit === 'day') {
          let currentDate = new Date()
          let start = new Date(currentDate.setDate(currentDate.getDate()-val.amount));
          let startString = new Date(start).toISOString().split('T');
          let endString = new Date().toISOString().split('T');
          startValue = String(startString[0]);
          endValue = String(endString[0]);
        }
      } 
      else {
        const start = new Date(val.startDate).toISOString().split('T');
        const end = new Date(val.endDate).toISOString().split('T');
        startValue = String(start[0]);
        endValue = String(end[0])
      }
    }
    setState(['app', 'cost', clusterName, 'End'],String(endValue));
    setState(['app', 'cost', clusterName, 'Start'], String(startValue));
    getGraphData(String(startValue), String(endValue));
  }

  React.useEffect(() => { // These will be called once on loading of page
      checkTags()
      const Default = {
          key: 'previous-7-days',
          type: 'relative',
          unit: 'day',
          amount: 7,
        };
      fetchGraphData(Default);
      setDateValue(Default);
      createUrl();
  },[])

  return (
    <Container
    header={
      <Header
        variant="h2"
        actions={
          <SpaceBetween direction="horizontal" size="l">
            <Button disabled={tagActive} onClick={activateTags} variant="primary">
              Activate Tags
            </Button>
            <DateRangePicker
              onChange={({ detail }) => {
                fetchGraphData(detail.value);
                setDateValue(detail.value);
              }}
              value={dateValue}
              relativeOptions={Options}
              i18nStrings={{
                todayAriaLabel: "Today",
                nextMonthAriaLabel: "Next month",
                previousMonthAriaLabel: "Previous month",
                customRelativeRangeDurationLabel: "Duration",
                customRelativeRangeDurationPlaceholder: "Enter duration",
                customRelativeRangeOptionLabel: "Custom range",
                customRelativeRangeOptionDescription:
                  "Set a custom range of days in the past. Use Days as Unit of Time.",
                customRelativeRangeUnitLabel: "Unit of time",
                formatRelativeRange: (e) => {
                  const t = 1 === e.amount ? e.unit : `${e.unit}s`;
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
                applyButtonLabel: "Apply",
              }}
              placeholder="Filter by a date range"
            />
            <ProgressBar
              value={budgetUsed}
              additionalInfo="Create a Budget with an identical name as your respective cluster for accurate information"
              description="Progress"
              label="Cost Usage of Budget"
            />
            <HelpTooltip>
              If you haven't created a budget, create a custom cost budget on{" "}
              <a
                href="https://us-east-1.console.aws.amazon.com/billing/home?#/budgets/overview"
                target="_blank"
              >
                {" "}
                AWS Budgets
              </a>
              .
            </HelpTooltip>
            <Button
              href={`https://${region}.console.aws.amazon.com/cost-management/home?region=${region}"#/custom?groupBy=InstanceType&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&excludeCategorizedResources=false&excludeForecast=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&filter=${JSON.stringify(
                urlData
              )}&chartStyle=Stack&forecastTimeRangeOption=None&usageAs=usageQuantity&startDate=${startUrl}&endDate=${endUrl}`}
              target="-blank"
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
        series={graphData}
        xDomain={xAxis}
        yDomain={[0, yAxis * 1.9]}
        i18nStrings={{
          filterLabel: "Filter displayed data",
          filterPlaceholder: "Filter data",
          filterSelectedAriaLabel: "selected",
          legendAriaLabel: "Legend",
          chartAriaRoleDescription: "line chart",
          xTickFormatter: (e) =>
            e
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
              .split(",")
              .join("\n"),
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
            cell: (item) => item.name || "-",
            sortingField: "name",
          },
          {
            id: "alt",
            header: "Total Cost",
            cell: (item) => item.alt || "-",
            sortingField: "alt",
          },
          {
            id: "description",
            header: "Summary",
            cell: (item) => item.description || "-",
          },
        ]}
        items={tableData}
        loadingText="Loading resources"
        sortingDisabled
        empty={
          <Box textAlign="center" color="inherit">
            <b>No resources</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
              No resources to display.
            </Box>
            <Button>Create resource</Button>
          </Box>
        }
        header={<Header> Cluster Costs </Header>}
      />
      <div>
        {" "}
        *The <b>NoInstanceType</b> category includes miscellaneous costs such as
        EBS, read more about{" "}
        <a href="https://aws.amazon.com/ebs/pricing/" target="-blank">
          {" "}
          EBS Pricing
        </a>
        .
      </div>
    </SpaceBetween>
  </Container>
  );
}