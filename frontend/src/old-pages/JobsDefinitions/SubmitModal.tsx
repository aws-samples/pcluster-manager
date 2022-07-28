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
import { Modal, Box, SpaceBetween, Button } from "@awsui/components-react";

interface Props {
  visible: boolean;
  onDiscard: () => void;
  jobData: unknown;
}

export default function SubmitModal({ visible, onDiscard, jobData }: Props) {
  return (
    <Modal
      header="Job Result"
      onDismiss={onDiscard}
      visible={visible}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="primary" onClick={onDiscard}>Close</Button>
          </SpaceBetween>
        </Box>
      }
    >
      <code>
        {JSON.stringify(jobData, null, "\t")}
      </code>
    </Modal>
  );
}