# Playwright TypeScript Test Suite for User Story to Tests Generator

## Overview

This test suite provides comprehensive testing coverage for the **User Story to Tests Generator** application using Playwright and TypeScript. The tests follow the **Page Object Model (POM)** pattern for maintainability and are organized by test type.

## Project Structure

```
frontend/tests/
├── api/
│   ├── ApiClient.ts              # API client for backend endpoints
│   └── generateTests.spec.ts     # API-level tests
├── pages/
│   └── HomePage.ts               # Page Object for main application
├── ui/
│   └── userStoryGenerator.spec.ts # UI-level tests
├── fixtures/
│   └── test.fixture.ts           # Playwright test fixtures
└── features/
    └── user-story-generator.feature # BDD Feature file
```

## Test Strategy

### 1. **Feature File** (`features/user-story-generator.feature`)
- Describes application features using Gherkin syntax
- Documents test scenarios for:
  - Generating test cases from user stories
  - Validating required fields
  - Loading states and error handling
  - Test case expansion/collapse
  - Download functionality
  - Health check endpoint

### 2. **Page Object Model** (`pages/HomePage.ts`)
- Encapsulates UI element locators
- Provides reusable methods for user interactions
- Methods include:
  - Form filling: `fillStoryTitle()`, `fillAcceptanceCriteria()`, etc.
  - Interaction: `clickGenerateButton()`, `expandTestCase()`
  - Assertion helpers: `isResultsVisible()`, `getTestCasesCount()`, etc.

### 3. **API Client** (`api/ApiClient.ts`)
- Handles API requests to backend endpoints
- Methods:
  - `healthCheck()` - Test health status
  - `generateTests(payload)` - Generate test cases
  - `generateTestsAndGetJson(payload)` - Generate and parse response

### 4. **UI Tests** (`ui/userStoryGenerator.spec.ts`)
- Tests user interactions:
  - Valid test case generation
  - Error validations
  - Loading states
  - Test case expansion/collapse
  - Download functionality
  - Form state maintenance

### 5. **API Tests** (`api/generateTests.spec.ts`)
- Tests backend endpoints:
  - Health check endpoint
  - Test case generation with valid/invalid payloads
  - Response validation and structure
  - Token tracking
  - Priority levels

## Installation

### 1. Install Playwright and dependencies

```bash
cd frontend
npm install
npx playwright install
```

### 2. Ensure both frontend and backend are running

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:8081
```

## Running Tests

### All Tests
```bash
npm test
```

### UI Tests Only
```bash
npm test -- tests/ui/
```

### API Tests Only
```bash
npm test -- tests/api/
```

### Specific Test File
```bash
npm test -- tests/ui/userStoryGenerator.spec.ts
```

### With UI Mode (Interactive)
```bash
npm run test:ui
```

### Debug Mode
```bash
npm run test:debug
```

### Headed Mode (See Browser)
```bash
npm run test:headed
```

### Browser-Specific
```bash
npm run test:chrome    # Chromium
npm run test:firefox   # Firefox
npm run test:webkit    # Safari
```

### View Test Report
```bash
npm run test:report
```

## Test Coverage

### UI Tests (~8 tests)
- ✅ Generate tests with valid user story
- ✅ Show error when required fields missing
- ✅ Display loading indicator
- ✅ Expand/collapse test cases
- ✅ Display complete test case information
- ✅ Handle forms with only required fields
- ✅ Maintain form state on error
- ✅ Show download buttons

### API Tests (~9 tests)
- ✅ Health check endpoint
- ✅ Generate tests with valid payload
- ✅ Return test cases with required fields
- ✅ Return model and token information
- ✅ Generate multiple test cases
- ✅ Handle minimal payload
- ✅ Include test case steps
- ✅ Prioritize test cases
- ✅ Response structure validation

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
// Runs tests on multiple browsers
- Chromium
- Firefox
- WebKit

// Mobile testing
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

// Reporting
- HTML report
- JSON report
- JUnit XML report
- Console list

// Screenshots and videos on failure
- Video: retain-on-failure
- Screenshot: only-on-failure
- Trace: on-first-retry
```

## Using Fixtures

The test suite provides custom fixtures for easy test setup:

```typescript
import { test, expect } from '../fixtures/test.fixture';

test('example test', async ({ homePage, apiClient }) => {
  // homePage is pre-initialized
  // apiClient is ready to use
  await homePage.goto();
});
```

## Page Object Methods

### HomePage Class

```typescript
// Navigation
await homePage.goto()

// Form Interaction
await homePage.fillStoryTitle(title)
await homePage.fillAcceptanceCriteria(criteria)
await homePage.fillDescription(description)
await homePage.fillAdditionalInfo(info)
await homePage.submitForm(title, criteria, description?, info?)

// Buttons
await homePage.clickGenerateButton()
await homePage.clickDownloadButton(index)

// Assertions
await homePage.isResultsVisible()
await homePage.isLoadingVisible()
await homePage.getTestCasesCount()
await homePage.getErrorMessage()

// Test Cases
await homePage.getTestCaseByIndex(index)
await homePage.expandTestCase(index)
await homePage.isTestCaseExpanded(index)

// Downloads
await homePage.getDownloadButtonCount()
```

## API Client Methods

```typescript
// Health Check
await apiClient.healthCheck()
await apiClient.getHealthCheckStatus()

// Generate Tests
await apiClient.generateTests(payload)
await apiClient.generateTestsAndGetJson(payload)
```

## Best Practices

1. **Use Page Object Model** - All UI interactions through page classes
2. **Meaningful Test Names** - Describe what is being tested
3. **Arrange-Act-Assert** - Follow AAA pattern in tests
4. **Wait Strategies** - Use proper waits (networkidle, waitForSelector)
5. **Error Handling** - Test both happy path and error scenarios
6. **Isolation** - Each test should be independent
7. **Fixtures** - Use test fixtures for common setup

## Debugging

### Generate Trace
```bash
npm test -- --trace on
```

### Step Through Tests
```bash
npm run test:debug
```

### View Videos of Failed Tests
Video files saved in `test-results/` directory

### Inspect Selectors
Use `npx playwright codegen` to generate selectors:
```bash
npx playwright codegen http://localhost:5173
```

## CI/CD Integration

For continuous integration, the configuration includes:

```typescript
retries: process.env.CI ? 2 : 0
workers: process.env.CI ? 1 : undefined
forbidOnly: !!process.env.CI
```

Example GitHub Actions:
```yaml
- name: Run Playwright tests
  run: npm test
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Updating Selectors

If UI elements change, update locators in `HomePage.ts`:

```typescript
this.storyTitleInput = page.locator('new-selector');
```

## Common Issues

### Tests Fail - Backend Not Running
**Solution:** Start backend server in separate terminal

### Tests Timeout
**Solution:** Increase timeout in playwright.config.ts or individual tests:
```typescript
test.setTimeout(30000);
```

### Selectors Not Found
**Solution:** Use `npx playwright inspector` to debug selectors

### Port Already in Use
**Solution:** Change port in config or kill process using port

## Contributing

When adding new tests:
1. Create page objects for new pages
2. Update feature file with new scenarios
3. Implement tests following AAA pattern
4. Run full suite before committing
5. Update this README with new test types

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
