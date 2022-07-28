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

import { JSONSchema7 } from "json-schema";
import { UiSchema } from "@rjsf/core";


export interface JobExecution {
  jobScript: string,
  postInstallScript: string
}

export interface JobDefinition {
  id: string,
  label: string,
  schema: JSONSchema7,
  uiSchema: UiSchema,
  jobExecution: JobExecution
}

export const jobsDefinitionsMock = [
  { 
    id: "job-definition-1",
    label: "Student Job",
    schema: {
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
    },
    uiSchema: {
      "ui:submitButtonOptions": {
        "props": {
          "hidden": true,
        },
        "norender": false,
        "submitText": "Submit"
      }
    },
    jobExecution: {
      jobScript: "This is a test job script :)",
      postInstallScript: "This is a test post-install script!"
    }
  },
  {
    id: "job-definition-2",
    label: "Health Job",
    schema: {
      type: "object",
      properties: {
        name: {type: "string", title: "Name", default: "John"},
        lastName: {type: "string", title: "Last Name", default: "Doe"},
        registered: {type: "boolean", title: "Registered", default: true},
        height: {
          title: "Height",
          type: "number",
          default: 180,
          minimum: 0
        },
        weight: {
          title: "Weight",
          type: "number",
          default: 70,
          minimum: 0
        }
      }
    },
    uiSchema: {
      "ui:submitButtonOptions": {
        "props": {
          "hidden": true,
        },
        "norender": false,
        "submitText": "Submit"
      }
    },
    jobExecution: {
      jobScript: "This is a test job script :)",
      postInstallScript: "This is a test post-install script!"
    }
  }
]