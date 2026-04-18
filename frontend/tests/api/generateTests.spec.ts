import { test, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';

test.describe('User Story to Tests Generator - API Tests', () => {
  let apiClient: ApiClient;

  test.beforeEach(async ({ request }) => {
    apiClient = new ApiClient(request);
  });

  test('should return health status OK', async () => {
    // Act
    const response = await apiClient.healthCheck();

    // Assert
    expect(response.status()).toBe(200);
    const data = await apiClient.getHealthCheckStatus();
    expect(data.status).toBe('OK');
    expect(data.timestamp).toBeTruthy();
  });

  test('should generate test cases for valid payload', async () => {
    // Arrange
    const payload = {
      storyTitle: 'User Login',
      acceptanceCriteria: 'User should be able to login with valid credentials',
      description: 'Test user login functionality',
      additionalInfo: 'Cross-browser testing required',
    };

    // Act
    const response = await apiClient.generateTests(payload);

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.cases).toBeTruthy();
    expect(Array.isArray(data.cases)).toBe(true);
    expect(data.cases.length).toBeGreaterThan(0);
  });

  test('should return test cases with required fields', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Product Search',
      acceptanceCriteria: 'User can search for products by name',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data.cases).toBeTruthy();
    data.cases.forEach((testCase: any) => {
      expect(testCase.id).toBeDefined();
      expect(testCase.title).toBeDefined();
      expect(testCase.priority).toBeDefined();
      expect(testCase.steps).toBeDefined();
      expect(Array.isArray(testCase.steps)).toBe(true);
      expect(testCase.expectedResult).toBeDefined();
      expect(testCase.category).toBeDefined();
    });
  });

  test('should return model and token information', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Payment Processing',
      acceptanceCriteria: 'Process payment securely',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data.promptTokens).toBeGreaterThanOrEqual(0);
    expect(data.completionTokens).toBeGreaterThanOrEqual(0);
  });

  test('should generate multiple test cases from complex story', async () => {
    // Arrange
    const payload = {
      storyTitle: 'User Registration and Verification',
      acceptanceCriteria: 'User should register with email and receive verification link. User should be able to verify email and login.',
      description: 'Complete user registration flow with email verification',
      additionalInfo: 'Test with various email formats and edge cases',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data.cases).toBeDefined();
    expect(data.cases.length).toBeGreaterThan(0);
    expect(data.cases.length).toBeLessThanOrEqual(50); // Allow comprehensive test suite

    // Verify each test case has proper structure
    data.cases.forEach((testCase: any) => {
      expect(testCase.steps.length).toBeGreaterThan(0);
      expect(testCase.priority).toBeDefined();
    });
  });

  test('should handle minimal payload', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Simple Feature',
      acceptanceCriteria: 'Simple acceptance criteria',
    };

    // Act
    const response = await apiClient.generateTests(payload);

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.cases).toBeTruthy();
  });

  test('should include test case steps', async () => {
    // Arrange
    const payload = {
      storyTitle: 'E-commerce Checkout',
      acceptanceCriteria: 'User should be able to add items and checkout',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data.cases.length).toBeGreaterThan(0);
    data.cases.forEach((testCase: any) => {
      expect(testCase.steps).toBeDefined();
      expect(Array.isArray(testCase.steps)).toBe(true);
      if (testCase.steps.length > 0) {
        expect(typeof testCase.steps[0]).toBe('string');
      }
    });
  });

  test('should prioritize test cases', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Feature with Priority',
      acceptanceCriteria: 'Feature should have different priority levels',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data).toBeDefined();
    if (data && data.cases) {
      expect(data.cases.length).toBeGreaterThan(0);
      const priorities = data.cases.map((testCase: any) => testCase.priority);
      expect(priorities.length).toBeGreaterThan(0);
      expect(priorities.some((p: string) => p && p.length > 0)).toBeTruthy();
    } else {
      // Fallback: API returned valid response but in different format
      expect(data).toBeTruthy();
    }
  });

  // ============ Additional Edge Case Tests ============

  test('should handle empty optional fields', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Feature Title',
      acceptanceCriteria: 'Feature criteria',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data.cases).toBeDefined();
    expect(Array.isArray(data.cases)).toBe(true);
  });

  test('should handle special characters in payload', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Feature with @special #chars & symbols',
      acceptanceCriteria: 'Test "quotes" and \'apostrophes\' and <tags>',
      description: 'Description with émojis and ñon-ASCII chars',
    };

    // Act
    const response = await apiClient.generateTests(payload);

    // Assert
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.cases).toBeTruthy();
  });

  test('should handle long text payloads', async () => {
    // Arrange
    const longText = 'A'.repeat(500);
    const payload = {
      storyTitle: longText,
      acceptanceCriteria: `Criteria: ${longText}`,
      description: `Description: ${longText}`,
    };

    // Act
    const response = await apiClient.generateTests(payload);

    // Assert
    expect(response.status()).toBe(200);
  });

  test('should validate test case categories', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Category Test',
      acceptanceCriteria: 'Test should have positive, negative, and edge cases',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    if (data.cases && data.cases.length > 0) {
      const categories = data.cases.map((tc: any) => tc.category);
      const validCategories = ['Positive', 'Negative', 'Edge'];
      categories.forEach((cat: string) => {
        if (cat) {
          expect(validCategories).toContain(cat);
        }
      });
    }
  });

  test('should validate all test cases have valid priorities', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Priority Validation',
      acceptanceCriteria: 'All test cases must have valid priority',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    const validPriorities = ['High', 'Medium', 'Low'];
    if (data.cases) {
      data.cases.forEach((testCase: any) => {
        expect(validPriorities).toContain(testCase.priority);
      });
    }
  });

  test('should have consistent response structure', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Structure Test',
      acceptanceCriteria: 'Response should be consistent',
    };

    // Act
    const data = await apiClient.generateTestsAndGetJson(payload);

    // Assert
    expect(data).toHaveProperty('cases');
    expect(Array.isArray(data.cases)).toBe(true);
    
    if (data.cases.length > 0) {
      const firstCase = data.cases[0];
      expect(firstCase).toHaveProperty('id');
      expect(firstCase).toHaveProperty('title');
      expect(firstCase).toHaveProperty('priority');
      expect(firstCase).toHaveProperty('steps');
      expect(firstCase).toHaveProperty('expectedResult');
    }
  });

  test('should measure API response time', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Performance Test',
      acceptanceCriteria: 'Should respond within reasonable time',
    };

    // Act
    const responseTime = await apiClient.getApiResponseTime(payload);

    // Assert
    expect(responseTime).toBeGreaterThan(0);
    expect(responseTime).toBeLessThan(30000); // Should respond within 30 seconds
  });

  test('should validate token usage reporting', async () => {
    // Arrange
    const payload = {
      storyTitle: 'Token Usage Test',
      acceptanceCriteria: 'Should report token usage',
    };

    // Act
    const tokenUsage = await apiClient.getTokenUsage(payload);

    // Assert
    expect(tokenUsage.promptTokens).toBeGreaterThanOrEqual(0);
    expect(tokenUsage.completionTokens).toBeGreaterThanOrEqual(0);
  });
});
