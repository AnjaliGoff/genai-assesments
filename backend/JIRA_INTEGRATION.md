# Jira Integration Setup Guide

## Overview
This backend now includes complete Jira integration for fetching user stories and pushing generated test cases back to Jira.

## Prerequisites
1. **Jira Instance**: You need a Jira Cloud or Server instance
2. **API Token**: Generate it from https://id.atlassian.com/manage-profile/security/api-tokens
3. **Jira Host**: Your Jira instance URL (e.g., https://your-domain.atlassian.net)
4. **Email**: The email associated with your Jira account

## Configuration

### Step 1: Add Environment Variables to `.env`

```dotenv
# Jira Configuration
JIRA_HOST=https://anjalig0628.atlassian.net/
JIRA_EMAIL=anjalig0628@gmail.com
JIRA_API_TOKEN=ATATT3xFfGF0AjYRw9tl9Ju_LNhjM3WPQTWpxrsQDYQ4GiXneqv-PFzPgVOKxBNGSGV_CRtxJNH9go3J12BN9QyA5902t2FMzJYwQgk3jZ5Xi1_aZ3Dy8QCd0Zj0KXTD2n_x5GIP3QGhKVgbFXE1YqGrPGam_ervrH4QD1c5kt8Z71gzU1Rv1wU=21FFC5BF
```

Replace the values with your actual Jira credentials.

### Step 2: Install Dependencies
All required dependencies (axios) are already included in `package.json`.

### Step 3: Start the Backend
```bash
npm run dev
```

The server will automatically initialize the Jira client if credentials are configured.

## API Endpoints

All endpoints are prefixed with `/api/jira`

### 1. Test Jira Connection
**GET** `/api/jira/health`

Tests if the connection to Jira is working.

**Response:**
```json
{
  "status": "OK",
  "message": "Jira connection successful"
}
```

---

### 2. Fetch All User Stories
**GET** `/api/jira/stories`

Fetches all user stories from Jira, or stories from a specific project.

**Query Parameters:**
- `project` (optional): Filter by project key (e.g., `?project=PROJ`)

**Response:**
```json
{
  "count": 5,
  "stories": [
    {
      "key": "PROJ-123",
      "title": "As a user, I want to login securely",
      "description": "...",
      "labels": ["security", "auth"]
    }
  ]
}
```

---

### 3. Fetch Specific Issue
**GET** `/api/jira/issue/:issueKey`

Fetches a specific issue by its key (e.g., PROJ-123).

**Response:**
```json
{
  "key": "PROJ-123",
  "title": "As a user, I want to login securely",
  "description": "...",
  "labels": ["security", "auth"]
}
```

---

### 4. Generate Tests and Update Issue
**POST** `/api/jira/generate-and-update`

Generates test cases for a specific issue and adds them as a comment in Jira.

**Request Body:**
```json
{
  "issueKey": "PROJ-123"
}
```

**Response:**
```json
{
  "success": true,
  "issueKey": "PROJ-123",
  "testCasesGenerated": 8,
  "message": "Generated 8 test cases and updated Jira issue"
}
```

---

### 5. Batch Generate Tests for Project
**POST** `/api/jira/batch-generate`

Generates test cases for multiple issues in a project.

**Request Body:**
```json
{
  "project": "PROJ",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "project": "PROJ",
  "totalProcessed": 5,
  "results": [
    {
      "issueKey": "PROJ-123",
      "status": "success",
      "testCasesGenerated": 8
    },
    {
      "issueKey": "PROJ-124",
      "status": "failed",
      "error": "..."
    }
  ]
}
```

---

### 6. Update Issue Test Status
**PUT** `/api/jira/issue/:issueKey/status`

Updates the test status of an issue by adding labels.

**Request Body:**
```json
{
  "status": "PASSED"
}
```

Valid status values: `PASSED`, `FAILED`, `IN_PROGRESS`

**Response:**
```json
{
  "success": true,
  "issueKey": "PROJ-123",
  "status": "PASSED",
  "message": "Issue status updated"
}
```

---

## Usage Examples

### cURL Examples

**Test Jira connection:**
```bash
curl -X GET http://localhost:8091/api/jira/health
```

**Fetch all stories:**
```bash
curl -X GET http://localhost:8091/api/jira/stories
```

**Fetch stories from a project:**
```bash
curl -X GET "http://localhost:8091/api/jira/stories?project=PROJ"
```

**Generate tests for an issue:**
```bash
curl -X POST http://localhost:8091/api/jira/generate-and-update \
  -H "Content-Type: application/json" \
  -d '{"issueKey": "PROJ-123"}'
```

**Batch generate for project:**
```bash
curl -X POST http://localhost:8091/api/jira/batch-generate \
  -H "Content-Type: application/json" \
  -d '{"project": "PROJ", "limit": 10}'
```

**Update issue status:**
```bash
curl -X PUT http://localhost:8091/api/jira/issue/PROJ-123/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PASSED"}'
```

---

## Files Modified/Created

1. **`.env`** - Added Jira configuration variables
2. **`backend/src/llm/jiraClient.ts`** - Jira API client implementation
3. **`backend/src/routes/jira.ts`** - Jira API endpoints
4. **`backend/src/server.ts`** - Integrated Jira client and router

## Troubleshooting

### "Jira configuration missing" error
- Ensure all three variables are set in `.env`:
  - `JIRA_HOST`
  - `JIRA_EMAIL`
  - `JIRA_API_TOKEN`

### "401 Unauthorized" error
- Verify your API token is correct
- Check that the email is associated with your Jira account
- Regenerate the API token from https://id.atlassian.com/manage-profile/security/api-tokens

### "Connection timed out" error
- Verify the `JIRA_HOST` is correct (should include https://)
- Check your network connectivity
- Ensure your Jira instance is accessible from your network

## Next Steps

1. Update your frontend to use the new Jira endpoints
2. Add Jira issue selection UI to allow users to fetch stories from Jira
3. Display test results in your UI after generation
4. Consider adding webhook integration for real-time Jira updates
