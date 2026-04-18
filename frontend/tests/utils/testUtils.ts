/**
 * Shared Test Utilities and Helpers
 * Common functions and constants used across all tests
 */

import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

// ============ Test Data Constants ============

export const TEST_STORIES = {
  VALID_LOGIN: {
    title: 'Login Feature',
    criteria: 'User should be able to login with valid credentials',
    description: 'User attempts to login with username and password',
    info: 'Test across Chrome and Firefox',
  },
  VALID_PAYMENT: {
    title: 'Payment Processing',
    criteria: 'Process payment successfully',
    description: 'User goes through payment checkout flow',
    info: 'Support multiple payment methods',
  },
  VALID_SEARCH: {
    title: 'Search Feature',
    criteria: 'User should be able to search for products',
    description: 'Search by product name, category, or keywords',
    info: 'Should support pagination and filters',
  },
  MISSING_TITLE: {
    title: '',
    criteria: 'Some acceptance criteria',
  },
  MISSING_CRITERIA: {
    title: 'Some title',
    criteria: '',
  },
};

export const TEST_TIMEOUTS = {
  SHORT: 2000,
  MEDIUM: 5000,
  LONG: 10000,
  API_CALL: 5000,
  PAGE_LOAD: 5000,
};

export const TEST_MESSAGES = {
  REQUIRED_FIELDS_ERROR: 'Story Title and Acceptance Criteria are required',
  GENERATION_SUCCESS: 'Test cases generated successfully',
  INVALID_PAYLOAD: 'Invalid payload',
  SERVER_ERROR: 'Internal server error',
};

// ============ Test Utilities ============

/**
 * Wait for page to be fully ready
 */
export async function waitForPageReady(page: Page, timeout: number = TEST_TIMEOUTS.PAGE_LOAD) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForLoadState('domcontentloaded', { timeout });
}

/**
 * Verify page title
 */
export async function verifyPageTitle(page: Page, expectedTitle: string) {
  const title = await page.title();
  expect(title).toContain(expectedTitle);
}

/**
 * Get all visible text content from page
 */
export async function getPageText(page: Page): Promise<string> {
  return await page.evaluate(() => document.body.innerText);
}

/**
 * Check if element exists and is visible
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Get element text safely
 */
export async function getElementText(page: Page, selector: string): Promise<string> {
  try {
    return await page.locator(selector).textContent() || '';
  } catch {
    return '';
  }
}

/**
 * Click element with retry
 */
export async function clickWithRetry(page: Page, selector: string, maxRetries: number = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.locator(selector).click();
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(100);
    }
  }
  throw lastError;
}

/**
 * Fill input with clear and verification
 */
export async function fillInputValue(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.click();
  await input.clear();
  await input.fill(value);
  
  // Verify value was filled
  const filledValue = await input.inputValue();
  expect(filledValue).toBe(value);
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshotWithTimestamp(page: Page, testName: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const path = `./test-results/screenshots/${testName}-${timestamp}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

/**
 * Get browser console messages
 */
export async function captureConsoleLogs(page: Page): Promise<string[]> {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(msg.text()));
  return logs;
}

/**
 * Verify API response status
 */
export async function verifyResponseStatus(response: any, expectedStatus: number) {
  expect(response.status()).toBe(expectedStatus);
}

/**
 * Retry async operation
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError;
}

/**
 * Compare two test case objects
 */
export function compareTestCases(testCase1: any, testCase2: any): boolean {
  return (
    testCase1.id === testCase2.id &&
    testCase1.title === testCase2.title &&
    testCase1.priority === testCase2.priority &&
    JSON.stringify(testCase1.steps) === JSON.stringify(testCase2.steps)
  );
}

/**
 * Validate test case structure
 */
export function validateTestCaseStructure(testCase: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!testCase.id) errors.push('Missing test case ID');
  if (!testCase.title) errors.push('Missing test case title');
  if (!testCase.priority) errors.push('Missing priority');
  if (!testCase.steps || testCase.steps.length === 0) errors.push('Missing steps');
  if (!testCase.expectedResult) errors.push('Missing expected result');
  if (!['High', 'Medium', 'Low'].includes(testCase.priority)) {
    errors.push('Invalid priority value');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format test case as readable text
 */
export function formatTestCaseAsText(testCase: any): string {
  return `
Test Case: ${testCase.id}
Title: ${testCase.title}
Priority: ${testCase.priority}
Category: ${testCase.category || 'N/A'}

Steps:
${testCase.steps.map((step: string, i: number) => `  ${i + 1}. ${step}`).join('\n')}

Expected Result: ${testCase.expectedResult}
${testCase.testData ? `Test Data: ${testCase.testData}` : ''}
`;
}

/**
 * Wait for element to have specific text
 */
export async function waitForElementWithText(
  page: Page,
  selector: string,
  text: string,
  timeout: number = TEST_TIMEOUTS.MEDIUM
) {
  await page.waitForSelector(`${selector}:has-text("${text}")`, { timeout });
}

/**
 * Get all test case data from page
 */
export async function extractTestCasesFromDOM(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    const testCases = [];
    const elements = document.querySelectorAll('[data-testid="test-case"], .test-case');

    elements.forEach((element) => {
      const id = element.querySelector('[class*="id"]')?.textContent || '';
      const title = element.querySelector('[class*="title"]')?.textContent || '';
      const priority = element.querySelector('[class*="priority"]')?.textContent || '';
      const steps = Array.from(element.querySelectorAll('[class*="step"]')).map((el) => el.textContent || '');
      const expectedResult = element.querySelector('[class*="expected"]')?.textContent || '';

      testCases.push({ id, title, priority, steps, expectedResult });
    });

    return testCases;
  });
}

/**
 * Measure API response time
 */
export async function measureApiResponseTime(apiCall: () => Promise<any>): Promise<number> {
  const startTime = Date.now();
  await apiCall();
  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * Check console for errors
 */
export async function checkForConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Give some time for errors to be logged
  await page.waitForTimeout(500);
  
  return errors;
}

/**
 * Generate random test data
 */
export function generateRandomTestStory() {
  const randomId = Math.random().toString(36).substring(7);
  return {
    title: `Random Story ${randomId}`,
    criteria: `Random criteria for story ${randomId}`,
    description: `Random description ${randomId}`,
    info: `Random info ${randomId}`,
  };
}
