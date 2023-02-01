// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.
import React from 'react'
import AbsoluteTimestamp, {TimeZone} from './AbsoluteTimestamp'

type DateViewProps = {
  date: string
  locales?: string | string[]
  timeZone?: TimeZone
}

export default function DateView({
  date,
  locales = 'en-Us',
  timeZone = TimeZone.Local,
}: DateViewProps) {
  const timestamp = Date.parse(date)
  return (
    <AbsoluteTimestamp locales={locales} timeZone={timeZone}>
      {timestamp}
    </AbsoluteTimestamp>
  )
}
