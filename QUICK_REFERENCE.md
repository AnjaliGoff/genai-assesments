# Playwright TypeScript - Quick Reference Guide

## 🚀 Quick Start

### Import What You Need
```typescript
// Page Object
import { HomePage } from '../pages/HomePage';

// API Client
import { ApiClient } from '../api/ApiClient';

// Utilities & Constants
import { 
  TEST_STORIES, 
  TEST_TIMEOUTS, 
  validateTestCaseStructure,
  retryAsync 
} from '../utils/testUtils';

// BDD Steps
import { UserStorySteps } from '../steps/userStorySteps';
```

---

## 📄 **Page Object Methods**

### Filling Inputs
```typescript
// Single field
await homePage.fillStoryTitle('My Story');
await homePage.fillAcceptanceCriteria('My Criteria');
await homePage.fillDescription('Description');
await homePage.fillAdditionalInfo('Extra Info');

// Multiple fields
await homePage.fillForm(title, criteria, description, info);

// Complete workflow
await homePage.submitForm(title, criteria, description, info);
```

### Clicking & Interactions
```typescript
await homePage.clickGenerateButton();
await homePage.expandTestCase(0);
await homePage.clearAllInputs();
```

### Assertions & Checks
```typescript
const isVisible = await homePage.isResultsVisible();
const isLoading = await homePage.isLoadingVisible();
const hasError = await homePage.hasErrorMessage();
const isEmpty = await homePage.isFormEmpty();
const isEnabled = await homePage.isGenerateButtonEnabled();
```

### Waiting
```typescript
await homePage.waitForResultsToLoad();
await homePage.waitForLoadingToComplete();
```

### Data Extraction
```typescript
const count = await homePage.getTestCasesCount();
const title = await homePage.getTestCaseTitle(0);
const priority = await homePage.getTestCasePriority(0);
const steps = await homePage.getTestCaseSteps(0);
const expected = await homePage.getTestCaseExpectedResult(0);
const allData = await homePage.getAllTestCaseData();
```

### File Operations
```typescript
const download = await homePage.downloadTestCases('json');
await homePage.takeScreenshot('test-name');
```

---

## 📡 **API Client Methods**

### Health & Status
```typescript
const response = await apiClient.healthCheck();
const status = await apiClient.getHealthCheckStatus();
```

### Test Generation
```typescript
// Basic
const response = await apiClient.generateTests(payload);

// With response parsing
const testCases = await apiClient.getGeneratedTestCases(payload);
const count = await apiClient.getTestCaseCount(payload);

// Filtering
const positive = await apiClient.getTestCasesByCategory(payload, 'Positive');
const highPriority = await apiClient.getHighPriorityTestCases(payload);
```

### Jira Integration
```typescript
// Connection
await apiClient.jiraHealthCheck();
const status = await apiClient.getJiraConnectionStatus();

// Fetching
const stories = await apiClient.getJiraStoryList('PROJECT');
const issue = await apiClient.getJiraIssueData('PROJ-123');

// Generating
await apiClient.generateAndUpdateJira('PROJ-123');
await apiClient.batchGenerateForProject('PROJ', 10);

// Status
await apiClient.updateJiraIssueStatus('PROJ-123', 'PASSED');
```

### Validation
```typescript
const isOk = await apiClient.isResponseSuccessful(response);
const isValid = await apiClient.validateTestCaseStructure(testCase);
const validation = await apiClient.validateAllTestCases(payload);
```

---

## 🎯 **Test Data**

### Pre-defined Stories
```typescript
import { TEST_STORIES } from '../utils/testUtils';

// Valid examples
TEST_STORIES.VALID_LOGIN        // Login scenario
TEST_STORIES.VALID_PAYMENT      // Payment scenario
TEST_STORIES.VALID_SEARCH       // Search scenario

// Invalid examples
TEST_STORIES.MISSING_TITLE      // Empty title
TEST_STORIES.MISSING_CRITERIA   // Empty criteria
```

### Timeouts
```typescript
import { TEST_TIMEOUTS } from '../utils/testUtils';

TEST_TIMEOUTS.SHORT       // 2000ms
TEST_TIMEOUTS.MEDIUM      // 5000ms
TEST_TIMEOUTS.LONG        // 10000ms
TEST_TIMEOUTS.API_CALL    // 5000ms
TEST_TIMEOUTS.PAGE_LOAD   // 5000ms
```

### Messages
```typescript
import { TEST_MESSAGES } from '../utils/testUtils';

TEST_MESSAGES.REQUIRED_FIELDS_ERROR   // "Story Title and Acceptance Criteria are required"
TEST_MESSAGES.GENERATION_SUCCESS      // "Test cases generated successfully"
TEST_MESSAGES.INVALID_PAYLOAD         // "Invalid payload"
TEST_MESSAGES.SERVER_ERROR            // "Internal server error"
```

---

## 🛠️ **Utility Functions**

### Page Management
```typescript
import { 
  waitForPageReady, 
  verifyPageTitle, 
  isElementVisible, 
  getElementText 
} from '../utils/testUtils';

await waitForPageReady(page);
await verifyPageTitle(page, 'Expected Title');
const visible = await isElementVisible(page, '.selector');
const text = await getElementText(page, '.selector');
```

### Input/Form Operations
```typescript
import { fillInputValue, clickWithRetry } from '../utils/testUtils';

await fillInputValue(page, 'input#title', 'Story Title');
await clickWithRetry(page, 'button.generate');
```

### Validation
```typescript
import { validateTestCaseStructure, compareTestCases } from '../utils/testUtils';

const validation = validateTestCaseStructure(testCase);
if (!validation.valid) {
  console.log('Errors:', validation.errors);
}

const isSame = compareTestCases(tc1, tc2);
```

### Performance
```typescript
import { measureApiResponseTime } from '../utils/testUtils';

const responseTime = await measureApiResponseTime(async () => {
  await apiClient.generateTests(payload);
});
console.log(`Response time: ${responseTime}ms`);
```

### Retry Logic
```typescript
import { retryAsync } from '../utils/testUtils';

const testCases = await retryAsync(
  () => apiClient.getGeneratedTestCases(payload),
  3,        // maxRetries
  500       // delayMs
);
```

### Random Data
```typescript
import { generateRandomTestStory } from '../utils/testUtils';

const randomStory = generateRandomTestStory();
// Returns: { title, criteria, description, info }
```

---

## 📝 **Common Test Patterns**

### Pattern 1: Simple Form Test
```typescript
test('should fill and submit form', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  
  await homePage.submitForm('Title', 'Criteria');
  await homePage.waitForResultsToLoad();
  
  expect(await homePage.isResultsVisible()).toBe(true);
});
```

### Pattern 2: Error Validation
```typescript
test('should show error for missing fields', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  
  await homePage.clickGenerateButton();
  
  expect(await homePage.hasErrorMessage()).toBe(true);
});
```

### Pattern 3: API Test
```typescript
test('should generate test cases', async ({ request }) => {
  const apiClient = new ApiClient(request);
  
  const testCases = await apiClient.getGeneratedTestCases(TEST_STORIES.VALID_LOGIN);
  
  expect(testCases.length).toBeGreaterThan(0);
  for (const tc of testCases) {
    const validation = validateTestCaseStructure(tc);
    expect(validation.valid).toBe(true);
  }
});
```

### Pattern 4: BDD Steps
```typescript
test('should complete full workflow', async ({ page }) => {
  const steps = new UserStorySteps(page);
  
  await steps.givenUserNavigatesToTheApplication();
  await steps.andTheApplicationIsFullyLoaded();
  await steps.whenUserEntersAStoryTitle('Login Feature');
  await steps.andUserEntersAcceptanceCriteria('User can login');
  await steps.andUserClicksTheGenerateTestsButton();
  await steps.thenTestCasesShouldBeGeneratedSuccessfully();
});
```

### Pattern 5: Performance Test
```typescript
test('should complete within acceptable time', async ({ request }) => {
  const apiClient = new ApiClient(request);
  
  const responseTime = await measureApiResponseTime(async () => {
    await apiClient.generateTests(TEST_STORIES.VALID_LOGIN);
  });
  
  expect(responseTime).toBeLessThan(TEST_TIMEOUTS.LONG);
});
```

---

## 🔍 **Debugging Tips**

### Enable Debug Mode
```bash
npx playwright test --debug
```

### Run in Headed Mode
```bash
npx playwright test --headed
```

### Console Logging
```typescript
import { captureConsoleLogs } from '../utils/testUtils';

const logs = await captureConsoleLogs(page);
console.log('Console logs:', logs);
```

### Check for Errors
```typescript
import { checkForConsoleErrors } from '../utils/testUtils';

const errors = await checkForConsoleErrors(page);
if (errors.length > 0) {
  console.error('Console errors found:', errors);
}
```

### Take Screenshots
```typescript
import { takeScreenshotWithTimestamp } from '../utils/testUtils';

const path = await takeScreenshotWithTimestamp(page, 'my-test');
console.log('Screenshot saved to:', path);
```

### Extract DOM Content
```typescript
import { extractTestCasesFromDOM } from '../utils/testUtils';

const testCases = await extractTestCasesFromDOM(page);
console.log('Test cases from DOM:', testCases);
```

---

## 📊 **Test File Organization**

### Fixtures (test.fixture.ts)
```typescript
import { test } from '../fixtures/test.fixture';

test('my test', async ({ homePage, apiClient }) => {
  // Both homePage and apiClient are auto-initialized
});
```

### Using in Tests
```typescript
test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page);
  await homePage.goto();
});

test('example', async ({ page }) => {
  // Your test code
});
```

---

## 🚦 **Running Tests**

### Basic Commands
```bash
# All tests
npm run test

# Specific file
npx playwright test frontend/tests/advanced/

# Specific test
npx playwright test -g "should fill and submit form"

# Watch mode
npx playwright test --watch
```

### With Options
```bash
# Headed (see browser)
npx playwright test --headed

# Single browser
npx playwright test --project=chromium

# Slow mode
npx playwright test --slow-mo=500

# Show traces
npx playwright test --trace=on
```

---

## 📌 **Key Reminders**

✅ Always use Page Object Model for UI interactions
✅ Use ApiClient for all API calls
✅ Leverage TEST_STORIES for consistency
✅ Use retryAsync for flaky operations
✅ Validate structure with validateTestCaseStructure()
✅ Use appropriate timeouts
✅ Take screenshots for debugging
✅ Handle errors gracefully

---

## 🎓 **Learning Resources**

- [Full Enhancement Guide](PLAYWRIGHT_ENHANCEMENTS.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [HomePage.ts](frontend/tests/pages/HomePage.ts)
- [ApiClient.ts](frontend/tests/api/ApiClient.ts)
- [testUtils.ts](frontend/tests/utils/testUtils.ts)
- [Advanced Scenarios](frontend/tests/advanced/advancedScenarios.spec.ts)

---

**Status: ✅ PRODUCTION READY**

All methods are tested and documented. Happy testing! 🎉
