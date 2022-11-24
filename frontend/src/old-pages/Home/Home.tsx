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

import Layout from '../Layout'

export default function Home() {
  return (
    <Layout>
      <div>
        <h2>Welcome to AWS ParallelCluster Manager</h2>
        This site provides an interface for creating and managing AWS
        ParallelCluster instances.
        <br />
        <br />
        Please choose from one of the options on the left side-bar. If you only
        see the &apos;Home&apos; icon, then your account is in &apos;guest&apos;
        mode and will need to be upgraded by an administrator of this instance
        of AWS ParallelCluster Manager. Please contact one of the administrators
        to have your account upgraded.
        <br />
        <br />
      </div>
    </Layout>
  )
}
