// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
// with the License. A copy of the License is located at
//
// http://aws.amazon.com/apache2.0/
//
// or in the "LICENSE.txt" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions and
// limitations under the License.

import { expect, FileChooser, test } from '@playwright/test';

const E2E_URL = 'https://080pcqu70j.execute-api.eu-west-1.amazonaws.com'
const TEMPLATE_PATH = './fixtures/wizard.template.yaml'

test.describe('given a cluster configuration template created with single instance type', () => {
  test.describe('when the file is imported as a template', () => {
    test('user can perform a dry-run successfully', async ({ page }) => {
      await page.goto(E2E_URL);
      await page.getByRole('textbox', { name: 'name@host.com' }).click();
      await page.getByRole('textbox', { name: 'name@host.com' }).fill(process.env.E2E_TEST1_EMAIL!);
      await page.getByRole('textbox', { name: 'name@host.com' }).press('Tab');
      await page.getByRole('textbox', { name: 'Password' }).fill(process.env.E2E_TEST1_PASSWORD!);
      await page.getByRole('button', { name: 'submit' }).click();

      await page.getByRole('button', { name: 'Create Cluster' }).first().click();
      await page.getByPlaceholder('Enter your cluster name').fill('sdasdasd');

      page.on("filechooser", (fileChooser: FileChooser) => {
        fileChooser.setFiles([TEMPLATE_PATH]);
      })
      await page.getByRole('radio', { name: 'Template' }).click();
      await page.getByRole('button', { name: 'Next' }).click();

      await expect(page.getByRole('heading', { name: 'Cluster Properties' })).toBeVisible()
      await page.getByRole('button', { name: 'Next' }).click();
      
      await expect(page.getByRole('heading', { name: 'Head Node Properties' })).toBeVisible()
      await page.getByRole('button', { name: 'Next' }).click();
      
      await expect(page.getByRole('heading', { name: 'Storage Properties' })).toBeVisible()
      await page.getByRole('button', { name: 'Next' }).click();
      
      await expect(page.getByRole('heading', { name: 'Queues' })).toBeVisible()
      await page.getByRole('button', { name: 'Next' }).click();
      
      await expect(page.getByRole('heading', { name: 'Cluster Configuration' })).toBeVisible()
      await page.getByRole('button', { name: 'Dry Run' }).click();
      
      await expect(page.getByText('Request would have succeeded, but DryRun flag is set.')).toBeVisible()
    });
  });
});