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

import {
  Container,
  ContentLayout,
  Link,
  TextContent,
} from '@cloudscape-design/components'
import React from 'react'
import errorPage from './../../public/img/error_pages_illustration.svg'
import Image from 'next/image'
import {useTranslation} from 'react-i18next'
import Layout from '../old-pages/Layout'
import {DefaultHelpPanel} from './help-panel/DefaultHelpPanel'
import {useHelpPanel} from './help-panel/HelpPanel'

export function NoMatch() {
  const {t} = useTranslation()
  useHelpPanel(<DefaultHelpPanel />)

  return (
    <Layout contentType="default">
      <ContentLayout header={<></>}>
        <Container>
          <Image src={errorPage} alt="test" height={100} />
          <TextContent>
            <h1>{t('noMatch.title')}</h1>
            <p>{t('noMatch.description')}</p>
            <p>{t('noMatch.links')}</p>
            <ul>
              <li>
                <Link href="/">{t('noMatch.home')}</Link>
              </li>
              <li>
                <Link
                  external
                  externalIconAriaLabel={t('global.openNewTab')}
                  href={t('global.docs.link')}
                >
                  {t('global.docs.title')}
                </Link>
              </li>
            </ul>
          </TextContent>
        </Container>
      </ContentLayout>
    </Layout>
  )
}
