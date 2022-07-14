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
import Spinner from "@awsui/components-react/spinner";

export default function Loading(props) {
  return (<div style={{
    color: props.color || '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  }}>
    <Spinner size="normal" />
    <span style={{display: 'inline-block', paddingLeft: '10px'}}> {props.text || "Loading..."}</span>
  </div>
  );
}
