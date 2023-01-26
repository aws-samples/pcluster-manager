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
import {ImageBuildStatus} from '../../types/images'
import React, {useCallback} from 'react'

import {setState, getState, useState} from '../../store'
import {GetCustomImageConfiguration} from '../../model'

// UI Elements
import {useTranslation} from 'react-i18next'
import Tabs from '@cloudscape-design/components/tabs'
import {
  Box,
  Button,
  ColumnLayout,
  Container,
  Header,
  Popover,
  SpaceBetween,
  StatusIndicator,
} from '@cloudscape-design/components'

// Components
import Loading from '../../components/Loading'
import DateView from '../../components/DateView'

import CustomImageStackEvents from './CustomImageStackEvents'
import {ValueWithLabel} from '../../components/ValueWithLabel'

// Constants
const customImagesPath = ['app', 'customImages']

function CustomImageConfiguration() {
  const configuration = useState([...customImagesPath, 'config'])
  React.useEffect(() => {
    const imageId = getState([...customImagesPath, 'selected'])
    GetCustomImageConfiguration(imageId, (configuration: any) => {
      setState([...customImagesPath, 'config'], configuration)
    })
  }, [])

  return configuration ? (
    <textarea
      disabled={true}
      readOnly
      style={{width: '850px', height: '300px', display: 'block'}}
      value={configuration}
    />
  ) : (
    <Loading />
  )
}

function CustomImageProperties() {
  const {t} = useTranslation()
  const selected = useState([...customImagesPath, 'selected'])
  const image = useState(['customImages', 'index', selected])

  const loadingText = t('global.loading')

  const copyImageConfigUrl = useCallback(() => {
    navigator.clipboard.writeText(image.imageConfiguration.url)
  }, [image.imageConfiguration.url])

  const copyAmiId = useCallback(() => {
    navigator.clipboard.writeText(image.ec2AmiInfo.amiId)
  }, [image.ec2AmiInfo.amiId])

  return (
    <Container
      header={
        <Header variant="h3">
          {t('customImages.imageDetails.properties.header.title')}
        </Header>
      }
    >
      <ColumnLayout columns={3} variant="text-grid">
        <SpaceBetween size="l">
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.creationTime')}
          >
            <DateView date={image.creationTime} />
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.architecture')}
          >
            {image.ec2AmiInfo && image.ec2AmiInfo.architecture}
            {!image.ec2AmiInfo && loadingText}
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.state')}
          >
            {image.ec2AmiInfo && image.ec2AmiInfo.state}
            {!image.ec2AmiInfo && loadingText}
          </ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel
            label={t(
              'customImages.imageDetails.properties.configurationUrl.label',
            )}
          >
            <Popover
              size="large"
              position="top"
              triggerType="custom"
              dismissButton={false}
              content={
                <StatusIndicator type="success">
                  {t(
                    'customImages.imageDetails.properties.configurationUrl.tooltiptext',
                  )}
                </StatusIndicator>
              }
            >
              <Button iconName="copy" onClick={copyImageConfigUrl}>
                {t(
                  'customImages.imageDetails.properties.configurationUrl.copyText',
                )}
              </Button>
            </Popover>
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.buildStatus')}
          >
            {image.imageBuildStatus}
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.amiId.label')}
          >
            <SpaceBetween size="s" direction="horizontal">
              <div>{image.ec2AmiInfo && image.ec2AmiInfo.amiId}</div>
              {image.ec2AmiInfo && (
                <Popover
                  size="medium"
                  position="top"
                  triggerType="custom"
                  dismissButton={false}
                  content={
                    <StatusIndicator type="success">
                      {t(
                        'customImages.imageDetails.properties.amiId.tooltiptext',
                      )}
                    </StatusIndicator>
                  }
                >
                  <Button iconName="copy" onClick={copyAmiId}>
                    {t('customImages.imageDetails.properties.amiId.copyText')}
                  </Button>
                </Popover>
              )}
              {!image.ec2AmiInfo && loadingText}
            </SpaceBetween>
          </ValueWithLabel>
        </SpaceBetween>
        <SpaceBetween size="l">
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.imageId')}
          >
            {image.imageId}
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.region')}
          >
            {image.region}
          </ValueWithLabel>
          <ValueWithLabel
            label={t('customImages.imageDetails.properties.version')}
          >
            {image.version}
          </ValueWithLabel>
        </SpaceBetween>
      </ColumnLayout>
    </Container>
  )
}

export default function CustomImageDetails() {
  const {t} = useTranslation()
  const selected = useState([...customImagesPath, 'selected'])
  const image = useState(['customImages', 'index', selected])
  return (
    <Tabs
      tabs={[
        {
          label: t('customImages.imageDetails.tabs.properties'),
          id: 'properties',
          content: image ? <CustomImageProperties /> : <Loading />,
        },
        {
          label: t('customImages.imageDetails.tabs.tags'),
          id: 'tags',
          content: image ? (
            <table>
              <thead>
                <tr>
                  <th>{t('customImages.imageDetails.tags.key')}</th>
                  <th>{t('customImages.imageDetails.tags.value')}</th>
                </tr>
              </thead>
              <tbody>
                {image.ec2AmiInfo &&
                  image.ec2AmiInfo.tags.map((tag: any, i: any) => (
                    <tr key={i.toString() + tag.key}>
                      <td>{tag.key}</td>
                      <td>{tag.value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <Loading />
          ),
        },
        {
          label: t('customImages.imageDetails.tabs.configuration'),
          id: 'configuration',
          content: <CustomImageConfiguration />,
        },
        ...(image && image.imageBuildStatus !== ImageBuildStatus.BuildComplete
          ? [
              {
                label: t('customImages.imageDetails.tabs.stackEvents'),
                id: 'stack-events',
                content: <CustomImageStackEvents />,
              },
            ]
          : []),
      ]}
    />
  )
}
