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

import { setState, getState, useState } from '../../store'
import { GetCustomImageConfiguration } from '../../model'

// UI Elements
import Tabs from "@awsui/components-react/tabs"
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from '@awsui/components-react';

// Components
import Loading from '../../components/Loading'
import DateView from '../../components/DateView'

import CustomImageStackEvents from './CustomImageStackEvents';
// import CustomImageLogs from './CustomImageLogs';

// Constants
const customImagesPath = ['app', 'customImages'];

// Key:Value pair (label / children)
const ValueWithLabel = ({ label, children }) => (
  <div>
    <Box margin={{ bottom: 'xxxs' }} color="text-label">
      {label}
    </Box>
    <div>{children}</div>
  </div>
);

function CustomImageConfiguration() {
  const configuration = useState([...customImagesPath, 'config']);
  React.useEffect(() => {
    const imageId = getState([...customImagesPath, 'selected']);
    GetCustomImageConfiguration(imageId, (configuration) => {setState([...customImagesPath, 'config'], configuration)});
  }, [])

  return configuration ?
    <textarea disabled={true} readOnly style={{width: "850px", height: "300px", display: "block"}} value={configuration} />
    : <Loading />
}

function CustomImageProperties() {
  const selected = useState([...customImagesPath, 'selected'])
  const image = useState(['customImages', 'index', selected])
  return (
    <Container header={<Header variant="h3">Properties</Header>}>
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel label="creationTime">
            <DateView date={image.creationTime} />
          </ValueWithLabel>
          <ValueWithLabel label="architecture">
            {image.ec2AmiInfo && image.ec2AmiInfo.architecture}
            {!image.ec2AmiInfo && "Loading..."}
          </ValueWithLabel>
          <ValueWithLabel label="state">
            {image.ec2AmiInfo && image.ec2AmiInfo.state}
            {!image.ec2AmiInfo && "Loading..."}
          </ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel label="configuration url">
            <Tooltip title={image.imageConfiguration.url}>
              <span>URL (hover)</span>
            </Tooltip>
          </ValueWithLabel>
          <ValueWithLabel label="buildStatus">{image.imageBuildStatus}</ValueWithLabel>
          <ValueWithLabel label="amiId">
            <SpaceBetween size="s" direction="horizontal">
              <div>
                {image.ec2AmiInfo && image.ec2AmiInfo.amiId}
              </div>
              {image.ec2AmiInfo && 
              <Popover
                size="medium"
                position="top"
                triggerType="custom"
                dismissButton={false}
                content={<StatusIndicator type="success">AMI Id copied to clipboard.</StatusIndicator>}
              >
                <Button
                  iconName="copy"
                  onClick={() => {
                    navigator.clipboard.writeText(image.ec2AmiInfo.amiId);
                  }}
                >copy</Button>
              </Popover>
              }
              {!image.ec2AmiInfo && "Loading..."}
            </SpaceBetween>
          </ValueWithLabel>
          </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel label="imageId">{image.imageId}</ValueWithLabel>
          <ValueWithLabel label="region">{image.region}</ValueWithLabel>
          <ValueWithLabel label="version">{image.version}</ValueWithLabel>
        </SpaceBetween>
        </ColumnLayout>
      </Container>
  );
}

export default function CustomImageDetails() {
  const selected = useState([...customImagesPath, 'selected'])
  const image = useState(['customImages', 'index', selected])
  return (
    <Tabs tabs={[
      {
        label: "Properties",
          id: "properties",
          content: image ? <CustomImageProperties /> : <Loading />
      },
      {
        label: "Tags",
        id: "tags",
        content: image ?
          <table>
            <thead><tr><th>Key</th><th>Value</th></tr></thead>
            <tbody>
              {image.ec2AmiInfo && image.ec2AmiInfo.tags.map((tag, i) => <tr key={i.toString() + tag.key}><td>{tag.key}</td><td>{tag.value}</td></tr>)}
            </tbody>
          </table>
          : <Loading />
      },
      {
        label: "Configuration",
        id: "configuration",
        content: <CustomImageConfiguration imageId={selected} />
      },
      {
        label: "Stack Events",
        id: "stack-events",
        content: <CustomImageStackEvents imageId={selected} />
      },
      // {
      //   label: "Logs",
      //   id: "logs",
      //   content: <CustomImageLogs imageId={selected} />
      // }
    ]} />
  );
}
