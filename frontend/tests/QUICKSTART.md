# Quick Start Guide - Playwright Test Execution

## One-Time Setup

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Run Applications

**Terminal 1 - Start Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
✓ Frontend runs at `http://localhost:5173`

**Terminal 2 - Start Backend Dev Server:**
```bash
cd backend
npm run dev
```
✓ Backend runs at `http://localhost:8081`

## Run Tests

From the `frontend` directory:

### Quick Test Run (All Tests)
```bash
npm test
```

### Interactive Test Explorer (Recommended for Development)
```bash
npm run test:ui
```
- See tests run in real-time
- Filter by test name
- Re-run individual tests
- View test source code

### Watch Mode with Browser Visible
```bash
npm run test:headed
```

### Debug Mode (Step Through Tests)
```bash
npm run test:debug
```

### Specific Test File
```bash
npm test -- tests/ui/userStoryGenerator.spec.ts
npm test -- tests/api/generateTests.spec.ts
```

### Specific Browser
```bash
npm run test:chrome
npm run test:firefox
npm run test:webkit
```

### View Failed Test Report
```bash
npm run test:report
```

## Test Files Overview

### UI Tests (`tests/ui/userStoryGenerator.spec.ts`)
Tests the web interface:
- Form submission
- Error handling
- Loading states
- Test case display
- Download functionality

**Run:** `npm test -- tests/ui/`

### API Tests (`tests/api/generateTests.spec.ts`)
Tests backend endpoints:
- Health check
- Test case generation
- Response validation
- Token tracking

**Run:** `npm test -- tests/api/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail with connection error | Ensure both frontend and backend servers are running |
| Timeout errors | Test servers might be slow; increase timeout in playwright.config.ts |
| Selectors not found | Use `npm run test:ui` to see what's happening |
| Port already in use | Kill process or change port in config |
| Browser downloads fail | Run `npx playwright install` again |

## Key Commands Reference

```bash
# Testing
npm test                      # Run all tests
npm run test:ui              # Interactive UI
npm run test:debug           # Step through tests
npm run test:headed          # See browser
npm run test:report          # View HTML report

# Specific runs
npm run test:chrome          # Only Chromium
npm run test:firefox         # Only Firefox
npm run test:webkit          # Only Safari

# Code generation
npx playwright codegen http://localhost:5173  # Generate selectors
```

## Test Results

After running tests, view results:

```bash
# Open HTML report in browser
npm run test:report

# Or manually open
→ frontend/playwright-report/index.html
```

## Report Contents

- ✅ Passed tests
- ❌ Failed tests with screenshots
- 📹 Videos of failed tests
- 📊 Test duration statistics
- 🔍 Detailed error messages

## Example Test Video Locations

When a test fails, you'll find:
- **Screenshots:** `test-results/**/test-failed-1.png`
- **Videos:** `test-results/**/video.webm`
- **Report:** `playwright-report/index.html`

## Next Steps

1. ✅ Start servers
2. ✅ Run `npm test` or `npm run test:ui`
3. ✅ Check report with `npm run test:report`
4. ✅ Debug failures using video/screenshots
5. ✅ Update selectors in `pages/HomePage.ts` if needed

Happy Testing! 🚀
