import {Toggle, ToggleProps} from '@awsui/components-react'
import React from 'react'
import {
  FieldValues,
  useController,
  UseControllerProps,
} from 'react-hook-form'

export type ControlledToggleProps<T extends FieldValues> = Omit<
  ToggleProps,
  'checked'
> &
  UseControllerProps<T>

export const ControlledToggle = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledToggleProps<TFieldValues>) => {
  const {
    field: {onChange, value},
  } = useController({
    name,
    control,
  })

  return (
    <Toggle
      name={name}
      checked={value}
      onChange={event => {
        onChange(event.detail.checked)
      }}
      {...props}
    />
  )
}
