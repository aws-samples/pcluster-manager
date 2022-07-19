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