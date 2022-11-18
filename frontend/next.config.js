// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      /**
      * Rewrite everything to `pages/index`
      * 
      * This is only here because as of yet we are not
      * relying on NextJS routing and react-router-dom
      * does not play well with SSR.
      * 
      * While doing the transition to NextJS routing,
      * we need a way to support both ways of functioning.
      * 
      * Please note, this is only useful in the context of
      * local development (`npm run dev`), as this app is
      * currently being built as a static export
      * and no rewrite is going to be actually run in production
      */
      {
        source: "/:any*",
        destination: "/",
      },
    ];
  },
}

const withTM = require("next-transpile-modules")([
  "@cloudscape-design/components",
]);

module.exports = withTM(nextConfig);  