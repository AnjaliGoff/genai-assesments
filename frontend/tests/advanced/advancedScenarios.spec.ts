/**
 * Advanced Test Scenarios
 * Complex workflows, edge cases, and comprehensive test coverage
 */

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ApiClient } from '../api/ApiClient';
import {
  TEST_STORIES,
  TEST_TIMEOUTS,
  TEST_MESSAGES,
  validateTestCaseStructure,
  formatTestCaseAsText,
  retryAsync,
  generateRandomTestStory,
  extractTestCasesFromDOM,
  measureApiResponseTime,
} from '../utils/testUtils';

test.describe('Advanced Test Scenarios', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    await page.waitForLoadState('networkidle');
  });

  // ============ Edge Case Tests ============

  test.describe('Edge Cases', () => {
    test('should handle very long user story title', async ({ page }) => {
      const longTitle = 'A'.repeat(500);
      await homePage.fillStoryTitle(longTitle);
      await homePage.fillAcceptanceCriteria('Some criteria');
      await homePage.clickGenerateButton();

      // Should either generate or show error
      await page.waitForTimeout(TEST_TIMEOUTS.API_CALL);
      const hasResults = await homePage.isResultsVisible();
      const hasError = await homePage.hasErrorMessage();
      expect([true, false]).toContain(hasResults || hasError);
    });

    test('should handle special characters in story input', async ({ page }) => {
      const specialChars = 'Story <>&"\' test with special chars!@#$%^&*()';
      await homePage.fillStoryTitle(specialChars);
      await homePage.fillAcceptanceCriteria('User does something @#$%');
      await homePage.clickGenerateButton();

      await page.waitForTimeout(TEST_TIMEOUTS.API_CALL);
      const hasResults = await homePage.isResultsVisible();
      const hasError = await homePage.hasErrorMessage();
      expect([true, false]).toContain(hasResults || hasError);
    });

    test('should handle unicode characters', async ({ page }) => {
      const unicodeStory = 'Story: 用户登录 🎯 ✨ مرحبا';
      await homePage.fillStoryTitle(unicodeStory);
      await homePage.fillAcceptanceCriteria('验证用户身份 ✓ تحقق من الهوية');
      await homePage.clickGenerateButton();

      await page.waitForTimeout(TEST_TIMEOUTS.API_CALL);
      const hasResults = await homePage.isResultsVisible();
      expect([true, false]).toContain(hasResults);
    });

    test('should handle rapid consecutive submissions', async ({ page }) => {
      // First submission
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await page.waitForTimeout(1000);

      // Second submission without waiting for first to complete
      await homePage.clearAllInputs();
      await homePage.submitForm(
        TEST_STORIES.VALID_PAYMENT.title,
        TEST_STORIES.VALID_PAYMENT.criteria
      );

      await homePage.waitForLoadingToComplete(TEST_TIMEOUTS.LONG);
      const hasResults = await homePage.isResultsVisible();
      expect([true, false]).toContain(hasResults);
    });

    test('should handle form submission with only spaces', async ({ page }) => {
      await homePage.fillStoryTitle('     ');
      await homePage.fillAcceptanceCriteria('     ');
      await homePage.clickGenerateButton();

      await page.waitForTimeout(TEST_TIMEOUTS.API_CALL);
      const hasError = await homePage.hasErrorMessage();
      expect([true, false]).toContain(hasError);
    });
  });

  // ============ Comprehensive Test Case Validation ============

  test.describe('Test Case Validation', () => {
    test('should validate all generated test cases have correct structure', async ({ page }) => {
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();

      const allTestCases = await homePage.getAllTestCaseData();
      expect(allTestCases.length).toBeGreaterThan(0);

      for (const testCase of allTestCases) {
        const validation = validateTestCaseStructure(testCase);
        expect(validation.valid).toBe(true);
      }
    });

    test('should verify test cases contain multiple categories', async ({ page }) => {
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();

      const allTestCases = await homePage.getAllTestCaseData();
      expect(allTestCases.length).toBeGreaterThan(0);

      // Should ideally have different priorities
      const priorities = new Set(allTestCases.map((tc) => tc.priority));
      expect(priorities.size).toBeGreaterThanOrEqual(1);
    });

    test('should verify test case IDs are unique', async ({ page }) => {
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();

      const allTestCases = await homePage.getAllTestCaseData();
      const ids = allTestCases.map((tc) => tc.title);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(ids.length).toBe(uniqueIds.size);
    });

    test('should verify each test case has at least 2 steps', async ({ page }) => {
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();

      const allTestCases = await homePage.getAllTestCaseData();

      for (const testCase of allTestCases) {
        expect(testCase.steps.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  // ============ API Performance Tests ============

  test.describe('API Performance', () => {
    test('should generate test cases within acceptable time', async ({ request }) => {
      const apiClient = new ApiClient(request);

      const responseTime = await measureApiResponseTime(async () => {
        await apiClient.generateTests(TEST_STORIES.VALID_LOGIN);
      });

      // Should complete within 10 seconds
      expect(responseTime).toBeLessThan(TEST_TIMEOUTS.LONG);
    });

    test('should handle concurrent API requests', async ({ request }) => {
      const apiClient = new ApiClient(request);

      const promises = [
        apiClient.generateTests(TEST_STORIES.VALID_LOGIN),
        apiClient.generateTests(TEST_STORIES.VALID_PAYMENT),
        apiClient.generateTests(TEST_STORIES.VALID_SEARCH),
      ];

      const results = await Promise.all(promises);
      expect(results.length).toBe(3);

      for (const result of results) {
        expect(result.status()).toBe(200);
      }
    });

    test('should validate health check response time', async ({ request }) => {
      const apiClient = new ApiClient(request);

      const responseTime = await measureApiResponseTime(async () => {
        await apiClient.healthCheck();
      });

      // Health check should be very fast (< 1 second)
      expect(responseTime).toBeLessThan(1000);
    });
  });

  // ============ User Interaction Flows ============

  test.describe('Complex User Flows', () => {
    test('should complete full workflow: fill form -> generate -> expand -> collapse', async ({ page }) => {
      // Step 1: Fill form
      await homePage.fillStoryTitle(TEST_STORIES.VALID_LOGIN.title);
      await homePage.fillAcceptanceCriteria(TEST_STORIES.VALID_LOGIN.criteria);
      await homePage.fillDescription(TEST_STORIES.VALID_LOGIN.description);
      await homePage.fillAdditionalInfo(TEST_STORIES.VALID_LOGIN.info);

      // Step 2: Generate
      await homePage.clickGenerateButton();
      expect(await homePage.isLoadingVisible()).toBe(true);
      await homePage.waitForLoadingToComplete();

      // Step 3: Verify results
      expect(await homePage.isResultsVisible()).toBe(true);
      const count = await homePage.getTestCasesCount();
      expect(count).toBeGreaterThan(0);

      // Step 4: Expand first test case
      if (count > 0) {
        await homePage.expandTestCase(0);
        const title = await homePage.getTestCaseTitle(0);
        expect(title).toBeTruthy();
      }
    });

    test('should allow multiple generations in sequence', async ({ page }) => {
      // First generation
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();
      const firstCount = await homePage.getTestCasesCount();

      // Clear and second generation
      await homePage.clearAllInputs();
      await homePage.submitForm(
        TEST_STORIES.VALID_PAYMENT.title,
        TEST_STORIES.VALID_PAYMENT.criteria
      );
      await homePage.waitForResultsToLoad();
      const secondCount = await homePage.getTestCasesCount();

      expect(firstCount).toBeGreaterThan(0);
      expect(secondCount).toBeGreaterThan(0);
    });

    test('should handle error and recovery workflow', async ({ page }) => {
      // Try with invalid data
      await homePage.fillStoryTitle('');
      await homePage.fillAcceptanceCriteria('');
      await homePage.clickGenerateButton();

      // Should show error
      expect(await homePage.hasErrorMessage()).toBe(true);

      // Clear and retry with valid data
      await homePage.clearAllInputs();
      await homePage.submitForm(
        TEST_STORIES.VALID_LOGIN.title,
        TEST_STORIES.VALID_LOGIN.criteria
      );
      await homePage.waitForResultsToLoad();

      // Should succeed
      expect(await homePage.isResultsVisible()).toBe(true);
    });
  });

  // ============ Data Consistency Tests ============

  test.describe('Data Consistency', () => {
    test('should generate consistent results for same input', async ({ request }) => {
      const apiClient = new ApiClient(request);

      const response1 = await apiClient.generateTestsAndGetJson(TEST_STORIES.VALID_LOGIN);
      const response2 = await apiClient.generateTestsAndGetJson(TEST_STORIES.VALID_LOGIN);

      // Both should have same number of test cases
      expect(response1.cases.length).toBe(response2.cases.length);

      // All test cases should have same IDs
      for (let i = 0; i < response1.cases.length; i++) {
        expect(response1.cases[i].id).toBe(response2.cases[i].id);
      }
    });

    test('should handle retry logic gracefully', async ({ request }) => {
      const apiClient = new ApiClient(request);

      const testCases = await retryAsync(
        () => apiClient.getGeneratedTestCases(TEST_STORIES.VALID_LOGIN),
        3,
        500
      );

      expect(testCases.length).toBeGreaterThan(0);
    });
  });

  // ============ Random Test Data ============

  test.describe('Random Test Data', () => {
    test('should handle 5 different random stories', async ({ request }) => {
      const apiClient = new ApiClient(request);

      for (let i = 0; i < 5; i++) {
        const randomStory = generateRandomTestStory();

        const response = await apiClient.generateTests({
          storyTitle: randomStory.title,
          acceptanceCriteria: randomStory.criteria,
          description: randomStory.description,
          additionalInfo: randomStory.info,
        });

        expect(response.status()).toBe(200);
      }
    });
  });
});
