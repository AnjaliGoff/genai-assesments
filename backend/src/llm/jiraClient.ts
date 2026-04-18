import axios, { AxiosInstance } from 'axios'

interface JiraIssue {
  key: string
  fields: {
    summary: string
    description?: string
    customfield_10000?: string // Story Points (may vary)
    labels?: string[]
    issuelinks?: Array<{
      type: {
        name: string
      }
      outwardIssue?: {
        key: string
      }
      inwardIssue?: {
        key: string
      }
    }>
  }
}

interface TestCase {
  id: string
  title: string
  priority: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
}

export class JiraClient {
  private client: AxiosInstance
  private jiraHost: string

  constructor(host: string, email: string, apiToken: string) {
    this.jiraHost = host
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')

    this.client = axios.create({
      baseURL: `${host}/rest/api/3`,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    })
  }

  /**
   * Fetch a single issue from Jira
   */
  async getIssue(issueKey: string): Promise<JiraIssue> {
    try {
      const response = await this.client.get(`/issue/${issueKey}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch issue ${issueKey}: ${error}`)
    }
  }

  /**
   * Search for issues in Jira using JQL
   */
  async searchIssues(jql: string): Promise<JiraIssue[]> {
    try {
      const response = await this.client.get('/search', {
        params: {
          jql,
          maxResults: 50,
          fields: ['summary', 'description', 'labels', 'issuelinks', 'customfield_10000']
        }
      })
      return response.data.issues
    } catch (error) {
      throw new Error(`Failed to search issues: ${error}`)
    }
  }

  /**
   * Get all user stories (type = Story)
   */
  async getUserStories(): Promise<JiraIssue[]> {
    return this.searchIssues('type = Story ORDER BY created DESC')
  }

  /**
   * Get issues by project key
   */
  async getIssuesByProject(projectKey: string): Promise<JiraIssue[]> {
    return this.searchIssues(`project = ${projectKey} AND type = Story ORDER BY created DESC`)
  }

  /**
   * Create a custom field or comment with test cases
   */
  async addTestCasesToIssue(
    issueKey: string,
    testCases: TestCase[],
    overwrite: boolean = false
  ): Promise<void> {
    try {
      const testCasesText = this.formatTestCases(testCases)
      const comment = {
        body: {
          version: 3,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: '🧪 Generated Test Cases:\n\n' + testCasesText
                }
              ]
            }
          ]
        }
      }

      await this.client.post(`/issue/${issueKey}/comment`, comment)
    } catch (error) {
      throw new Error(`Failed to add test cases to issue ${issueKey}: ${error}`)
    }
  }

  /**
   * Update issue with test results as custom field or label
   */
  async updateIssueWithTestStatus(
    issueKey: string,
    status: 'PASSED' | 'FAILED' | 'IN_PROGRESS'
  ): Promise<void> {
    try {
      const labels = {
        labels: [`test-status-${status.toLowerCase()}`, 'test-generated']
      }
      await this.client.put(`/issue/${issueKey}`, { fields: labels })
    } catch (error) {
      throw new Error(`Failed to update issue ${issueKey} status: ${error}`)
    }
  }

  /**
   * Format test cases as readable text
   */
  private formatTestCases(testCases: TestCase[]): string {
    return testCases
      .map(
        (tc) => `
*${tc.id}: ${tc.title}*
- Priority: ${tc.priority}
- Category: ${tc.category}
- Steps:
${tc.steps.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}
- Expected Result: ${tc.expectedResult}
${tc.testData ? `- Test Data: ${tc.testData}` : ''}
`
      )
      .join('\n---\n')
  }

  /**
   * Verify connection to Jira
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/myself')
      return !!response.data
    } catch (error) {
      console.error('Jira connection test failed:', error)
      return false
    }
  }
}

// Singleton instance
let jiraClientInstance: JiraClient | null = null

export function initializeJiraClient(): JiraClient {
  const host = process.env.JIRA_HOST
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN

  if (!host || !email || !apiToken) {
    throw new Error('Jira configuration missing: JIRA_HOST, JIRA_EMAIL, or JIRA_API_TOKEN')
  }

  jiraClientInstance = new JiraClient(host, email, apiToken)
  return jiraClientInstance
}

export function getJiraClient(): JiraClient {
  if (!jiraClientInstance) {
    throw new Error('Jira client not initialized. Call initializeJiraClient first.')
  }
  return jiraClientInstance
}
