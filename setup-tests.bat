@echo off
REM Playwright Test Setup Script for Windows

echo.
echo ========================================
echo Playwright TypeScript Test Setup
echo ========================================
echo.

REM Navigate to frontend directory
cd /d d:\anjali\work\user-story-to-tests\frontend

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [2/4] Installing Playwright test framework...
call npm install @playwright/test@1.40.0 --save-dev
if errorlevel 1 (
    echo ERROR: Playwright installation failed
    exit /b 1
)
echo ✓ Playwright installed

echo.
echo [3/4] Downloading Playwright browsers...
call npx playwright install chromium
call npx playwright install firefox
call npx playwright install webkit
if errorlevel 1 (
    echo ERROR: Browser installation failed
    exit /b 1
)
echo ✓ Browsers installed

echo.
echo [4/4] Verifying setup...
call npx playwright --version
echo.

echo ========================================
echo ✓ Setup Complete!
echo ========================================
echo.
echo Available test commands:
echo   npm run test              - Run all tests (headless)
echo   npm run test:ui           - Run tests with UI dashboard
echo   npm run test:headed       - Run tests in headed mode
echo   npm run test:debug        - Debug mode
echo   npm run test:chrome       - Chromium only
echo   npm run test:firefox      - Firefox only
echo   npm run test:webkit       - WebKit only
echo   npm run test:report       - View test report
echo.
echo Next steps:
echo   1. Start backend: npm run dev --workspace=backend
echo   2. Start frontend: npm run dev --workspace=frontend  
echo   3. Run tests: npm run test
echo.
pause
