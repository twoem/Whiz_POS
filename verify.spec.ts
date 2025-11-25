import { test, expect } from '@playwright/test';

test('launch app and take screenshot', async ({ page }) => {
  await page.goto('http://localhost:5175');
  await page.screenshot({ path: 'screenshot.png' });
});
