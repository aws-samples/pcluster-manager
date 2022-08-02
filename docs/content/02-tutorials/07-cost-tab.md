
+++
title = "f. Cost Tab 📈"
weight = 27
+++

This tutorial shows you how to view cluster costs broken down by instance type and create a budget for a specific cluster to get alerted when you approach your budget's cap.

## Setup
Cost Allocation Tags allow us to track spending of parallelclusters from parallelcluster specific tags, so first we must activate those tags.

1. Click the "Activate Tags" button to activate Cost Allocation Tags
![Cost Tags](cost-tab/Activate-Tags-Button.png)

2. If cost allocation tags were already activated, then the Activate Tags Button should look grayed out
![Cost Tags](cost-tab/Activated_Button.png)

## Filter Data by dates

Now you can check spending costs by cluster based and filter by time range.

1. Click on the date filter to change the selected date range
![Cost Tags](cost-tab/Date-Filter.png)

2. When using the "custom range" setting always make sure to select "days" as "unit of time"
![Cost Tags](cost-tab/Custom-Range.png)

3. Cost data will also be displayed in a table along with the graph
![Cost Tags](cost-tab/Cost-Data.png)

## Create a Budget

Budgets allow us to track specific project cost over time and get alerted if we're about to hit a cap.

1. Navigate to the [AWS Budgets Portal](https://console.aws.amazon.com/billing/home?#/budgets/create) > **Create Budget**
2. Create a **Cost Budget**
3. Make sure your budget name matches the name of the cluster you want to create a budget for
![Create Budget](cost-tab/Budget-Name.png)
4. Enter in the amount of money and frequency you desire.
5. Select "Filter by specific AWS cost dimensions" and set the following:

| Budget Item    | Description                                                               |
|----------------|---------------------------------------------------------------------------|
| Dimension | Tag                                             |
| Tag            | `parallelcluster:cluster-name`                                             |
| Cluster Name   |  Name of Your Cluster|

![Create Budget](cost-tab/Create-Budget.png)

6. Enter a threshold and email address to get notified when approaching the budget
7. Then you'll see the following bar in your **Cost Tab**

![Create Budget](cost-tab/Progress-Bar.png)



