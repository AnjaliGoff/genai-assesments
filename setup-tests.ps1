#!/usr/bin/env pwsh

# Playwright TypeScript Test Setup Script for PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Playwright TypeScript Test Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to frontend directory
Set-Location -Path "d:\anjali\work\user-story-to-tests\frontend"

# Step 1: Install frontend dependencies
Write-Host "[1/4] Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

Write-Host ""

# Step 2: Install Playwright
Write-Host "[2/4] Installing Playwright test framework..." -ForegroundColor Yellow
npm install @playwright/test@1.40.0 --save-dev
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Playwright installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Playwright installed" -ForegroundColor Green

Write-Host ""

# Step 3: Download Playwright browsers
Write-Host "[3/4] Downloading Playwright browsers (this may take 2-5 minutes)..." -ForegroundColor Yellow
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Browser installation failed" -ForegroundColor Red
    Write-Host "Tip: Try again with: npx playwright install --with-deps" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Browsers installed" -ForegroundColor Green

Write-Host ""

# Step 4: Verify setup
Write-Host "[4/4] Verifying setup..." -ForegroundColor Yellow
npx playwright --version
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Available test commands:" -ForegroundColor Cyan
Write-Host "  npm run test              - Run all tests (headless)" -ForegroundColor White
Write-Host "  npm run test:ui           - Run tests with UI dashboard" -ForegroundColor White
Write-Host "  npm run test:headed       - Run tests in headed mode" -ForegroundColor White
Write-Host "  npm run test:debug        - Debug mode" -ForegroundColor White
Write-Host "  npm run test:chrome       - Chromium only" -ForegroundColor White
Write-Host "  npm run test:firefox      - Firefox only" -ForegroundColor White
Write-Host "  npm run test:webkit       - WebKit only" -ForegroundColor White
Write-Host "  npm run test:report       - View test report" -ForegroundColor White
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open new terminal: npm run dev --workspace=backend" -ForegroundColor White
Write-Host "  2. Open new terminal: npm run dev --workspace=frontend" -ForegroundColor White
Write-Host "  3. From frontend dir: npm run test" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - SETUP_GUIDE.md" -ForegroundColor White
Write-Host "  - QUICK_REFERENCE.md" -ForegroundColor White
Write-Host "  - PLAYWRIGHT_ENHANCEMENTS.md" -ForegroundColor White
Write-Host ""
