import {
  NonCancelableCustomEvent,
  Select,
  SelectProps,
} from '@awsui/components-react'
import React, {FunctionComponent, useCallback} from 'react'
import {Controller, Control, FieldValues, Path} from 'react-hook-form'

export interface ControlledSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'selectedOption'> {
  name: Path<T>
  control: Control<T>
}

function getSelectedOption(
  options: SelectProps.Options = [],
  value: string,
): SelectProps.Option | null {
  if (options) {
    for (const option of options) {
      if ('value' in option) {
        if (value === option.value) {
          return option
        }
      } else if ('options' in option) {
        return getSelectedOption(option.options, value)
      }
    }
  }
  return null
}

export const ControlledSelect: FunctionComponent<
  ControlledSelectProps<FieldValues>
> = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledSelectProps<TFieldValues>) => {
  const handleOnBlur = useCallback(
    (formOnBlur: () => void, e: NonCancelableCustomEvent<{}>) => {
      formOnBlur()
      props.onBlur?.(e)
    },
    [props.onBlur],
  )

  const handleOnChange = useCallback(
    (
      formOnChange: (value?: string) => void,
      e: NonCancelableCustomEvent<SelectProps.ChangeDetail>,
    ) => {
      formOnChange(e.detail.selectedOption.value)
      props.onChange?.(e)
    },
    [props.onChange],
  )

  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, onBlur, value}}) => (
        <Select
          name={name}
          selectedOption={getSelectedOption(props.options, value)}
          onBlur={handleOnBlur.bind(null, onBlur)}
          onChange={handleOnChange.bind(null, onChange)}
          {...props}
        />
      )}
    />
  )
}
