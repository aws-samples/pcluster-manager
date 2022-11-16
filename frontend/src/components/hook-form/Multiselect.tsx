import {
  Multiselect,
  MultiselectProps,
  NonCancelableCustomEvent,
} from '@awsui/components-react'
import React, {FunctionComponent, useCallback} from 'react'
import {Controller, Control, FieldValues, Path} from 'react-hook-form'

export interface ControlledMultiSelectProps<T extends FieldValues>
  extends Omit<MultiselectProps, 'selectedOptions'> {
  name: Path<T>
  control: Control<T>
}

function getSelectedOptions(
  options: MultiselectProps.Options = [],
  values: string[],
): MultiselectProps.Option[] {
  return values.reduce<MultiselectProps.Option[]>((acc, value) => {
    const option = getSelectedOptionFromValue(options, value)
    if (option) {
      acc.push(option)
    }
    return acc
  }, [])
}

function getSelectedOptionFromValue(
  options: MultiselectProps.Options,
  value: string,
): MultiselectProps.Option | null {
  if (options) {
    for (const option of options) {
      if ('value' in option) {
        if (value === option.value) {
          return option
        }
      } else if ('options' in option) {
        return getSelectedOptionFromValue(option.options, value)
      }
    }
  }
  return null
}

export const ControlledMultiselect: FunctionComponent<
  ControlledMultiSelectProps<FieldValues>
> = <TFieldValues extends FieldValues>({
  name,
  control,
  ...props
}: ControlledMultiSelectProps<TFieldValues>) => {
  const handleOnBlur = useCallback(
    (formOnBlur: () => void, e: NonCancelableCustomEvent<{}>) => {
      formOnBlur()
      props.onBlur?.(e)
    },
    [props.onBlur],
  )

  const handleOnChange = useCallback(
    (
      formOnChange: (values: string[]) => void,
      e: NonCancelableCustomEvent<MultiselectProps.MultiselectChangeDetail>,
    ) => {
      formOnChange(e.detail.selectedOptions.map(opts => opts.value as string))
      props.onChange?.(e)
    },
    [props.onChange],
  )

  return (
    <Controller
      name={name}
      control={control}
      render={({field: {onChange, onBlur, value}}) => (
        <Multiselect
          name={name}
          selectedOptions={getSelectedOptions(props.options, value)}
          onBlur={handleOnBlur.bind(null, onBlur)}
          onChange={handleOnChange.bind(null, onChange)}
          {...props}
        />
      )}
    />
  )
}
