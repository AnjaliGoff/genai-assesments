# 🚀 CI/CD Setup & GitHub Actions Guide

**Date:** April 18, 2026  
**Framework:** Playwright TypeScript + GitHub Actions

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GitHub Secrets Configuration](#github-secrets-configuration)
3. [Workflow Descriptions](#workflow-descriptions)
4. [Setting Up GitHub Secrets](#setting-up-github-secrets)
5. [Monitoring Runs](#monitoring-runs)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

Your project now has **3 GitHub Actions workflows** for comprehensive CI/CD:

### **Workflows Included:**

1. **📊 Playwright Tests CI/CD** (`playwright-tests.yml`)
   - Runs on: Push to main/develop, PR to main/develop, Daily schedule (2 AM UTC)
   - Tests run on: Chromium, Firefox, WebKit
   - Tests executed: API, UI, Advanced scenarios
   - Reports: HTML, JSON, JUnit
   - Notifications: Slack integration

2. **✅ Code Quality & TypeScript** (`code-quality.yml`)
   - TypeScript compilation check
   - ESLint code review
   - Dependency security audit
   - Build verification

3. **📈 Test Reports & Artifacts** (`test-reports.yml`)
   - Aggregates test results
   - Generates HTML summary
   - Stores artifacts for 30 days

---

## 🔐 GitHub Secrets Configuration

### **Required Secrets:**

The following secrets must be added to your GitHub repository:

#### **LLM Configuration (Groq)**
```
🔑 GROQ_API_BASE
   Value: https://api.groq.com/openai/v1
   Description: Groq API base URL

🔑 GROQ_API_KEY
   Value: gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Description: Your Groq API key
   
🔑 GROQ_MODEL
   Value: meta-llama/llama-4-scout-17b-16e-instruct
   Description: Model name to use for test generation
```

#### **Jira Configuration**
```
🔑 JIRA_HOST
   Value: https://yourcompany.atlassian.net/
   Description: Your Jira instance URL
   
🔑 JIRA_EMAIL
   Value: your-email@company.com
   Description: Jira account email
   
🔑 JIRA_API_TOKEN
   Value: ATATT3xFfGF0AjYRw9tl9Ju_LNhjM3WP...
   Description: Jira API token (generate from Jira)
```

#### **Notification Configuration**
```
🔑 SLACK_WEBHOOK_URL (Optional)
   Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   Description: Slack webhook for notifications
```

---

## 📝 Setting Up GitHub Secrets

### **Step 1: Navigate to Repository Settings**

1. Go to your GitHub repository
2. Click **⚙️ Settings**
3. Click **🔐 Secrets and variables → Actions** (left sidebar)

### **Step 2: Create New Repository Secret**

1. Click **New repository secret**
2. **Name:** `GROQ_API_KEY`
3. **Value:** Paste your Groq API key
4. Click **Add secret**

### **Step 3: Repeat for All Secrets**

Add the following secrets in this order:

| Secret Name | Source |
|-------------|--------|
| `GROQ_API_BASE` | https://api.groq.com/openai/v1 |
| `GROQ_API_KEY` | From Groq console |
| `GROQ_MODEL` | meta-llama/llama-4-scout-17b-16e-instruct |
| `JIRA_HOST` | Your Jira URL |
| `JIRA_EMAIL` | Your Jira email |
| `JIRA_API_TOKEN` | From Jira API tokens |
| `SLACK_WEBHOOK_URL` | From Slack (optional) |

---

## 🔄 Workflow Descriptions

### **1. Playwright Tests CI/CD**

**Triggers:**
- Every push to `main`, `develop`, or `feature/*` branches
- Every pull request to `main` or `develop`
- Daily at 2:00 AM UTC (scheduled)

**What It Does:**
```
1. Checks out code
2. Sets up Node.js environment
3. Installs dependencies
4. Creates .env file from GitHub Secrets
5. Starts backend server
6. Runs API tests (Chromium, Firefox, WebKit)
7. Runs UI tests
8. Runs advanced tests
9. Uploads test reports
10. Publishes results
11. Posts results to Slack
```

**Matrix Strategy:**
- Tests run on 3 browsers in parallel
- Speeds up execution time
- Comprehensive cross-browser validation

**Artifacts Generated:**
- `playwright-report-[browser].html`
- `test-results-json-[browser].json`
- `junit.xml` (for CI integrations)

---

### **2. Code Quality & TypeScript**

**Triggers:**
- Every push to `main`, `develop`, or `feature/*`
- Every pull request to `main` or `develop`

**What It Does:**
```
1. TypeScript compilation check
2. ESLint code review
3. Dependency security audit
4. Build verification
```

**Key Checks:**
- ✅ TypeScript types validation
- ✅ Code quality rules
- ✅ Security vulnerabilities
- ✅ Build success

---

### **3. Test Reports & Artifacts**

**Triggers:**
- When Playwright Tests workflow completes

**What It Does:**
```
1. Downloads all test artifacts
2. Generates HTML summary report
3. Stores artifacts for 30 days
4. Comments on PRs
```

---

## 📊 Monitoring Runs

### **View Workflow Status**

1. Go to your repository
2. Click **Actions** tab
3. See all workflows and their status

### **Check Individual Run**

1. Click on workflow run
2. View logs for each job
3. Download artifacts
4. See detailed timing

### **View Test Reports**

1. In workflow run, click **Artifacts**
2. Download `playwright-report-[browser].zip`
3. Extract and open `index.html` in browser

---

## 🐛 Troubleshooting

### **Workflow Failed: "Missing Secrets"**

**Solution:** Add all required secrets to your repository
```
Settings → Secrets and variables → Actions → New secret
```

### **Tests Timeout**

**Issue:** Backend or frontend server takes too long to start

**Solution:** 
- Increase timeout in `playwright.config.ts`
- Check server startup logs in workflow
- Verify backend runs correctly locally

### **Environment Variables Not Loading**

**Issue:** Tests fail with "undefined" errors

**Solution:**
- Verify secrets are added to GitHub
- Check secret names match exactly (case-sensitive)
- Verify `.env` file is created correctly in workflow

### **Slack Notifications Not Working**

**Issue:** Slack posts not appearing

**Solution:**
- Verify `SLACK_WEBHOOK_URL` is correct
- Check webhook is active in Slack
- Add your Slack workspace to allowed notifications

### **Tests Pass Locally But Fail in CI**

**Possible Issues:**
- Environment differences (Node version, OS)
- Missing dependencies
- Hardcoded paths
- Timezone issues

**Solutions:**
- Use exact same node version locally
- Install dependencies fresh: `npm ci`
- Use relative paths
- Use UTC timezone in tests

---

## ✅ Best Practices

### **1. Keep Secrets Secure**
- Never commit `.env` files
- Rotate API tokens regularly
- Use separate tokens for CI/CD vs local
- Monitor secret usage

### **2. Optimize Workflow Performance**
- Use matrix strategy for parallel execution
- Cache dependencies: `cache: 'npm'`
- Set reasonable timeouts
- Mark flaky tests as `continue-on-error: true`

### **3. Test Organization**
- Group related tests
- Use meaningful test names
- Organize by feature/area
- Keep tests independent

### **4. Monitoring & Alerts**
- Watch workflow failures
- Review test reports regularly
- Set up branch protection rules
- Require status checks passing

### **5. Maintenance**
- Keep dependencies updated
- Review and update workflows quarterly
- Clean up old artifacts
- Monitor action versions

---

## 🔗 Useful Links

**Documentation:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI/CD Guide](https://playwright.dev/docs/ci)
- [GitHub Secrets Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

**Related Files:**
- `.github/workflows/playwright-tests.yml`
- `.github/workflows/code-quality.yml`
- `.github/workflows/test-reports.yml`
- `playwright.config.ts`

---

## 📋 Quick Reference: Adding a Secret

```bash
# Via GitHub CLI
gh secret set GROQ_API_KEY --body "your-api-key"

# Via GUI
1. Settings → Secrets and variables → Actions
2. New repository secret
3. Name: GROQ_API_KEY
4. Value: your-api-key
5. Add secret
```

---

## 🎯 Success Indicators

When everything is working:

✅ Workflows show green checkmark  
✅ Tests run on all 3 browsers  
✅ Reports generated and accessible  
✅ Slack notifications received  
✅ PR checks block merging if tests fail  
✅ Artifacts stored for review  

---

## 📞 Support

For issues:
1. Check workflow logs in Actions tab
2. Review error messages
3. Verify secrets are configured
4. Test locally first
5. Open repository issue with logs

---

**Status: CI/CD Ready** ✅

Your repository now has enterprise-grade CI/CD automation!

Generated: April 18, 2026
