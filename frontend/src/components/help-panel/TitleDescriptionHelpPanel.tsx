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

import {HelpPanel, Icon} from '@cloudscape-design/components'
import * as React from 'react'
import {useTranslation} from 'react-i18next'

interface TitleDescriptionHelpPanelProps {
  title: string
  description: string
}

function TitleDescriptionHelpPanel({
  title,
  description,
}: TitleDescriptionHelpPanelProps) {
  const {t} = useTranslation()

  return (
    <HelpPanel
      header={<h2>{title}</h2>}
      footer={
        <div>
          <h3>
            {t('helpPanel.footer.learnMore')} <Icon name="external" />
          </h3>
          <ul>
            <li>
              <a href={t('helpPanel.footer.docs.link')}>
                {t('helpPanel.footer.docs.title')}
              </a>
            </li>
          </ul>
        </div>
      }
    >
      <div>
        <p>{description}</p>
      </div>
    </HelpPanel>
  )
}

export default TitleDescriptionHelpPanel
