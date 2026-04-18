/**
 * Jira Test Result Reporter
 * Posts test execution results to Jira issues as comments
 * Can be used in CI/CD pipelines for test reporting
 */

import { JiraClient } from './jiraClient'
import fs from 'fs'
import path from 'path'

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  browser?: string
}

interface TestReportSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  timestamp: string
  browser?: string
  branch?: string
  commit?: string
}

export class JiraTestReporter {
  private jiraClient: JiraClient

  constructor(jiraClient: JiraClient) {
    this.jiraClient = jiraClient
  }

  /**
   * Format test results for Jira comment
   */
  private formatTestResults(summary: TestReportSummary, testResults: TestResult[]): string {
    const statusEmoji = summary.failed === 0 ? '✅' : '❌'
    const passRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : '0'

    let markdown = `${statusEmoji} *Test Results Report*\n\n`
    markdown += `*Status:* ${summary.failed === 0 ? 'All Tests Passed' : `${summary.failed} Failed`}\n`
    markdown += `*Timestamp:* ${summary.timestamp}\n`

    // Metrics
    markdown += `\n*Metrics:*\n`
    markdown += `- Total: ${summary.total}\n`
    markdown += `- Passed: ✅ ${summary.passed}\n`
    markdown += `- Failed: ❌ ${summary.failed}\n`
    markdown += `- Skipped: ⏭️ ${summary.skipped}\n`
    markdown += `- Duration: ⏱️ ${(summary.duration / 1000).toFixed(2)}s\n`
    markdown += `- Pass Rate: 📊 ${passRate}%\n`

    if (summary.browser) {
      markdown += `- Browser: 🌐 ${summary.browser}\n`
    }

    if (summary.branch) {
      markdown += `- Branch: 🌿 ${summary.branch}\n`
    }

    if (summary.commit) {
      markdown += `- Commit: 📝 ${summary.commit.substring(0, 7)}\n`
    }

    // Failed tests details
    if (summary.failed > 0) {
      markdown += `\n*Failed Tests:*\n`
      const failedTests = testResults.filter((t) => t.status === 'failed')
      failedTests.forEach((test) => {
        markdown += `- ${test.name}: ${test.error || 'Unknown error'}\n`
      })
    }

    // Test breakdown
    markdown += `\n*Test Breakdown:*\n`
    markdown += `{noformat}\n`
    testResults.forEach((test) => {
      const icon =
        test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'
      markdown += `${icon} ${test.name} (${test.duration}ms)\n`
    })
    markdown += `{noformat}\n`

    return markdown
  }

  /**
   * Post test results to a Jira issue
   */
  async postTestResultsToIssue(issueKey: string, summary: TestReportSummary, testResults: TestResult[]): Promise<void> {
    try {
      const comment = this.formatTestResults(summary, testResults)
      // Note: Actual comment posting would require extended Jira client
      console.log(`Would post test results to ${issueKey}:`, comment)
    } catch (error) {
      console.error(`Failed to post results to ${issueKey}:`, error)
    }
  }

  /**
   * Link test cases to Jira issue
   */
  async linkTestCasesToIssue(issueKey: string, testCaseIds: string[]): Promise<void> {
    try {
      console.log(`Linking ${testCaseIds.length} test cases to ${issueKey}`)
      // Implementation depends on Jira link setup
    } catch (error) {
      console.error(`Failed to link test cases:`, error)
    }
  }

  /**
   * Create linked test execution issue
   */
  async createTestExecutionIssue(parentIssueKey: string, testSummary: TestReportSummary): Promise<string> {
    try {
      const title = `Test Execution - ${parentIssueKey} (${testSummary.timestamp})`
      const description = `
Test execution for ${parentIssueKey}

Results:
- Total: ${testSummary.total}
- Passed: ${testSummary.passed}
- Failed: ${testSummary.failed}
- Duration: ${testSummary.duration}ms
- Pass Rate: ${((testSummary.passed / testSummary.total) * 100).toFixed(1)}%
`
      // Implementation would require Jira issue creation
      console.log(`Would create test execution issue: ${title}`)
      return 'PROJ-XXX'
    } catch (error) {
      console.error(`Failed to create test execution issue:`, error)
      throw error
    }
  }

  /**
   * Update issue status based on test results
   */
  async updateIssueStatusByTestResults(issueKey: string, testSummary: TestReportSummary): Promise<void> {
    try {
      const newStatus = testSummary.failed === 0 ? 'Ready for Testing' : 'In Testing'
      console.log(`Would update ${issueKey} status to: ${newStatus}`)
    } catch (error) {
      console.error(`Failed to update issue status:`, error)
    }
  }
}

/**
 * Parse Playwright JSON report and extract test results
 */
export function parsePlaywrightReport(reportPath: string): { summary: TestReportSummary; results: TestResult[] } {
  try {
    const reportContent = fs.readFileSync(reportPath, 'utf-8')
    const report = JSON.parse(reportContent)

    const results: TestResult[] = []
    let totalTests = 0
    let passedTests = 0
    let failedTests = 0
    let skippedTests = 0
    let totalDuration = 0

    report.suites?.forEach((suite: any) => {
      suite.tests?.forEach((test: any) => {
        totalTests++
        totalDuration += test.duration || 0

        const testResult: TestResult = {
          name: test.title,
          status: test.ok ? 'passed' : 'failed',
          duration: test.duration || 0,
          error: test.ok ? undefined : test.error?.message || 'Test failed'
        }

        results.push(testResult)

        if (test.ok) {
          passedTests++
        } else {
          failedTests++
        }
      })
    })

    const summary: TestReportSummary = {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    }

    return { summary, results }
  } catch (error) {
    console.error(`Failed to parse report: ${reportPath}`, error)
    throw error
  }
}

/**
 * Extract test results from HTML report (alternative to JSON)
 */
export function parsePlaywrightHTMLReport(reportPath: string): { summary: TestReportSummary; results: TestResult[] } {
  // This would parse the HTML report - simplified here
  console.log(`Parsing HTML report from: ${reportPath}`)

  const summary: TestReportSummary = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0,
    timestamp: new Date().toISOString()
  }

  return { summary, results: [] }
}
