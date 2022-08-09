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
import { useTranslation } from 'react-i18next';

export default function Cost() {
  const { t } = useTranslation();
  const [dateValue, setDateValue] = React.useState(undefined);
  const defaultRegion = useState(['aws', 'region']) || 'us-east-1';
  const region = useState(['app', 'selectedRegion']) || defaultRegion;
  const clusterName = useState(['app', 'clusters', 'selected']);
  const tagActive = useState(['app', 'tags', 'active']);
  const yAxis = useState(['app', 'cost', clusterName, 'max']);
  const xAxis = useState(['app', 'cost', clusterName, 'date']);
  const graphData = useState(['app', 'cost', clusterName, 'graphData']) || [];
  const budgetUsed = useState(['app', 'cost', clusterName, 'budget']) || [];
  const tableData = useState(['app', 'cost', clusterName, 'tableData']) || [];
  const accountId =  useState(['app', 'account']) || [];
  const dateRangePickerSettings = {
    todayAriaLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.todayAriaLabel"),
    nextMonthAriaLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.nextMonthAriaLabel"),
    previousMonthAriaLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.previousMonthAriaLabel"),
    customRelativeRangeDurationLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.customRelativeRangeDurationLabel"),
    customRelativeRangeDurationPlaceholder: t("CostTab.dateRangePicker.dateRangePickerSetting.customRelativeRangeDurationPlaceholder"),
    customRelativeRangeOptionLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.customRelativeRangeOptionLabel"),
    customRelativeRangeOptionDescription: t("CostTab.dateRangePicker.dateRangePickerSetting.customRelativeRangeOptionDescription"),
    customRelativeRangeUnitLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.customRelativeRangeUnitLabel"),
    formatRelativeRange: (e: { amount: number; unit: any; }) => {
      const t =
        1 === e.amount ? e.unit : `${e.unit}s`;
      return  `Last ${e.amount} ${t}`;
    },
    formatUnit: (e: any, t: number) => (1 === t ? e : `${e}s`),
    dateTimeConstraintText: t("CostTab.dateRangePicker.dateRangePickerSetting.dateTimeConstraintText"),
    relativeModeTitle: t("CostTab.dateRangePicker.dateRangePickerSetting.relativeModeTitle"),
    absoluteModeTitle: t("CostTab.dateRangePicker.dateRangePickerSetting.absoluteModeTitle"),
    relativeRangeSelectionHeading: t("CostTab.dateRangePicker.dateRangePickerSetting.relativeRangeSelectionHeading"),
    startDateLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.startDateLabel"),
    endDateLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.endDateLabel"),
    startTimeLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.startTimeLabel"),
    endTimeLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.endTimeLabel"),
    clearButtonLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.clearButtonLabel"),
    cancelButtonLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.cancelButtonLabel"),
    applyButtonLabel: t("CostTab.dateRangePicker.dateRangePickerSetting.applyButtonLabel"),
  }
  const barChartSettings = {
    filterLabel: t("CostTab.BarChartSetting.filterLabel"),
    filterPlaceholder: t("CostTab.BarChartSetting.filterPlaceHolder"),
    filterSelectedAriaLabel: t("CostTab.BarChartSetting.filterSelectedAriaLabel"),
    legendAriaLabel: t("CostTab.BarChartSetting.legendAriaLabel"),
    chartAriaRoleDescription: t("CostTab.BarChartSetting.chartAriaRoleDescription"),
    xTickFormatter: (e: any) =>
      e
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
        .split(",")
        .join("\n"),
  }
  const barChartColumns = [
    {
      id: "variable",
      header: t("CostTab.BarChartColumns.InstanceType"),
      cell: (item: any) => item.name || "-",
      sortingField: "name",
    },
    {
      id: "alt",
      header: t("CostTab.BarChartColumns.TotalCost"),
      cell: (item: any) => item.alt || "-",
      sortingField: "alt",
    },
    {
      id: "description",
      header: t("CostTab.BarChartColumns.Summary"),
      cell: (item: any) => item.description || "-",
    },
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

  const getGraphData = (Start: string, End: string) => { // Pull cost and usage from CE API
    const queryCosts = (data: any) => {
      const usageData = data['ResultsByTime'];
      let instanceTypes = new Set();
      let dates: Date[] = [];
      let dayCosts: object[] = [];
      let tableCostData: object[] = [];
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
              description: <div> {t("CostTab.CostTable.description.TotalCostFor")} {type} {t("CostTab.CostTable.description.Transition")} {Start} {t("CostTab.CostTable.description.To")} {End}</div>,
              type: "1A",
              size: "xxLarge"
            })
          }
          instanceCost = 0
    }) 
    tableCostData.push({ // Total Cost data for range of days
      name: <b> {t("CostTab.CostTable.Name")} </b>,
      alt: <b> ${totalRangeCost.toFixed(2)} </b>,
      description: <b> {t("CostTab.CostTable.description.Sentence")} {Start} {t("CostTab.CostTable.description.To")} {End} </b>,
      type: "1A",
      size: "xxLarge"
    })
    setState(['app', 'cost', clusterName, 'graphData'], dayCosts);
    setState(['app', 'cost', clusterName, 'date'], dates);
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

  const getCostExplorerUrl = () => {
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
    const startDate = useState(['app', 'cost', clusterName, 'Start']);
    const endDate = useState(['app', 'cost', clusterName, 'End']);
    return `https://${region}.console.aws.amazon.com/cost-management/home?region=${region}"#/custom?groupBy=InstanceType&hasBlended=false&hasAmortized=false&excludeDiscounts=true&excludeTaggedResources=false&excludeCategorizedResources=false&excludeForecast=false&timeRangeOption=Custom&granularity=Daily&reportName=&reportType=CostUsage&isTemplate=true&filter=${JSON.stringify(data)}&chartStyle=Stack&forecastTimeRangeOption=None&usageAs=usageQuantity&startDate=${startDate}&endDate=${endDate}`;
  }

  React.useEffect(() => { // These will be called once on loading of page
      checkTags()
      const Default = {
          key: "previous-7-days",
          type: 'relative',
          unit: 'day',
          amount: 7,
        };
      fetchGraphData(Default);
      /* @ts-expect-error TS(2345) FIXME: Argument of type 'Value | null' is not assignable ... Remove this comment to see the full error message */
      setDateValue(Default);
  },[])

  return (
    <Container
    header={
      <Header
        variant="h2"
        actions={
          <SpaceBetween direction="horizontal" size="l">
            <Button disabled={tagActive} onClick={activateTags} variant="primary">
            {t("CostTab.TagsButton.Text")}
            </Button>
            <DateRangePicker
              /* @ts-expect-error TS(2345) FIXME: Argument of type 'Value | null' is not assignable ... Remove this comment to see the full error message */
              onChange={({ detail }) => { fetchGraphData(detail.value); setDateValue(detail.value); } }
              /* @ts-expect-error TS(2345) FIXME: Argument of type 'Value | null' is not assignable ... Remove this comment to see the full error message */
              value={dateValue}
              relativeOptions={[
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
              ]}
              i18nStrings={dateRangePickerSettings}
              placeholder={t("CostTab.dateRangePicker.placeholder")}
              isValidRange={function (value: any): any { return; } }
              />
            <ProgressBar
              value={budgetUsed}
              additionalInfo={t("CostTab.ProgressBar.additionalInfo")}
              description={t("CostTab.ProgressBar.description")}
              label={t("CostTab.ProgressBar.label")}
            />
            <HelpTooltip>
              {t("CostTab.HelpToolTip.Text")}{" "}
              <a
                href="https://us-east-1.console.aws.amazon.com/billing/home?#/budgets/overview"
                target="_blank"
              >
              {t("CostTab.HelpToolTip.Title")}
              </a>
              .
            </HelpTooltip>
            <Button
              href={getCostExplorerUrl()}
              target="-blank"
              iconAlign="right"
              iconName="external"
            >
              {t("CostTab.CostExplorerButton.Text")}
            </Button>
          </SpaceBetween>
        }
      >
        {t("CostTab.Header.Title")}
      </Header>
    }
  >
    <SpaceBetween size="xxl">
      <BarChart
        series={graphData}
        xDomain={xAxis}
        yDomain={[0, yAxis * 1.9]}
        i18nStrings={barChartSettings}
        ariaLabel={t("CostTab.BarChart.values.arialLabel")}
        errorText={t("CostTab.BarChart.values.errorText")}
        height={300}
        hideFilter
        loadingText={t("CostTab.BarChart.values.loadingText")}
        recoveryText={t("CostTab.BarChart.values.recoveryText")}
        stackedBars
        xScaleType={t("CostTab.BarChart.values.xScaleType")}
        xTitle={t("CostTab.BarChart.values.xTitle")}
        yTitle={t("CostTab.BarChart.values.yTitle")}
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t("CostTab.BarChart.empty.NoData")}</b>
            <Box variant="p" color="inherit">
            {t("CostTab.BarChart.noMatch.ThereIsNoData")}
            </Box>
          </Box>
        }
        noMatch={
          <Box textAlign="center" color="inherit">
            <b>{t("CostTab.BarChart.noMatch.NoMatchingData")}</b>
            <Box variant="p" color="inherit">
            {t("CostTab.BarChart.noMatch.ThereIsNoMatchingData")}
            </Box>
            <Button>{t("CostTab.BarChart.noMatch.ClearFilter")}</Button>
          </Box>
        }
      ></BarChart>
      <Table
        columnDefinitions={barChartColumns}
        items={tableData}
        loadingText={t("CostTab.Table.NoResources")}
        sortingDisabled
        empty={
          <Box textAlign="center" color="inherit">
            <b>{t("CostTab.Table.LoadingText.NoResources")}</b>
            <Box padding={{ bottom: "s" }} variant="p" color="inherit">
            {t("CostTab.Table.LoadingText.NoResourcesToDisplay")}
            </Box>
            <Button>{t("CostTab.Table.LoadingText.CreateResources")}</Button>
          </Box>
        }
        header={<Header> {t("CostTab.Header.Title")} </Header>}
      />
      <div>
        {" "}
        {t("CostTab.NoInstanceType.Text")}
        <a href="https://aws.amazon.com/ebs/pricing/" target="-blank">
          {" "}
          {t("CostTab.NoInstanceType.Title")}
        </a>
        .
      </div>
    </SpaceBetween>
</Container>
  );
}