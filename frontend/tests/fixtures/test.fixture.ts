import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ApiClient } from '../api/ApiClient';

type TestFixtures = {
  homePage: HomePage;
  apiClient: ApiClient;
  captureScreenshot: (name: string) => Promise<void>;
  cleanupTestData: () => Promise<void>;
};

export const test = base.extend<TestFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    // Setup: Navigate to page before test
    await homePage.goto();
    await page.waitForLoadState('networkidle');
    
    // Run test
    await use(homePage);
    
    // Teardown: Optional cleanup after test
  },

  apiClient: async ({ request: req }, use) => {
    const apiClient = new ApiClient(req);
    await use(apiClient);
  },

  captureScreenshot: async ({ page }, use) => {
    const screenshots: string[] = [];
    
    await use(async (name: string) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `./test-results/screenshots/${name}-${timestamp}.png`;
      await page.screenshot({ path: filename, fullPage: true });
      screenshots.push(filename);
    });

    // Cleanup: No cleanup needed for screenshots
  },

  cleanupTestData: async ({ page }, use) => {
    await use(async () => {
      // Perform any cleanup operations needed after tests
      // Could be clearing local storage, cookies, IndexedDB, etc.
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    });
  },
});

export { expect } from '@playwright/test';
