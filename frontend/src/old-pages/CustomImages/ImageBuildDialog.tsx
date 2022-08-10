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
import { BuildImage } from '../../model'

// UI Elements
import {
  Box,
  Button,
  FormField,
  Header,
  Input,
  Modal,
  SpaceBetween,
  Spinner,
} from "@awsui/components-react";

// Components
import ValidationErrors from '../../components/ValidationErrors'

// State
import { setState, useState, getState, clearState } from '../../store'
import ConfigView from '../../components/ConfigView';

const buildImageErrorsPath = ['app', 'buildImage', 'errors'];

// Constants
const imageBuildPath = ['app', 'customImages', 'imageBuild'];

function buildImageValidate(suppressUpload = false) {
  let valid = true;
  const imageId = getState([...imageBuildPath, 'imageId']);

  setState([...buildImageErrorsPath, 'validated'], true);

  if(!imageId || imageId === "")
  {
    setState([...buildImageErrorsPath, 'imageId'], 'Image ID must not be blank.');
    valid = false;
  } else {
    clearState([...buildImageErrorsPath, 'imageId']);
  }

  return valid;
}

const FileUploadButton = (props: any) => {
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
    <>
      <Button onClick={handleClick}>
        Choose file...
      </Button>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{display: 'none'}}
      />
    </>
  );
}

export default function ImageBuildDialog(props: any) {
  const open = useState([...imageBuildPath, 'dialog']);
  const imageConfig = useState([...imageBuildPath, 'config']) || "";
  const errors = useState([...imageBuildPath, 'errors']);
  const imageId = useState([...imageBuildPath, 'imageId']);
  const pending = useState([...imageBuildPath, 'pending']);

  let validated = useState([...buildImageErrorsPath, 'validated']);

  let imageIdError = useState([...buildImageErrorsPath, 'imageId']);

  const handleClose = () => {
    setState([...imageBuildPath, 'dialog'], false);
    clearState([...imageBuildPath, 'errors']);
  };

  const handleBuild = () => {
    var errHandler = (err: any) => {setState([...imageBuildPath, 'errors'], err); setState([...imageBuildPath, 'pending'], false);}
    var successHandler = (_resp: any) => {setState([...imageBuildPath, 'pending'], false); handleClose();}
    clearState([...imageBuildPath, 'errors']);
    setState([...imageBuildPath, 'pending'], true)
    buildImageValidate() && BuildImage(imageId, imageConfig, successHandler, errHandler);
  }

  const setImageId = (newImageId: any) => {
    if(newImageId !== imageId)
    {
      setState([...imageBuildPath, 'imageId'], newImageId);
      if(validated)
        buildImageValidate();
    }
  }

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        (descriptionElement as any).focus();
      }
    }
  }, [open]);

  return (
    <Modal
      className="wizard-dialog"
      visible={open || false}
      onDismiss={handleClose}
      closeAriaLabel="Close modal"
      size="large"
      header={<Header variant="h2">Image Configuration: {props.imageId}</Header>}
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={handleClose}>Cancel</Button>
            <Button disabled={pending} onClick={() => {buildImageValidate() && handleBuild()}}>Build Image</Button>
          </SpaceBetween>
        </Box>
      }>
      <SpaceBetween direction="vertical" size="xs">
        <div style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "16px"}}>
          <FileUploadButton
            className="upload" handleData={(data: any) => {setState([...imageBuildPath, 'config'], data)}}
          />
          <div>Image Id:</div>
          <FormField errorText={imageIdError}>
            <Input value={imageId} onChange={({ detail }) => {setImageId(detail.value)}} />
          </FormField>
        </div>
        {<ConfigView
          config={imageConfig}
          onChange={({
            detail
          }: any) => {setState([...imageBuildPath, 'config'], detail.value)}}/>}
        {errors && <ValidationErrors errors={errors} /> }
        {pending && <div><Spinner size="normal" /> Image Build request pending...</div>}
      </SpaceBetween>
    </Modal>
  );
}
