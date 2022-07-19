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