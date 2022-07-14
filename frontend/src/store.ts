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
import { createStore, combineReducers } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'
import notifications from './redux/snackbar_reducer'
import { getIn, swapIn } from './util'
import { USER_ROLES_CLAIM } from './auth/constants'

// These are identity reducers that allow the names to be at the top level for combining
function clusters(state = {}, action: any){ return state }
function customImages(state = {}, action: any){ return state }
function officialImages(state = {}, action: any){ return state }
function users(state = {}, action: any){ return state }
function wizard(state = {}, action: any){ return state }
function app(state = {}, action: any){ return state }
function aws(state = {}, action: any){ return state }
function identity(state = {}, action: any){ return state }

const appReducer = combineReducers({ clusters, customImages, notifications, officialImages, wizard, app, users, identity, aws });

function recurseAction(state: any, action: any) {
  const {path} = action.payload
  const subState = state && path[0] in state ? state[path[0]] : {};
  const nested = rootReducer(subState, {type: action.type, payload: {...action.payload, path: path.slice(1)}})
  const ret = swapIn(state, path[0], nested)
  return ret
}

// @ts-expect-error TS(7023) FIXME: 'clone' implicitly has return type 'any' because i... Remove this comment to see the full error message
function clone(thing: any, opts: any) {
    var newObject = {};
    if (thing instanceof Array) {
        return thing.map(function (i) { return clone(i, opts); });
    } else if (thing instanceof Date) {
        return new Date(thing);
    } else if (thing instanceof Set) {
        return new Set(thing);
    } else if (thing instanceof RegExp) {
        return new RegExp(thing);
    } else if (thing instanceof Object) {
        // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        Object.keys(thing).forEach(function (key) { newObject[key] = clone(thing[key], opts); });
        return newObject;
    } else if ([ undefined, null ].indexOf(thing) > -1) {
        return thing;
    } else {
        if (thing.constructor.name === 'Symbol') {
            return Symbol(thing.toString().replace(/^Symbol\(/, '').slice(0, -1));
        }
        return thing.__proto__.constructor(thing);
    }
}

function rootReducer(state: any, action: any) {
  switch(action.type) {
    case 'state/clearAll':
      // Keep the selected region, everything else will be retrieved again
      const keep = (({ selectedRegion, sidebar, section }) => ({ selectedRegion, sidebar, section }))(state.app)
      return {...appReducer(undefined, action), app: keep};
    case 'state/store':
    {
      const {path, value} = action.payload
      if(path.length > 1)
        return recurseAction(state, action);
      return swapIn(state, path[0], value)
    }
    case 'state/clear':
    {
      const {path} = action.payload
      if(path.length > 1)
        return recurseAction(state, action);

      let ret = null;
      if(Array.isArray(state))
      {
        ret = [...state];
        ret.splice(path[0], 1)
      } else {
        ret = {...state};
        delete ret[path[0]];
      }
      return ret
    }
    case 'state/update':
    {
      const {path, update} = action.payload
      if(path.length > 1)
        return recurseAction(state, action);

      // @ts-expect-error TS(2554) FIXME: Expected 2 arguments, but got 1.
      const existing = path[0] in state ? clone(state[path[0]]) : null;
      return swapIn(state, path[0], update(existing));
    }
    default:
      return appReducer(state, action);
  }
}

const store = createStore(rootReducer);

function setState(path: any, value: any) {
  store.dispatch({type: 'state/store', payload: {path: path, value: value}});
}

function updateState(path: any, update: any) {
  store.dispatch({type: 'state/update', payload: {path: path, update: update}});
}

function clearState(path: any) {
  store.dispatch({type: 'state/clear', payload: {path: path}});
}

function clearAllState() {
  store.dispatch({type: 'state/clearAll', payload: null})
}

function clearEmptyNest(path: any, depth: any){
  if(depth === 0)
    return;

  let parentPath = path.slice(0, -1)
  if(Object.keys(getState(parentPath)).length === 0)
  {
    clearState(parentPath);
    clearEmptyNest(parentPath, depth - 1)
  }
}

// @ts-expect-error TS(7023) FIXME: 'getState' implicitly has return type 'any' becaus... Remove this comment to see the full error message
function getState(state: any, path?:string[]) {
  // Don't pass the state in if running outside of a component and we can pull
  // directly from the store
  if(path === undefined)
    return getState(store.getState(), state);
  return getIn(state, path);
}

function useState(path: any) {
  return useSelector((s) => getState(s, path))
}

function isAdmin() {
  let groups = getState(['identity', USER_ROLES_CLAIM]) || [];
  return groups && groups.includes("admin");
}

function isUser() {
  let groups = getState(['identity', USER_ROLES_CLAIM]) || [];
  return groups && ((groups.includes("admin")) || (groups.includes("user")));
}

function isGuest() {
  let identity = getState(['identity']);
  return identity && (!isAdmin() && !isUser());
}

function ssmPolicy(region: any) {
  const partition = (region && region.startsWith('us-gov')) ? 'aws-us-gov' : 'aws';
  return `arn:${partition}:iam::aws:policy/AmazonSSMManagedInstanceCore`;
}

function consoleDomain(region: any) {
  return (region && region.startsWith('us-gov')) ? 'https://console.amazonaws-us-gov.com' : `https://${region}.console.aws.amazon.com`
}

export {store as default, store, setState, getState, clearState, clearEmptyNest,
  clearAllState, useState, updateState, isAdmin, isUser, isGuest,
  ssmPolicy, consoleDomain}
