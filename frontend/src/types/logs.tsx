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

export type LogStreamName = string

export type LogEvent = {
  message: string
  timestamp: string
}

export type LogEvents = LogEvent[]

export type LogFilterList = LogFilterExpression[]

export type LogFilterExpression = string

export type LogStreams = LogStream[]

export type LogStream = {
  // Name of the log stream.
  logStreamName: string
  // The creation time of the stream.
  creationTime: string
  // The time of the first event of the stream.
  firstEventTimestamp: string
  // The time of the last event of the stream. The lastEventTime value updates on an eventual consistency basis. It typically updates in less than an hour from ingestion, but in rare situations might take longer.
  lastEventTimestamp: string
  // The last ingestion time.
  lastIngestionTime: string
  // The sequence token.
  uploadSequenceToken: string
  // The Amazon Resource Name (ARN) of the log stream.
  logStreamArn: string
}
