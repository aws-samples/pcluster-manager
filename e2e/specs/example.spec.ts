import { test } from '@playwright/test';

test('visits page', async ({ page }) => {
  await page.goto('https://0l0pqd58m8.execute-api.eu-west-1.amazonaws.com/');
});
