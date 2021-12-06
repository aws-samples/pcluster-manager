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

import { getState, useState } from '../../store'
import { GetConfiguration, DescribeCluster } from '../../model'

// UI Elements
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  Popover,
  SpaceBetween,
  StatusIndicator
} from '@awsui/components-react';

// Components
import DateView from '../../components/DateView'
import Status from '../../components/Status'

// Key:Value pair (label / children)
const ValueWithLabel = ({ label, children }) => (
  <div>
    <Box margin={{ bottom: 'xxxs' }} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
);

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  const clickHandler = () => {
    setTimeout(() => {
      URL.revokeObjectURL(url);
      a.removeEventListener('click', clickHandler);
    }, 150);
  };
  a.addEventListener('click', clickHandler, false);
  a.click();
  return a;
}

export default function ClusterProperties () {

  const clusterName = useState(['app', 'clusters', 'selected']);
  const cluster = useState(['clusters', 'index', clusterName]);

  React.useEffect(() => {
    const tick = () => {
      const clusterName = getState(['app', "clusters", "selected"]);
      clusterName && DescribeCluster(clusterName);
    }
    const timerId = setInterval(tick, 5000);
    return () => { clearInterval(timerId); }
  }, [])

  return <>
    <Container header={<Header variant="h3">Properties</Header>}>
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel label="cloudformationStackArn">
            <div className="custom-wrapping">
              <Box margin={{ right: 'xxs' }} display="inline-block">
                <Popover
                  size="small"
                  position="top"
                  dismissButton={false}
                  triggerType="custom"
                  content={<StatusIndicator type="success">ARN copied</StatusIndicator>}
                >
                  <Button variant="inline-icon" iconName="copy" ariaLabel="Copy ARN"
                    onClick={() => {navigator.clipboard.writeText(cluster.cloudformationStackArn)}}
                  />
                </Popover>
              </Box>
              {cluster.cloudformationStackArn}
            </div>
          </ValueWithLabel>
          <ValueWithLabel label="clusterConfiguration">
            <Button
              iconName="download"
              disabled={cluster && cluster.clusterStatus === 'CREATE_FAILED'}
              onClick={() => {
                GetConfiguration(clusterName, (configuration) => {
                  const blob = new Blob([configuration], {type: 'text/yaml'});
                  downloadBlob(blob, 'config.yaml')});
              }}
            >Download</Button>
          </ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel label="clusterStatus">
            <Status status={cluster.clusterStatus} />
          </ValueWithLabel>
          <ValueWithLabel label="computeFleetStatus">
            <Status status={cluster.computeFleetStatus} />
          </ValueWithLabel>
          <ValueWithLabel label="creationTime">
            <DateView date={cluster.creationTime} />
          </ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel label="lastUpdatedTime">
            <DateView date={cluster.lastUpdatedTime} />
          </ValueWithLabel>
          <ValueWithLabel label="region">{cluster.region}</ValueWithLabel>
          <ValueWithLabel label="version">{cluster.version}</ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  </>
}
