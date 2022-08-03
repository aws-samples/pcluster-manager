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

// @ts-expect-error TS(7023) FIXME: 'getIn' implicitly has return type 'any' because i... Remove this comment to see the full error message
function getIn(src: any, path: any) {
  if(path.length > 1)
    if(Array.isArray(src))
    {
      return (path[0] in src) ? getIn(src[path[0]], path.slice(1)) : null;
    } else {
      return src && src.hasOwnProperty(path[0]) ? getIn(src[path[0]], path.slice(1)) : null;
    }
  if(Array.isArray(src))
    return (path[0] in src) ? src[path[0]] : null;
  return src && (src.hasOwnProperty(path[0]) ? src[path[0]] : null);
}

function findFirst(xs: any, predicate: any) {
  for(const x of (xs || []))
    if(predicate(x))
      return x
}

function swapIn(source: any, key: any, value: any) {
  if(Array.isArray(source))
    return [...source.slice(0, key), value, ...source.slice(key + 1)]
  return {...source, [key]: value}
}

// @ts-expect-error TS(7023) FIXME: 'setIn' implicitly has return type 'any' because i... Remove this comment to see the full error message
function setIn(state: any, path: any, value: any) {
  if(path.length > 1)
  {
    const subState = state && path[0] in state ? state[path[0]] : {};
    // @ts-expect-error TS(7022) FIXME: 'updated' implicitly has type 'any' because it doe... Remove this comment to see the full error message
    const updated = setIn(subState, path.slice(1), value);
    return swapIn(state, path[0], updated);
  }
  return swapIn(state, path[0], value);
}

// @ts-expect-error TS(7023) FIXME: 'updateIn' implicitly has return type 'any' becaus... Remove this comment to see the full error message
function updateIn(state: any, path: any, update: any) {
  if(path.length > 1)
  {
    const subState = state && path[0] in state ? state[path[0]] : {};
    // @ts-expect-error TS(7022) FIXME: 'updated' implicitly has type 'any' because it doe... Remove this comment to see the full error message
    const updated = updateIn(subState, path.slice(1), update);
    return swapIn(state, path[0], updated);
  }
  const existing = path[0] in state ? (Array.isArray(state[path[0]]) ? [...state[path[0]]] : {...state[path[0]]}) : null
  return swapIn(state, path[0], update(existing));
}


function clusterDefaultUser(cluster: any) {
  let os = getIn(cluster.config, ['Image', 'Os'])
  // @ts-expect-error TS(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  return {"alinux2": "ec2-user",
    "ubuntu2004": "ubuntu",
    "ubuntu1804": "ubuntu",
    "centos7": "centos"}[os]
}

function clamp(num: number, min: number, max: number, step?: number): number
{
  step ||= 1;
  const clamped = Math.max(min, Math.min(max, num));
  const remain = clamped % step;
  return clamped - remain;
}

export { clamp, getIn, swapIn, setIn, updateIn, findFirst, clusterDefaultUser }
