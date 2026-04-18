import type { APIRequestContext, APIResponse } from '@playwright/test';

interface TestPayload {
  storyTitle: string;
  acceptanceCriteria: string;
  description?: string;
  additionalInfo?: string;
}

interface GeneratedTestCase {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  steps: string[];
  testData?: string;
  expectedResult: string;
  category: 'Positive' | 'Negative' | 'Edge';
}

interface GeneratedTestResponse {
  cases: GeneratedTestCase[];
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
}

export class ApiClient {
  private baseUrl: string;
  private request: APIRequestContext;

  constructor(request: APIRequestContext, baseUrl: string = 'http://localhost:8091/api') {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  // ============ Health & Status Endpoints ============

  async healthCheck(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/health`);
  }

  async getHealthCheckStatus() {
    const response = await this.healthCheck();
    return await response.json();
  }

  // ============ Test Generation Endpoints ============

  async generateTests(payload: TestPayload): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/generate-tests`, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateTestsAndGetJson(payload: TestPayload): Promise<GeneratedTestResponse> {
    const response = await this.generateTests(payload);
    return await response.json();
  }

  // ============ Jira Integration Endpoints ============

  async jiraHealthCheck(): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/jira/health`);
  }

  async fetchJiraStories(projectKey?: string): Promise<APIResponse> {
    const url = projectKey 
      ? `${this.baseUrl}/jira/stories?project=${projectKey}` 
      : `${this.baseUrl}/jira/stories`;
    return await this.request.get(url);
  }

  async fetchJiraIssue(issueKey: string): Promise<APIResponse> {
    return await this.request.get(`${this.baseUrl}/jira/issue/${issueKey}`);
  }

  async generateAndUpdateJira(issueKey: string): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/jira/generate-and-update`, {
      data: { issueKey },
    });
  }

  async batchGenerateForProject(projectKey: string, limit: number = 10): Promise<APIResponse> {
    return await this.request.post(`${this.baseUrl}/jira/batch-generate`, {
      data: { project: projectKey, limit },
    });
  }

  async updateJiraIssueStatus(issueKey: string, status: 'PASSED' | 'FAILED' | 'IN_PROGRESS'): Promise<APIResponse> {
    return await this.request.put(`${this.baseUrl}/jira/issue/${issueKey}/status`, {
      data: { status },
    });
  }

  // ============ Response Parsing Methods ============

  async getGeneratedTestCases(payload: TestPayload): Promise<GeneratedTestCase[]> {
    const response = await this.generateTestsAndGetJson(payload);
    return response.cases || [];
  }

  async getTestCaseCount(payload: TestPayload): Promise<number> {
    const cases = await this.getGeneratedTestCases(payload);
    return cases.length;
  }

  async getTestCasesByCategory(payload: TestPayload, category: 'Positive' | 'Negative' | 'Edge'): Promise<GeneratedTestCase[]> {
    const cases = await this.getGeneratedTestCases(payload);
    return cases.filter(testCase => testCase.category === category);
  }

  async getHighPriorityTestCases(payload: TestPayload): Promise<GeneratedTestCase[]> {
    const cases = await this.getGeneratedTestCases(payload);
    return cases.filter(testCase => testCase.priority === 'High');
  }

  // ============ Jira Response Parsing Methods ============

  async getJiraStoryList(projectKey?: string) {
    const response = await this.fetchJiraStories(projectKey);
    return await response.json();
  }

  async getJiraIssueData(issueKey: string) {
    const response = await this.fetchJiraIssue(issueKey);
    return await response.json();
  }

  async getJiraConnectionStatus() {
    try {
      const response = await this.jiraHealthCheck();
      return await response.json();
    } catch (error) {
      return { status: 'ERROR', message: 'Jira connection failed' };
    }
  }

  // ============ Validation Methods ============

  async isResponseSuccessful(response: APIResponse): Promise<boolean> {
    return response.status() >= 200 && response.status() < 300;
  }

  async validateTestCaseStructure(testCase: GeneratedTestCase): Promise<boolean> {
    return !!(testCase.id && testCase.title && testCase.steps && testCase.steps.length > 0 && testCase.expectedResult);
  }

  async validateAllTestCases(payload: TestPayload): Promise<{ valid: boolean; issues: string[] }> {
    const testCases = await this.getGeneratedTestCases(payload);
    const issues: string[] = [];

    for (let i = 0; i < testCases.length; i++) {
      const isValid = await this.validateTestCaseStructure(testCases[i]);
      if (!isValid) {
        issues.push(`Test case ${i} has invalid structure`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  // ============ Error Handling Methods ============

  async getErrorResponse(response: APIResponse): Promise<any> {
    try {
      return await response.json();
    } catch {
      return { error: response.statusText() };
    }
  }

  async validateErrorResponse(response: APIResponse): Promise<boolean> {
    if (response.status() < 400) return false;
    const errorData = await this.getErrorResponse(response);
    return !!errorData.error;
  }

  // ============ Performance & Metrics Methods ============

  async getApiResponseTime(payload: TestPayload): Promise<number> {
    const startTime = Date.now();
    await this.generateTests(payload);
    const endTime = Date.now();
    return endTime - startTime;
  }

  async getTokenUsage(payload: TestPayload): Promise<{ promptTokens: number; completionTokens: number }> {
    const data = await this.generateTestsAndGetJson(payload);
    return {
      promptTokens: data.promptTokens || 0,
      completionTokens: data.completionTokens || 0,
    };
  }
}
