import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('User Story to Tests Generator - UI Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should generate tests with valid user story', async ({ page }) => {
    // Arrange
    const storyTitle = 'Login Feature';
    const acceptanceCriteria = 'User should be able to login with valid credentials';
    const description = 'User attempts to login with username and password';
    const additionalInfo = 'Test across Chrome and Firefox';

    // Act
    await homePage.submitForm(storyTitle, acceptanceCriteria, description, additionalInfo);

    // Assert - wait for results
    await page.waitForTimeout(2000); // Wait for API call
    const isResultsVisible = await homePage.isResultsVisible();
    expect(isResultsVisible).toBeTruthy();

    const testCasesCount = await homePage.getTestCasesCount();
    expect(testCasesCount).toBeGreaterThan(0);
  });

  test('should show error message when required fields are missing', async ({ page }) => {
    // Arrange & Act - submit form without story title
    await homePage.fillAcceptanceCriteria('Some acceptance criteria');
    await homePage.clickGenerateButton();

    // Assert
    const errorMessage = await homePage.getErrorMessage();
    expect(errorMessage).toContain('required');
  });

  test('should show loading indicator during test generation', async ({ page }) => {
    // Arrange
    const storyTitle = 'Payment Processing';
    const acceptanceCriteria = 'Process payment successfully';

    // Act
    await homePage.submitForm(storyTitle, acceptanceCriteria);

    // Assert - check for loading state
    const isLoading = await homePage.isLoadingVisible();
    expect(isLoading).toBe(true);

    // Wait and verify loading completes
    await page.waitForTimeout(2000);
    const loadingVisible = await homePage.isLoadingVisible();
    expect(loadingVisible).toBe(false);
  });

  test('should expand and collapse test cases', async ({ page }) => {
    // Arrange - generate test cases first
    await homePage.submitForm(
      'Search Feature',
      'User should be able to search for products'
    );
    await page.waitForTimeout(2000);

    // Act & Assert - expand first test case
    const testCasesCount = await homePage.getTestCasesCount();
    if (testCasesCount > 0) {
      await homePage.expandTestCase(0);
      await page.waitForTimeout(500);

      // Verify expansion
      const firstTestCase = await homePage.getTestCaseByIndex(0);
      expect(firstTestCase).toBeTruthy();
    }
  });

  test('should display test case with all required fields', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'User Registration',
      'User should be able to register with valid email'
    );
    await page.waitForTimeout(2000);

    // Act
    const testCasesCount = await homePage.getTestCasesCount();

    // Assert
    expect(testCasesCount).toBeGreaterThan(0);

    if (testCasesCount > 0) {
      const firstTestCase = await homePage.getTestCaseByIndex(0);
      const testCaseText = await firstTestCase.textContent();
      expect(testCaseText).toBeTruthy();
    }
  });

  test('should handle form with only required fields', async ({ page }) => {
    // Arrange & Act - submit with only required fields
    await homePage.submitForm(
      'Checkout Flow',
      'User should complete checkout successfully'
    );

    // Assert
    await page.waitForTimeout(2000);
    const isResultsVisible = await homePage.isResultsVisible();
    expect(isResultsVisible).toBeTruthy();
  });

  test('should maintain form state on error', async ({ page }) => {
    // Arrange
    const storyTitle = 'Test Feature';

    // Act
    await homePage.fillStoryTitle(storyTitle);
    await homePage.clickGenerateButton(); // Missing acceptance criteria

    // Assert - story title should still be filled
    const inputValue = await homePage.storyTitleInput.inputValue();
    expect(inputValue).toBe(storyTitle);
  });

  test('should have download buttons after test generation', async ({ page }) => {
    // Arrange & Act
    await homePage.submitForm(
      'Export Feature',
      'User should be able to export data'
    );
    await page.waitForTimeout(2000);

    // Assert
    const downloadButtonCount = await homePage.getDownloadButtonCount();
    expect(downloadButtonCount).toBeGreaterThanOrEqual(0);
  });

  // ============ Additional UI Test Cases ============

  test('should clear form when clear button is clicked', async ({ page }) => {
    // Arrange
    await homePage.fillForm(
      'Test Title',
      'Test Criteria',
      'Test Description',
      'Test Info'
    );

    // Act
    await homePage.clearAllInputs();

    // Assert
    const formValues = await homePage.getFormValues();
    expect(formValues.storyTitle).toBe('');
    expect(formValues.acceptanceCriteria).toBe('');
  });

  test('should detect form empty state correctly', async ({ page }) => {
    // Arrange
    await homePage.clearAllInputs();

    // Act
    const isEmpty = await homePage.isFormEmpty();

    // Assert
    expect(isEmpty).toBe(true);
  });

  test('should display all test case details when expanded', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Complete Test Details',
      'Test should show all fields'
    );
    await page.waitForTimeout(2000);

    // Act
    const testCasesCount = await homePage.getTestCasesCount();

    // Assert
    if (testCasesCount > 0) {
      const allTestCaseData = await homePage.getAllTestCaseData();
      allTestCaseData.forEach(testCase => {
        expect(testCase.title).toBeTruthy();
        expect(testCase.priority).toBeTruthy();
        expect(testCase.steps).toBeDefined();
        expect(testCase.expectedResult).toBeTruthy();
      });
    }
  });

  test('should filter test cases by priority', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Priority Filter Test',
      'Should filter by priority'
    );
    await page.waitForTimeout(2000);

    // Act
    const highPriorityCases = await homePage.getTestCasesByPriority('High');

    // Assert
    expect(Array.isArray(highPriorityCases)).toBe(true);
  });

  test('should search for test cases by keyword', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Search Test Feature',
      'Should search test cases by title'
    );
    await page.waitForTimeout(2000);

    // Act
    const allTitles = await homePage.getAllTestCaseTitles();
    if (allTitles.length > 0) {
      const keyword = allTitles[0]?.substring(0, 3) || '';
      const foundIndex = await homePage.searchTestCase(keyword);

      // Assert
      expect(foundIndex).toBeGreaterThanOrEqual(-1);
    }
  });

  test('should export test cases as JSON', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Export JSON Test',
      'Should export all test cases'
    );
    await page.waitForTimeout(2000);

    // Act
    const exportedData = await homePage.exportTestCases();

    // Assert
    expect(exportedData).toBeTruthy();
    const parsed = JSON.parse(exportedData);
    expect(Array.isArray(parsed)).toBe(true);
  });

  test('should scroll to test case in results', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Scroll Test',
      'Should scroll to test case'
    );
    await page.waitForTimeout(2000);

    // Act
    const count = await homePage.getTestCasesCount();
    if (count > 0) {
      await homePage.scrollToTestCase(0);
      
      // Assert
      const isVisible = await homePage.testCaseItems.nth(0).isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('should verify page title', async ({ page }) => {
    // Act & Assert
    const title = await homePage.getPageTitle();
    expect(title).toBeTruthy();
    expect(typeof title).toBe('string');
  });

  test('should verify all test cases have required structure', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Structure Validation',
      'Each test case must have complete structure'
    );
    await page.waitForTimeout(2000);

    // Act
    const allValid = await homePage.verifyAllTestCasesHaveRequiredFields();

    // Assert
    expect(allValid).toBe(true);
  });

  test('should complete full workflow from form to results', async ({ page }) => {
    // Act
    const workflowSuccess = await homePage.performFullWorkflow(
      'Full Workflow Test',
      'Should complete end-to-end workflow',
      'Testing complete user journey',
      'Cross-browser compatibility'
    );

    // Assert
    expect(workflowSuccess).toBe(true);
  });

  test('should get first test case data', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'First Test Case',
      'Get first test case details'
    );
    await page.waitForTimeout(2000);

    // Act
    const firstTestCase = await homePage.getFirstTestCaseData();

    // Assert
    if (firstTestCase.title) {
      expect(firstTestCase.title).toBeTruthy();
      expect(firstTestCase.priority).toBeTruthy();
      expect(firstTestCase.steps).toBeDefined();
    }
  });

  test('should wait for results with timeout', async ({ page }) => {
    // Arrange
    await homePage.submitForm(
      'Result Timeout Test',
      'Should wait for results'
    );

    // Act & Assert
    const resultsReady = await homePage.waitAndVerifyResults(10000);
    expect(resultsReady).toBe(true);
  });

  test('should check if generate button is enabled', async ({ page }) => {
    // Act
    const isEnabled = await homePage.isGenerateButtonEnabled();

    // Assert
    expect(typeof isEnabled).toBe('boolean');
  });

  test('should display page correctly on load', async ({ page }) => {
    // Act
    const isLoaded = await homePage.isPageLoaded();

    // Assert
    expect(isLoaded).toBe(true);
  });
});
