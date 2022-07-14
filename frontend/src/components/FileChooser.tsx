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
import * as React from 'react';

// UI Elements
import { Button } from "@awsui/components-react";

// State
import { setState, getState } from '../store'

function HiddenUploader({
  callbackPath,
  handleData,
  handleCancel
}: any) {
  const hiddenFileInput = React.useRef(null);
  const handleClick = React.useCallback(event => {
    // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
    hiddenFileInput.current.click();
  }, [hiddenFileInput]);

  const handleChange = (event: any) => {
    var file = event.target.files[0]
    var reader = new FileReader();
    reader.onload = function(e) {
      // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
      handleData(e.target.result)
    }
    reader.readAsText(file);
  };

  React.useEffect(() => {
    if(!getState(callbackPath) || getState(callbackPath) !== handleClick)
      setState(callbackPath, handleClick);
  }, [callbackPath, handleClick])

  return (
    <input
      type="file"
      ref={hiddenFileInput}
      onChange={handleChange}
      style={{display: 'none'}}
    />
  );
}

function FileUploadButton(props: any) {
  const hiddenFileInput = React.useRef(null);
  const handleClick = (event: any) => {
    // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
    hiddenFileInput.current.click();
  };
  const handleChange = (event: any) => {
    var file = event.target.files[0]
    var reader = new FileReader();
    reader.onload = function(e) {
      // @ts-expect-error TS(2531) FIXME: Object is possibly 'null'.
      props.handleData(e.target.result)
    }
    reader.readAsText(file);
  };
  return (
    <div>
      {/* @ts-expect-error TS(2322) FIXME: Type '"contained"' is not assignable to type 'Vari... Remove this comment to see the full error message */}
      <Button onClick={handleClick} variant="contained">
        Choose file...
      </Button>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{display: 'none'}}
      />
    </div>
  );
}

export { FileUploadButton as default, HiddenUploader }
