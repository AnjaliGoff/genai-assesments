import express, { Router, Request, Response } from 'express'
import { getJiraClient } from '../llm/jiraClient'
import { groqClient } from '../llm/groqClient'

export const jiraRouter = Router()

/**
 * GET /api/jira/health
 * Test connection to Jira
 */
jiraRouter.get('/health', async (req: Request, res: Response) => {
  try {
    const jiraClient = getJiraClient()
    const connected = await jiraClient.testConnection()
    res.json({
      status: connected ? 'OK' : 'FAILED',
      message: connected ? 'Jira connection successful' : 'Failed to connect to Jira'
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'Failed to test Jira connection'
    })
  }
})

/**
 * GET /api/jira/stories
 * Fetch all user stories from Jira (or by project)
 * Query params: ?project=PROJECT_KEY
 */
jiraRouter.get('/stories', async (req: Request, res: Response) => {
  try {
    const jiraClient = getJiraClient()
    const { project } = req.query

    let stories
    if (project && typeof project === 'string') {
      stories = await jiraClient.getIssuesByProject(project)
    } else {
      stories = await jiraClient.getUserStories()
    }

    res.json({
      count: stories.length,
      stories: stories.map((story) => ({
        key: story.key,
        title: story.fields.summary,
        description: story.fields.description || '',
        labels: story.fields.labels || []
      }))
    })
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch stories'
    })
  }
})

/**
 * GET /api/jira/issue/:issueKey
 * Fetch a specific issue from Jira
 */
jiraRouter.get('/issue/:issueKey', async (req: Request, res: Response) => {
  try {
    const jiraClient = getJiraClient()
    const { issueKey } = req.params
    const issue = await jiraClient.getIssue(issueKey)

    res.json({
      key: issue.key,
      title: issue.fields.summary,
      description: issue.fields.description || '',
      labels: issue.fields.labels || []
    })
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch issue'
    })
  }
})

/**
 * POST /api/jira/generate-and-update
 * Generate test cases from Jira issue and add them as a comment
 * Body: { issueKey: "PROJ-123" }
 */
jiraRouter.post('/generate-and-update', async (req: Request, res: Response) => {
  try {
    const { issueKey } = req.body

    if (!issueKey) {
      return res.status(400).json({ error: 'issueKey is required' })
    }

    // Fetch the issue from Jira
    const jiraClient = getJiraClient()
    const issue = await jiraClient.getIssue(issueKey)

    // Prepare user story for test generation
    const userStory = {
      title: issue.fields.summary,
      description: issue.fields.description || '',
      acceptanceCriteria: (issue.fields.description || '')
        .split('\n')
        .filter((line) => line.toLowerCase().includes('acceptance'))
        .join('\n'),
      additionalInfo: issue.fields.labels?.join(', ') || ''
    }

    // Generate test cases using Groq
    const testResult = await groqClient.generateTests(userStory)

    // Add test cases to the Jira issue
    if (testResult.cases && testResult.cases.length > 0) {
      await jiraClient.addTestCasesToIssue(issueKey, testResult.cases)
      await jiraClient.updateIssueWithTestStatus(issueKey, 'PASSED')
    }

    res.json({
      success: true,
      issueKey,
      testCasesGenerated: testResult.cases?.length || 0,
      message: `Generated ${testResult.cases?.length || 0} test cases and updated Jira issue`
    })
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate and update tests'
    })
  }
})

/**
 * POST /api/jira/batch-generate
 * Generate test cases for multiple Jira issues
 * Body: { project: "PROJECT_KEY", limit: 10 }
 */
jiraRouter.post('/batch-generate', async (req: Request, res: Response) => {
  try {
    const { project, limit = 10 } = req.body

    if (!project) {
      return res.status(400).json({ error: 'project key is required' })
    }

    const jiraClient = getJiraClient()
    const stories = await jiraClient.getIssuesByProject(project)
    const issuesToProcess = stories.slice(0, Math.min(limit, stories.length))

    const results = []

    for (const story of issuesToProcess) {
      try {
        const userStory = {
          title: story.fields.summary,
          description: story.fields.description || '',
          acceptanceCriteria: (story.fields.description || '')
            .split('\n')
            .filter((line) => line.toLowerCase().includes('acceptance'))
            .join('\n'),
          additionalInfo: story.fields.labels?.join(', ') || ''
        }

        const testResult = await groqClient.generateTests(userStory)

        if (testResult.cases && testResult.cases.length > 0) {
          await jiraClient.addTestCasesToIssue(story.key, testResult.cases)
          await jiraClient.updateIssueWithTestStatus(story.key, 'PASSED')
        }

        results.push({
          issueKey: story.key,
          status: 'success',
          testCasesGenerated: testResult.cases?.length || 0
        })
      } catch (error) {
        results.push({
          issueKey: story.key,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    res.json({
      success: true,
      project,
      totalProcessed: results.length,
      results
    })
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Batch generation failed'
    })
  }
})

/**
 * PUT /api/jira/issue/:issueKey/status
 * Update test status of an issue
 * Body: { status: "PASSED" | "FAILED" | "IN_PROGRESS" }
 */
jiraRouter.put('/issue/:issueKey/status', async (req: Request, res: Response) => {
  try {
    const { issueKey } = req.params
    const { status } = req.body

    if (!['PASSED', 'FAILED', 'IN_PROGRESS'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const jiraClient = getJiraClient()
    await jiraClient.updateIssueWithTestStatus(issueKey, status)

    res.json({
      success: true,
      issueKey,
      status,
      message: 'Issue status updated'
    })
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update status'
    })
  }
})
