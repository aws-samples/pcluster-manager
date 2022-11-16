import {Toggle, ToggleProps} from '@awsui/components-react'
import React, {FunctionComponent} from 'react'
import {Control, Controller, FieldValues, Path} from 'react-hook-form'

export interface ControlledToggleProps<T extends FieldValues>
  extends Omit<ToggleProps, 'checked'> {
  name: Path<T>
  control: Control<T>
}

export const ControlledToggle: FunctionComponent<
  ControlledToggleProps<FieldValues>
> = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledToggleProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, value = false}}) => (
        <Toggle
          name={name}
          checked={value}
          onChange={event => {
            onChange(event.detail.checked)
          }}
          {...props}
        />
      )}
    />
  )
}
