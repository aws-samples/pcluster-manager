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
import { getState, setState } from '../../store'
import { UiSchema, withTheme } from "@rjsf/core";
import SubmitModal from './SubmitModal';
import { polarisTheme } from './polarisTheme';
import { JSONSchema7 } from "json-schema";
import {
  AppLayout,
    Container,
    Header,
    SpaceBetween,
    Button,
  } from "@awsui/components-react";
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';


interface PolarisFormProps {
  schema: JSONSchema7,
  uiSchema: UiSchema,
}

const PolarisForm = withTheme<PolarisFormProps>(polarisTheme);

export default function Job() {
  const {t} = useTranslation()
  const [formData, setFormData] = React.useState({});
  const [showSubmitModal, setShowSubmitModal] = React.useState(false);
  const onDiscardSubmitModal = () => setShowSubmitModal(false);
  const onShowSubmitModal = () => setShowSubmitModal(true);
  const onSubmit = ({formData}: any) => {
    setFormData(formData)
    onShowSubmitModal()
  };

  const params = useParams();
  const jobDefinition = getState(['jobs-definitions', 'list']).find((jd: any) => (jd as any).id === params.jobId)
  const jobExecution = jobDefinition.jobExecution

  return <AppLayout
      className="inner-app-layout"
      headerSelector="#top-bar"
      disableContentHeaderOverlap
      navigationHide
      toolsHide
      onNavigationChange = {(e) => {setState(['app', 'sidebar', 'drawerOpen'], e.detail.open)}}
      content={
        <>
          <Container
            header={
              <Header variant="h2" description="">
                {t('jobDefinitions.job.header', {id: jobDefinition.id})}
              </Header>
            }>
            <PolarisForm onSubmit={onSubmit} schema={jobDefinition.schema} uiSchema={jobDefinition.uiSchema} className="polaris-form">
              <SpaceBetween direction="horizontal" size="m">
                <Button formAction="submit" variant="primary">{t('jobDefinitions.job.submit')}</Button>
              </SpaceBetween>
            </PolarisForm>
          </Container>
          <SubmitModal
            visible={showSubmitModal}
            onDiscard={onDiscardSubmitModal}
            jobData={{...formData, jobExecution}}
          />
        </>
      }
    />
}
