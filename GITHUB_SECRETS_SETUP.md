# GitHub Secrets Setup Template

This file shows you what secrets need to be added to your GitHub repository.

## ⚠️ IMPORTANT

**DO NOT commit this file with real secrets!**
This is just a template showing structure. Use GitHub UI to add secrets.

---

## Step-by-Step Setup

### 1. Open GitHub Repository Settings

```
Go to: https://github.com/YOUR_USERNAME/user-story-to-tests/settings/secrets/actions
```

### 2. Add Each Secret

Click "New repository secret" and add the following:

---

## Required Secrets

### **GROQ_API Configuration**

**Secret Name:** `GROQ_API_BASE`
```
Value: https://api.groq.com/openai/v1
Description: Groq API base URL
```

**Secret Name:** `GROQ_API_KEY`
```
Value: [Your Groq API key - get it from https://console.groq.com/keys]
Description: Your Groq API key
```

**Secret Name:** `GROQ_MODEL`
```
Value: meta-llama/llama-4-scout-17b-16e-instruct
Description: Model name to use for test generation
```

---

### **Jira Configuration**

**Secret Name:** `JIRA_HOST`
```
Value: [Your Jira instance URL - e.g., https://yourcompany.atlassian.net/]
Description: Your Jira instance URL
```

**Secret Name:** `JIRA_EMAIL`
```
Value: [Your Jira account email]
Description: Your Jira account email
```

**Secret Name:** `JIRA_API_TOKEN`
```
Value: [Your Jira API token - generate from https://id.atlassian.com/manage-profile/security/api-tokens]
Description: Jira API token
```

---

### **Slack Configuration (Optional)**

**Secret Name:** `SLACK_WEBHOOK_URL`
```
Value: https://hooks.slack.com/services/T0000000/B0000000/XXXXXXXXXXXXXXXXXXXX
Description: Slack webhook URL for test notifications
```

**How to get Slack Webhook:**
1. Go to https://api.slack.com/messaging/webhooks
2. Create a new webhook
3. Copy the webhook URL
4. Add as secret

---

## Using GitHub CLI (Alternative Method)

If you have GitHub CLI installed:

```bash
# Login to GitHub
gh auth login

# Add secrets
gh secret set GROQ_API_BASE --body "https://api.groq.com/openai/v1"
gh secret set GROQ_API_KEY --body "gsk_xxxxxxxxxxxxxxxxxxxx"
gh secret set GROQ_MODEL --body "meta-llama/llama-4-scout-17b-16e-instruct"
gh secret set JIRA_HOST --body "https://yourcompany.atlassian.net/"
gh secret set JIRA_EMAIL --body "your-email@company.com"
gh secret set JIRA_API_TOKEN --body "ATATT3xFfGF0AjYRw9tl..."
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/..."
```

---

## Verification

After adding all secrets, verify they're accessible:

```bash
gh secret list
```

Expected output:
```
GROQ_API_BASE
GROQ_API_KEY
GROQ_MODEL
JIRA_HOST
JIRA_EMAIL
JIRA_API_TOKEN
SLACK_WEBHOOK_URL
```

---

## Testing Secrets

Push a test commit to trigger workflows:

```bash
git commit --allow-empty -m "test: trigger CI with secrets"
git push
```

Check the Actions tab to see if workflows run successfully.

---

## Security Best Practices

✅ **DO:**
- Rotate API keys periodically
- Use separate tokens for CI/CD vs local development
- Restrict token permissions in source system
- Monitor secret access logs
- Update secrets when changing systems

❌ **DON'T:**
- Commit secrets to repository
- Share secrets in PR comments or issues
- Use the same key for multiple services
- Leave old secrets in GitHub after rotation
- Log secrets in workflow output

---

## Getting API Keys

### Groq API Key
1. Visit: https://console.groq.com/login
2. Sign up / Login
3. Go to API Keys
4. Create new key
5. Copy the key (starts with `gsk_`)

### Jira API Token
1. Visit: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a name (e.g., "GitHub Actions CI")
4. Copy the token
5. Use with your email in JIRA_EMAIL

### Slack Webhook (Optional)
1. Go to: https://api.slack.com/apps
2. Create a new app
3. Enable Incoming Webhooks
4. Add webhook to channel
5. Copy webhook URL

---

## Troubleshooting

### Workflows won't run
- Check if secrets are added (without typos)
- Verify secret names match workflow files
- Check workflow syntax

### Tests fail with "undefined"
- Verify secrets are accessible
- Check .env file is created in workflow
- Review workflow logs for errors

### Notifications not working
- Verify SLACK_WEBHOOK_URL is correct
- Check Slack webhook is active
- Check Slack channel permissions

---

## Workflow Status

View your workflows at:
```
https://github.com/YOUR_USERNAME/user-story-to-tests/actions
```

---

## Files Using These Secrets

- `.github/workflows/playwright-tests.yml` - Main test workflow
- `.github/workflows/code-quality.yml` - Code quality checks
- `backend/src/server.ts` - Backend server initialization

---

**Next Step:** After adding all secrets, commit this guide and push to trigger workflows!

Generated: April 18, 2026
