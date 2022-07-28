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
import {
  AppLayout, Box, Button, Container,
  Header,
  SpaceBetween, Table, Textarea
} from "@awsui/components-react";
import React from 'react';
import { useParams } from 'react-router-dom';
import { getState, setState } from '../../store';
import AddFieldModal from './AddFieldModal';


function getJobDefinitionFields(jobDefinitionId: string) {
  // @ts-expect-error TS(7006) FIXME: Parameter 'j' implicitly has an 'any' type.
  const jobDefinitionProperties = getState(['jobs-definitions', 'list']).filter((j) => (j as any).id === jobDefinitionId)[0].schema.properties
  return Object.keys(jobDefinitionProperties).map((key) => ({ ...jobDefinitionProperties[key], "id": key }))
}

function addJobDefinitionField(jobDefinitionId: string, propId: string, value: any) {
  const oldJobsDefinitions = getState(['jobs-definitions', 'list'])
  // @ts-expect-error TS(7006) FIXME: Parameter 'j' implicitly has an 'any' type.
  const jobDef = oldJobsDefinitions.find((j) => (j as any).id === jobDefinitionId)
  jobDef.schema.properties[propId] = value;
  // @ts-expect-error TS(7006) FIXME: Parameter 'jd' implicitly has an 'any' type.
  setState(['jobs-definitions', 'list'], oldJobsDefinitions.map((jd) => jd.id === jobDef.id ? jobDef : jd))
}

function deleteJobDefinitionField(jobDefinitionId: string, propId: string) {
  const oldJobsDefinitions = getState(['jobs-definitions', 'list'])
  // @ts-expect-error TS(7006) FIXME: Parameter 'j' implicitly has an 'any' type.
  const jobDef = oldJobsDefinitions.find((j) => (j as any).id === jobDefinitionId)
  delete jobDef.schema.properties[propId];
  // @ts-expect-error TS(7006) FIXME: Parameter 'jd' implicitly has an 'any' type.
  setState(['jobs-definitions', 'list'], oldJobsDefinitions.map((jd) => jd.id === jobDef.id ? jobDef : jd))
}

interface JobDefinitionInputProps {
  jobDefinitionId: string;
  onAddField: () => void;
}

function JobDefinitionInput({ onAddField, jobDefinitionId }: JobDefinitionInputProps) {
  const [selectedItems, setSelectedItems] = React.useState([]);
  const fields = getJobDefinitionFields(jobDefinitionId);
  // @ts-expect-error TS(2339) FIXME: Property 'id' does not exist on type 'never'.
  const onDelete = () => deleteJobDefinitionField(jobDefinitionId, selectedItems[0].id)

  return (
    <Table
      header={
        <Header
          actions={
            <SpaceBetween direction='horizontal' size='xs'>
              <Button onClick={onDelete} variant="normal" disabled={selectedItems.length == 0}>Delete</Button>
              <Button onClick={onAddField} variant="primary" iconName={"add-plus"}>Add</Button>
            </SpaceBetween>}
        >
          Input parameters
        </Header>
      }
      onSelectionChange={({ detail }) =>
        // @ts-expect-error TS(2345) FIXME: Argument of type 'any[]' is not assignable to para... Remove this comment to see the full error message
        setSelectedItems(detail.selectedItems)
      }
      selectedItems={selectedItems}
      columnDefinitions={[
        {
          id: "id",
          header: "Id",
          cell: e => e.id,
          sortingField: "id"
        },
        {
          id: "label",
          header: "Label",
          cell: e => e.title,
          sortingField: "label"
        },
        {
          id: "type",
          header: "Type",
          cell: e => e.type,
          sortingField: "type"
        },
        {
          id: "default",
          header: "Default",
          cell: e => e.default.toString()
        }
      ]}
      items={fields}
      loadingText="Loading resources"
      selectionType="single"
      trackBy="id"
      empty={
        <Box textAlign="center" color="inherit">
          <b>No input parameters</b>
          <Box
            padding={{ bottom: "s" }}
            variant="p"
            color="inherit"
          >
            No input parameters to display.
          </Box>
        </Box>
      }
    />
  );
}

interface JobDefinitionExecutionProps {
  jobDefinitionId: string;
  onSave: () => void;
}

function JobDefinitionExecution({ jobDefinitionId, onSave }: JobDefinitionExecutionProps) {
  // @ts-expect-error TS(7006) FIXME: Parameter 'j' implicitly has an 'any' type.
  const executionProps = getState(['jobs-definitions', 'list']).filter((j) => (j as any).id === jobDefinitionId)[0].jobExecution
  const [jobScript, setJobScript] = React.useState(executionProps.jobScript);
  const [postInstallScript, setPostInstallScript] = React.useState(executionProps.postInstallScript);
  const onSaveClick = () => onSave();


  return (
    <Container header={
      <Header variant="h2">
        Execution parameters
      </Header>
    }>
      <SpaceBetween direction='vertical' size='s'>
        <b>Job Script</b>
        <Textarea
          onChange={({ detail }) => setJobScript(detail.value)}
          value={executionProps.jobScript}
          placeholder={"This is a sample job script"}
        />

        <b>Post-install Script</b>
        <Textarea
          onChange={({ detail }) => setPostInstallScript(detail.value)}
          value={executionProps.postInstallScript}
          placeholder={"This is a sample post-install script"}
        />
        <Button variant='primary'>Save</Button>
      </SpaceBetween>
    </Container>
  );
}


export default function JobDefinitionEditor() {
  const [addFieldModalVisible, setAddFieldModalVisible] = React.useState(false);
  const onAddField = () => setAddFieldModalVisible(true);
  const onDiscard = () => setAddFieldModalVisible(false);
  const params = useParams();

  return <AppLayout
    className="inner-app-layout"
    headerSelector="#top-bar"
    disableContentHeaderOverlap
    navigationHide
    toolsHide
    onNavigationChange={(e) => { setState(['app', 'sidebar', 'drawerOpen'], e.detail.open) }}
    content={
      <>
        <Container header={
          <Header variant="h2">
            Job Definition: {params.jobDefinitionId}
          </Header>
        }>
          <SpaceBetween direction='vertical' size='m'>
            {/* @ts-expect-error TS(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message */}
            <JobDefinitionInput onAddField={onAddField} jobDefinitionId={params.jobDefinitionId} />
            {/* @ts-expect-error TS(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message */}
            <JobDefinitionExecution jobDefinitionId={params.jobDefinitionId} onSave={() => { }} />
          </SpaceBetween>
        </Container>
        {/* @ts-expect-error TS(2322) FIXME: Type 'string | undefined' is not assignable to typ... Remove this comment to see the full error message */}
        <AddFieldModal visible={addFieldModalVisible} onDiscard={onDiscard} onConfirm={addJobDefinitionField} jobDefinitionId={params.jobDefinitionId} />
      </>
    }
  />
}
