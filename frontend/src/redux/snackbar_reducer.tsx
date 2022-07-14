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
import { ENQUEUE_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR } from './snackbar_actions';

const defaultState = {
    notifications: [],
};

const reducer = (state = defaultState, action: any) => {
    switch (action.type) {
        case ENQUEUE_SNACKBAR:
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    {
                        key: action.key,
                        ...action.notification,
                    },
                ],
            };

        case CLOSE_SNACKBAR:
            return {
    ...state,
    notifications: state.notifications.map(notification => ((action.dismissAll || (notification as any).key === action.key)
        ? // @ts-expect-error TS(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
                                              { ...notification, dismissed: true }
        : // @ts-expect-error TS(2698) FIXME: Spread types may only be created from object types... Remove this comment to see the full error message
                                              { ...notification })),
};

        case REMOVE_SNACKBAR:
            return {
    ...state,
    notifications: state.notifications.filter(notification => (notification as any).key !== action.key),
};

        default:
            return state;
    }
};

export default reducer;
