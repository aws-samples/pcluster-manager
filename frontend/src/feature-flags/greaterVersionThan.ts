// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

export function greaterVersionThan(versionA: string, versionB: string) {
  const [majorA, minorA, patchA] = versionA.split('.')
  const [majorB, minorB, patchB] = versionB.split('.')

  if (majorA < majorB) return false
  if (minorA < minorB) return false
  if (patchA < patchB) return false

  return true
}
