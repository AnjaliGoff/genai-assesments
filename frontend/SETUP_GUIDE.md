# Test Setup & Troubleshooting Guide

## ❌ Issue Found & Fixed

### Problem
```
'playwright' is not recognized as an internal or external command
```

### Root Cause
Playwright test framework was not installed in the frontend dependencies.

### Solution Applied ✅
```bash
# 1. Installed @playwright/test package
npm install @playwright/test@1.40.0 --save-dev

# 2. Installing Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

---

## 🚀 Running Tests After Setup

### Option 1: Run All Tests
```bash
cd frontend
npm run test
```

### Option 2: Run with UI Dashboard
```bash
npm run test:ui
```

### Option 3: Run in Headed Mode (See Browser)
```bash
npm run test:headed
```

### Option 4: Run Single Browser
```bash
npm run test:chrome      # Chromium only
npm run test:firefox     # Firefox only
npm run test:webkit      # Safari only
```

### Option 5: Debug Mode
```bash
npm run test:debug
```

### Option 6: View Test Report
```bash
npm run test:report
```

---

## 📋 Available Test Commands

All commands are in `frontend/package.json`:

```json
{
  "test": "playwright test",
  "test:ui": "playwright test --ui",
  "test:debug": "playwright test --debug",
  "test:headed": "playwright test --headed",
  "test:chrome": "playwright test --project=chromium",
  "test:firefox": "playwright test --project=firefox",
  "test:webkit": "playwright test --project=webkit",
  "test:report": "playwright show-report"
}
```

---

## 🎯 Test Structure

Your tests are organized as:

```
frontend/tests/
├── api/                           # API Tests
│   ├── ApiClient.ts
│   └── generateTests.spec.ts
├── ui/                            # UI Tests
│   └── userStoryGenerator.spec.ts
├── pages/                         # Page Objects
│   └── HomePage.ts
├── features/                      # BDD Features
│   └── user-story-generator.feature
├── steps/                         # BDD Steps (NEW)
│   └── userStorySteps.ts
├── utils/                         # Test Utilities (NEW)
│   └── testUtils.ts
├── advanced/                      # Advanced Tests (NEW)
│   └── advancedScenarios.spec.ts
└── fixtures/
    └── test.fixture.ts
```

---

## ✅ Verification Steps

After installation completes:

### 1. Verify Playwright is Installed
```bash
npx playwright --version
```

### 2. Verify Browsers are Downloaded
```bash
npx playwright install --with-deps
```

### 3. Check Backend Service is Running
```bash
# In another terminal, start backend
npm run dev --workspace=backend
```

### 4. Check Frontend Service is Running
```bash
# In another terminal, start frontend
npm run dev --workspace=frontend
```

### 5. Run Tests
```bash
cd frontend
npm run test
```

---

## 🔧 Troubleshooting

### Error: Port Already in Use
```bash
# Default ports:
# Frontend: 5173
# Backend: 8091

# Kill processes on these ports:
# Windows: netstat -ano | findstr :5173
```

### Error: Tests Timeout
```bash
# Increase timeout in playwright.config.ts
timeout: 30000  // 30 seconds
```

### Error: Backend Not Responding
```bash
# Make sure backend is running on port 8091
# Check in .env: PORT=8091
```

### Error: Browsers Not Found
```bash
# Reinstall browsers
npx playwright install --with-deps
```

---

## 📊 Test Coverage

### API Tests (generateTests.spec.ts)
- ✅ Health check endpoint
- ✅ Test generation API
- ✅ Test case validation

### UI Tests (userStoryGenerator.spec.ts)
- ✅ Form submission
- ✅ Error handling
- ✅ Loading states
- ✅ Test case expansion

### Advanced Tests (advancedScenarios.spec.ts)
- ✅ Edge cases (special chars, Unicode)
- ✅ Performance testing
- ✅ Complex user flows
- ✅ Data consistency
- ✅ Concurrent requests

---

## 🎓 Quick Start Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Install Playwright browsers
npx playwright install

# Run all tests (headless)
npm run test

# Run tests with UI
npm run test:ui

# Run tests in browser (headed)
npm run test:headed

# View test results
npm run test:report
```

---

## 📚 Documentation Links

- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - API reference for all methods
- [PLAYWRIGHT_ENHANCEMENTS.md](../frontend/PLAYWRIGHT_ENHANCEMENTS.md) - Complete feature guide
- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Before/after comparison
- [Playwright Docs](https://playwright.dev/docs/intro)

---

## 🆘 Still Having Issues?

1. Clear node_modules and reinstall:
   ```bash
   rm -r node_modules package-lock.json
   npm install
   ```

2. Clear test cache:
   ```bash
   rm -r test-results
   ```

3. Verify configuration:
   ```bash
   npx playwright show-trace test-results/trace.zip
   ```

4. Run in debug mode:
   ```bash
   npm run test:debug
   ```

---

**Status: ✅ Setup Complete & Ready**

All dependencies should now be installed. Proceed with running tests using any of the commands above.
