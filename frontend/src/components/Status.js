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

// Icons
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';
import DangerousIcon from '@mui/icons-material/Dangerous';
import NotInterestedIcon from '@mui/icons-material/NotInterested';

export default function Status(props) {
  const theme = useTheme();
  const aligned = (icon, text, color) => <div style={{
    color: color || 'black',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  }}>
    {icon}
    <span style={{display: 'inline-block', paddingLeft: '10px'}}> {text ? text.replaceAll("_", " ") : "<unknown>"}</span>
  </div>
    const statusMap = {"CREATE_IN_PROGRESS": aligned(<CircularProgress color='info' size={15} />, props.status, theme.palette.info.main),
      "CREATE_COMPLETE": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
      "DELETE_IN_PROGRESS": aligned(<CircularProgress size={15} color='error' />, props.status, theme.palette.error.main),
      "DELETE_FAILED": aligned(<NotInterestedIcon />, props.status, theme.palette.error.main),
      "RUNNING": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),
      "STOPPED": aligned(<CancelIcon />, props.status, theme.palette.error.main),
      "STOP_REQUESTED": aligned(<CircularProgress size={15} color='error' />, props.status, theme.palette.error.main),
      "UPDATE_FAILED": aligned(<DangerousIcon />, props.status, theme.palette.error.main),
      "UPDATE_IN_PROGRESS": aligned(<CircularProgress color='info' size={15} />, props.status, theme.palette.info.main),
      "UNKNOWN": aligned(<CircularProgress size={15} color='info' />, props.status, theme.palette.info.main),
      "UPDATE_COMPLETE": aligned(<CheckCircleOutlineIcon />, props.status, theme.palette.success.main),};
  return props.status in statusMap ? statusMap[props.status] : <span>{props.status ? props.status.replaceAll("_", " ") : "<unknown>"}</span>;
}
