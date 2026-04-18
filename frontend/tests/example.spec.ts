import { test, expect } from '@playwright/test';

// Example Playwright test

test('homepage has expected title', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page).toHaveTitle(/user story/i);
});
