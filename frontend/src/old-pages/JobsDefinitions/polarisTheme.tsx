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

import { Input, Toggle } from "@awsui/components-react";
import { useState } from "react";


const PolarisTextWidget = (props: any) => {
  return (
    <>
      <Input {...props}
        onChange={(event) => 
          props.onChange(event.detail.value)
        }
      />
    </>
  );
};

const PolarisCheckBoxWidget = (props: any) => {
  return (
    <Toggle
      {...props}
      checked={props.value}
      onChange={({ detail }) =>
        props.onChange(detail.checked)
      }
    >
      {props.schema.title}
    </Toggle>
  );
}

const polarisWidgets = {
  TextWidget: PolarisTextWidget,
  CheckboxWidget: PolarisCheckBoxWidget,
};

export const polarisTheme = {
  fields: {},
  widgets: polarisWidgets
};