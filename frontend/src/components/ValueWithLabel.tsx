import {SpaceBetween, Box} from '@cloudscape-design/components'
import {PropsWithChildren, ReactElement} from 'react'

export const ValueWithLabel = ({
  label,
  children,
  info,
}: PropsWithChildren<{label: string; info?: ReactElement}>) => (
  <div>
    <SpaceBetween direction="horizontal" size="s">
      <Box
        variant="awsui-key-label"
        margin={{bottom: 'xxxs'}}
        color="text-label"
      >
        {label}
      </Box>
      {info}
    </SpaceBetween>
    <div>{children}</div>
  </div>
)
