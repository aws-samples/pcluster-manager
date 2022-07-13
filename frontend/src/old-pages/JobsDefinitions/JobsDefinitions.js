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

import { setState } from '../../store'
import { withTheme } from "@rjsf/core";
import { polarisTheme } from './theme';


// UI Elements
import {
  AppLayout,
  Container,
  Header,
} from "@awsui/components-react";

const schema = {
  type: "object",
  properties: {
    name: {type: "string", title: "Name", default: "John Doe"},
    age: {
      title: "Age",
      type: "number",
      default: 20,
      minimum: 18,
      maximum: 90
    },
    student: {type: "boolean", title: "Student", default: false}
  }
};

const uiSchema = {
  "ui:submitButtonOptions": {
    "props": {
      "hidden": true,
    }
  }
}

const formData = {
  name: "John Doe",
  age: 33,
  student: false
};

const PolarisForm = withTheme(polarisTheme);

export default function JobsDefinitions() {

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
                Jobs Definitions
              </Header>
            }>
            <PolarisForm schema={schema} uiSchema={uiSchema} formData={formData} className="polaris-form"/>
          </Container>
        </>
      }
    />
}
