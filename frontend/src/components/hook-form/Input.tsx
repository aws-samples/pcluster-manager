import {Input, InputProps} from '@awsui/components-react'
import React from 'react'
import {FieldValues, UseControllerProps, useController} from 'react-hook-form'

export type ControlledInputProps<T extends FieldValues> = Omit<
  InputProps,
  'value'
> &
  UseControllerProps<T>

export const ControlledInput = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledInputProps<TFieldValues>) => {
  const {
    field: {onChange, onBlur, value, ref},
  } = useController({
    name,
    control,
  })

  return (
    <Input
      ref={ref}
      name={name}
      value={value}
      onBlur={onBlur}
      onChange={e => onChange(e.detail.value)}
      {...props}
    />
  )
}
