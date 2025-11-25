import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('captures the page HTML', async ({ page }) => {
  await page.goto('http://localhost:5177');
  const html = await page.content();
  fs.writeFileSync('page.html', html);
});
