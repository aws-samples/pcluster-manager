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

// UI Elements
import { useTheme } from '@mui/material/styles';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

// Icons
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export default function ValidationErrors(props) {
  const theme = useTheme();
  const colorMap = (level) => {
    return {
      "ERROR": theme.palette.error.main,
      "WARNING": theme.palette.warning.main,
      "SUCCESS": theme.palette.success.main
    }[level] || "blue";
  };

  const colored = (text, success) => <div style={{
    color: success ? theme.palette.success.main : theme.palette.error.main,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  }}>
    {success ? <CheckIcon /> : <CloseIcon />}
    <div style={{display: 'inline-block', paddingLeft: '10px'}}> {text}</div>
  </div>

  var success = props.errors.message && props.errors.message.includes("succeeded");
  var configErrors = props.errors.configurationValidationErrors || props.errors.validationMessages;
  var updateErrors = props.errors.updateValidationErrors;
  return <div>
    {colored(props.errors.message, success)}
    {configErrors &&
      <div className="validation-errors">
        Validation {props.errors.configurationValidationErrors ? "Errors" : "Warnings"}:
        <List>
          {configErrors.map((error, i) => <ListItem disablePadding key={i}><ListItemText primaryTypographyProps={{ style: {color: colorMap(error.level)} }} primary={`${error.type}: ${error.message}`} /></ListItem>)}
        </List>
      </div>
    }
    {updateErrors &&
      <div className="validation-errors">
        Update Errors:
        <List>
          {updateErrors.map((error, i) => <ListItem disablePadding key={i}><ListItemText primaryTypographyProps={{ style: {color: colorMap("ERROR")} }} primary={`${error.message}`} /></ListItem>)}
        </List>
      </div>
    }
  </div>
}
