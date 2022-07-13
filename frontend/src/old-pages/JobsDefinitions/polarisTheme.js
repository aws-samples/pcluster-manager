import { Input, Toggle } from "@awsui/components-react";
import { useState } from "react";


const PolarisTextWidget = (props) => {
  const [value, setValue] = useState(props.value);
  return (
    <>
      <Input value={value}
        required={props.required}
        onChange={(event) => props.onChange(setValue(event.detail.value))}
      />
    </>
  );
};

const PolarisCheckBoxWidget = (props) => {
  const [checked, setChecked] = useState(props.value);
  return (
    <Toggle
      checked={checked}
      onChange={({ detail }) =>
        props.onChange(setChecked(detail.checked))
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