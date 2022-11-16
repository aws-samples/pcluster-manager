import {Input, InputProps} from '@awsui/components-react'
import React, {FunctionComponent} from 'react'
import {Controller, Control, Path, FieldValues} from 'react-hook-form'

export interface ControlledInputProps<T extends FieldValues>
  extends Omit<InputProps, 'value'> {
  name: Path<T>
  control?: Control<T>
}

export const ControlledInput: FunctionComponent<
  ControlledInputProps<FieldValues>
> = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledInputProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({field: {ref, onChange, onBlur, value}}) => (
        <Input
          ref={ref}
          name={name}
          value={value}
          onBlur={onBlur}
          onChange={e => onChange(e.detail.value)}
          {...props}
        />
      )}
    />
  )
}
