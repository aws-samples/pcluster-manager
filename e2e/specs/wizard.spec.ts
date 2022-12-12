
import { expect, test } from '@playwright/test';

const E2E_URL = 'https://080pcqu70j.execute-api.eu-west-1.amazonaws.com'

test.describe('Given an endpoint where ParallelCluster Manager is deployed', () => {
  test('a user should be able to login, navigate till the end of the cluster creation wizard, and perform a dry-run successfully', async ({ page }) => {
    await page.goto(E2E_URL);
    await page.getByRole('textbox', { name: 'name@host.com' }).click();
    await page.getByRole('textbox', { name: 'name@host.com' }).fill(process.env.E2E_TEST1_EMAIL!);
    await page.getByRole('textbox', { name: 'name@host.com' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(process.env.E2E_TEST1_PASSWORD!);
    await page.getByRole('button', { name: 'submit' }).click();
  
    await page.getByRole('button', { name: 'Create Cluster' }).click();
    await expect(page.getByRole('heading', { name: 'Cluster Name' })).toBeVisible()
    await page.getByRole('textbox', { name: 'Enter your cluster name' }).fill("testcluster");
    await page.getByRole('button', { name: 'Next' }).click();
    
    await expect(page.getByRole('heading', { name: 'Cluster Properties' })).toBeVisible()
    await page.getByRole('button', { name: 'Select a VPC' }).click();
    await page.getByText(/vpc-.*/).first().click();
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
})
