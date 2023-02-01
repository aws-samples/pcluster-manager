import React, {ReactElement} from 'react'

const MINUTES_PER_HOUR = 60

export enum TimeZone {
  Local = 'local',
  UTC = 'utc',
}

interface AbsoluteTimestampProps {
  children: number
  locales: string | string[]
  timeZone: TimeZone
}

interface Options {
  format: (hours: number, minutes: number) => string
}

const OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  month: 'long',
  year: 'numeric',
}

function leftPad(n: number): number | string {
  if (n < 10) {
    return `0${n}`
  }
  return n
}

export function getTimeZoneOffsetString(
  timeZoneOffset: number,
  {format}: Options,
): string {
  if (timeZoneOffset === 0) {
    return ''
  }

  const utcOffset: number = -1 * timeZoneOffset
  const absUtcOffset: number = Math.abs(utcOffset)
  const hours: number = Math.floor(absUtcOffset / MINUTES_PER_HOUR)
  const minutes: number = absUtcOffset % MINUTES_PER_HOUR

  const formatted: string = format(hours, minutes)
  if (utcOffset < 0) {
    return `-${formatted}`
  }
  return `+${formatted}`
}

export function mapTimeZoneOffsetToAbsoluteString(
  timeZoneOffset: number,
): string {
  return getTimeZoneOffsetString(timeZoneOffset, {
    format(hours: number, minutes: number): string {
      return `${hours}:${leftPad(minutes)}`
    },
  })
}

export function mapTimeZoneOffsetToIsoString(timeZoneOffset: number): string {
  return getTimeZoneOffsetString(timeZoneOffset, {
    format(hours: number, minutes: number): string {
      return `${leftPad(hours)}:${leftPad(minutes)}`
    },
  })
}

export default function AbsoluteTimestamp({
  children: timestamp,
  locales,
  timeZone,
}: AbsoluteTimestampProps): ReactElement {
  const date: Date = React.useMemo((): Date => {
    return new Date(timestamp)
  }, [timestamp])

  const options: Intl.DateTimeFormatOptions =
    React.useMemo((): Intl.DateTimeFormatOptions => {
      if (timeZone === TimeZone.Local) {
        return OPTIONS
      }
      return {
        ...OPTIONS,
        timeZone: 'UTC',
      }
    }, [timeZone])

  const isoString: string = date.toISOString()
  const timeZoneOffset: number =
    timeZone === TimeZone.Local ? date.getTimezoneOffset() : 0
  const timeZoneOffsetStr: string =
    mapTimeZoneOffsetToAbsoluteString(timeZoneOffset)

  return (
    <time dateTime={isoString} title={isoString}>
      {`${date.toLocaleString(locales, options)} (UTC${timeZoneOffsetStr})`}
    </time>
  )
}
