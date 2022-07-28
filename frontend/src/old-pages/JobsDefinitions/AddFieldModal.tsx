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
import { Modal, Box, SpaceBetween, Button, Input, FormField, Select } from "@awsui/components-react";
import { OptionDefinition } from "@awsui/components-react/internal/components/option/interfaces";
import React from "react";

interface Props {
  jobDefinitionId: string;
  visible: boolean;
  onDiscard: () => void;
  onConfirm: (jobDefinitionId: string, propId: string, value: unknown) => void;
}

export default function AddFieldModal({ visible, onDiscard, onConfirm, jobDefinitionId }: Props) {
  const [type, setType] = React.useState<OptionDefinition>({ label: "string", value: "string" });
  const [id, setId] = React.useState<string>("");
  const [label, setLabel] = React.useState<string>("");
  const [defaultValue, setDefaultValue] = React.useState<string>("");
  const onAdd = () => {
    onConfirm(jobDefinitionId, id, {"type": type.value, "title": label, "default": defaultValue})
    onDiscard()
  }

  return (
    <Modal
      header="Add a field to Job Definition"
      onDismiss={onDiscard}
      visible={visible}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link" onClick={onDiscard}>Cancel</Button>
            <Button variant="primary" onClick={onAdd}>Add</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <FormField
        label="Type"
        description="The type of the field"
      >
        <Select
          selectedOption={type}
          onChange={({ detail }) =>
            setType(detail.selectedOption)
          }
          options={[
            { label: "string", value: "string" },
            { label: "number", value: "number" },
            { label: "boolean", value: "boolean" }
          ]}
          selectedAriaLabel="Selected"
        />
      </FormField>
      <FormField
        label="Id"
        description="The key of the field"
      >
        <Input
          value={id}
          onChange={event =>
            setId(event.detail.value)
          }
        />
      </FormField>
      <FormField
        label="Label"
        description="The label of the field"
      >
        <Input
          value={label}
          onChange={event =>
            setLabel(event.detail.value)
          }
        />
      </FormField>
      <FormField
        label="Default"
        description="(Optional) Default value of the field"
      >
        <Input
          value={defaultValue}
          onChange={event =>
            setDefaultValue(event.detail.value)
          }
        />
      </FormField>
    </Modal>
  );
}