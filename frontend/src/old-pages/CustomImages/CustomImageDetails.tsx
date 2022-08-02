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
import React, { useCallback } from 'react';

import { setState, getState, useState } from '../../store'
import { GetCustomImageConfiguration } from '../../model'

// UI Elements
import { Trans } from 'react-i18next';
import Tabs from "@awsui/components-react/tabs"
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
const ValueWithLabel = ({
  label,
  children
}: any) => (
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
    GetCustomImageConfiguration(imageId, (configuration: any) => {setState([...customImagesPath, 'config'], configuration)});
  }, [])

  return configuration ?
    <textarea disabled={true} readOnly style={{width: "850px", height: "300px", display: "block"}} value={configuration} />
    : <Loading />
}

function CustomImageProperties() {
  const selected = useState([...customImagesPath, 'selected'])
  const image = useState(['customImages', 'index', selected])

  const copyImageConfigUrl = useCallback(
    () => {
      navigator.clipboard.writeText(image.imageConfiguration.url);
    }, [image.imageConfiguration.url]
  )

  const copyAmiId = useCallback(
    () => {
      navigator.clipboard.writeText(image.ec2AmiInfo.amiId);
    }, [image.ec2AmiInfo.amiId]
  )

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
            <Popover
              size="large"
              position="top"
              triggerType="custom"
              dismissButton={false}
              content={<StatusIndicator type="success"><Trans i18nKey="customImages.copyImageConfiguration" /></StatusIndicator>}>
              <Button iconName="copy" onClick={copyImageConfigUrl} >copy</Button>
            </Popover>
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
                content={<StatusIndicator type="success"><Trans i18nKey="customImages.copyAmiId" /></StatusIndicator>}>
                <Button iconName="copy" onClick={copyAmiId}>copy</Button>
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
              {image.ec2AmiInfo && image.ec2AmiInfo.tags.map((tag: any, i: any) => <tr key={i.toString() + tag.key}><td>{tag.key}</td><td>{tag.value}</td></tr>)}
            </tbody>
          </table>
          : <Loading />
      },
      {
        label: "Configuration",
        id: "configuration",
        // @ts-expect-error TS(2322) FIXME: Type '{ imageId: any; }' is not assignable to type... Remove this comment to see the full error message
        content: <CustomImageConfiguration imageId={selected} />
      },
      ...(image && (image.imageBuildStatus !== 'BUILD_COMPLETE') ? [{
        label: "Stack Events",
        id: "stack-events",
        // @ts-expect-error TS(2322) FIXME: Type '{ imageId: any; }' is not assignable to type... Remove this comment to see the full error message
        content: <CustomImageStackEvents imageId={selected} />
      }] : []),
      // {
      //   label: "Logs",
      //   id: "logs",
      //   content: <CustomImageLogs imageId={selected} />
      // }
    ]} />
  );
}
