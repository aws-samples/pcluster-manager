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

import { findFirst, clusterDefaultUser } from '../../util'
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
import HelpTooltip from '../../components/HelpTooltip'

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
  const clusterPath = ['clusters', 'index', clusterName];
  const headNode = useState([...clusterPath, 'headNode']);

  const ssmPolicy = 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore';
  function isSsmPolicy(p) {
    return p.hasOwnProperty('Policy') && p.Policy === ssmPolicy;
  }
  const iamPolicies = useState([...clusterPath, 'config', 'HeadNode', 'Iam', 'AdditionalIamPolicies']);
  const ssmEnabled = iamPolicies && findFirst(iamPolicies, isSsmPolicy);

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
                  >copy</Button>
                </Popover>
              </Box>
              <a href={`https://${cluster.region}.console.aws.amazon.com/cloudformation/home?region=${cluster.region}#/stacks/events?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false&stackId=${cluster.cloudformationStackArn}`}
                target="_blank" rel="noreferrer">{cluster.cloudformationStackArn}</a>
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
          {headNode && headNode.publicIpAddress && headNode.publicIpAddress !== "" && ssmEnabled &&
          <ValueWithLabel label="EC2 Instance Connect">
            <Box margin={{ right: 'xxs' }} display="inline-block">
              <Popover
                size="small"
                position="top"
                dismissButton={false}
                triggerType="custom"
                content={<StatusIndicator type="success">mSSH command copied</StatusIndicator>}
              >
                {`mssh -r ${cluster.region} ${clusterDefaultUser(cluster)}@${headNode.instanceId}`}
                <Button variant="inline-icon" iconName="copy" ariaLabel="Copy mSSH command"
                  onClick={() => {navigator.clipboard.writeText(`mssh -r ${cluster.region} ${clusterDefaultUser(cluster)}@${headNode.instanceId}`)}}
                >copy</Button>
              </Popover>
              <HelpTooltip>
                This copies the command to connect to the HeadNode using <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-set-up.html'>EC2 Instance Connect</a>. You will need to <a rel="noreferrer" target="_blank" href='https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-connect-set-up.html'>install mSSH helper</a> locally before running this command.
              </HelpTooltip>
            </Box>
          </ValueWithLabel>
          }
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  </>
}
