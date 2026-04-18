import { Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly storyTitleInput: Locator;
  readonly acceptanceCriteriaInput: Locator;
  readonly descriptionInput: Locator;
  readonly additionalInfoInput: Locator;
  readonly generateButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;
  readonly resultsSection: Locator;
  readonly testCaseItems: Locator;
  readonly downloadButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    // Update selectors based on actual application structure
    this.storyTitleInput = page.locator('input[placeholder*="Story Title"], textarea[name="storyTitle"]').first();
    this.acceptanceCriteriaInput = page.locator('textarea[name="acceptanceCriteria"], textarea[placeholder*="Acceptance"]').first();
    this.descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="Description"]').first();
    this.additionalInfoInput = page.locator('textarea[name="additionalInfo"], textarea[placeholder*="Additional"]').first();
    this.generateButton = page.locator('button:has-text("Generate"), button:has-text("Submit")').first();
    this.errorMessage = page.locator('[role="alert"], .error, .error-message');
    this.loadingIndicator = page.locator('[role="progressbar"], .loading, .spinner');
    this.resultsSection = page.locator('.results, [data-testid="results"], .test-cases');
    this.testCaseItems = page.locator('.test-case, [data-testid="test-case"], .case-item');
    this.downloadButtons = page.locator('button:has-text("Download")', 'a:has-text("Download")');
  }

  async goto() {
    await this.page.goto('http://localhost:5173');
  }

  async fillStoryTitle(title: string) {
    await this.storyTitleInput.fill(title);
  }

  async fillAcceptanceCriteria(criteria: string) {
    await this.acceptanceCriteriaInput.fill(criteria);
  }

  async fillDescription(description: string) {
    await this.descriptionInput.fill(description);
  }

  async fillAdditionalInfo(info: string) {
    await this.additionalInfoInput.fill(info);
  }

  async clickGenerateButton() {
    await this.generateButton.click();
  }

  async fillForm(storyTitle: string, acceptanceCriteria: string, description?: string, additionalInfo?: string) {
    await this.fillStoryTitle(storyTitle);
    await this.fillAcceptanceCriteria(acceptanceCriteria);
    if (description) {
      await this.fillDescription(description);
    }
    if (additionalInfo) {
      await this.fillAdditionalInfo(additionalInfo);
    }
  }

  async submitForm(storyTitle: string, acceptanceCriteria: string, description?: string, additionalInfo?: string) {
    await this.fillForm(storyTitle, acceptanceCriteria, description, additionalInfo);
    await this.clickGenerateButton();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isLoadingVisible() {
    return await this.loadingIndicator.isVisible();
  }

  async isResultsVisible() {
    return await this.resultsSection.isVisible();
  }

  async getTestCasesCount() {
    return await this.testCaseItems.count();
  }

  async getTestCaseByIndex(index: number) {
    return this.testCaseItems.nth(index);
  }

  async expandTestCase(index: number) {
    await this.testCaseItems.nth(index).click();
  }

  async isTestCaseExpanded(index: number) {
    const testCase = this.testCaseItems.nth(index);
    return await testCase.evaluate((el) => {
      return el.classList.contains('expanded') || el.getAttribute('aria-expanded') === 'true';
    });
  }

  // ============ Additional Helper Methods ============

  async downloadTestCases(format: 'json' | 'csv' = 'json') {
    const button = this.downloadButtons.first();
    
    // Set up listener for download
    const downloadPromise = this.page.waitForEvent('download');
    await button.click();
    const download = await downloadPromise;
    
    return download;
  }

  async getTestCaseTitle(index: number): Promise<string | null> {
    const testCase = this.testCaseItems.nth(index);
    return await testCase.locator('.test-case-title, [class*="title"]').first().textContent();
  }

  async getTestCasePriority(index: number): Promise<string | null> {
    const testCase = this.testCaseItems.nth(index);
    return await testCase.locator('[class*="priority"]').first().textContent();
  }

  async getTestCaseSteps(index: number): Promise<string[]> {
    const testCase = this.testCaseItems.nth(index);
    const steps = await testCase.locator('.step, [class*="step"]').allTextContents();
    return steps;
  }

  async getTestCaseExpectedResult(index: number): Promise<string | null> {
    const testCase = this.testCaseItems.nth(index);
    return await testCase.locator('.expected-result, [class*="expected"]').first().textContent();
  }

  async clearAllInputs() {
    await this.storyTitleInput.clear();
    await this.acceptanceCriteriaInput.clear();
    await this.descriptionInput.clear();
    await this.additionalInfoInput.clear();
  }

  async isFormEmpty(): Promise<boolean> {
    const titleValue = await this.storyTitleInput.inputValue();
    const criteriaValue = await this.acceptanceCriteriaInput.inputValue();
    return titleValue === '' && criteriaValue === '';
  }

  async isGenerateButtonEnabled(): Promise<boolean> {
    return await this.generateButton.isEnabled();
  }

  async waitForResultsToLoad(timeout: number = 5000) {
    await this.resultsSection.waitFor({ state: 'visible', timeout });
  }

  async waitForLoadingToComplete(timeout: number = 5000) {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  async getAllTestCaseData() {
    const count = await this.getTestCasesCount();
    const testCasesData = [];

    for (let i = 0; i < count; i++) {
      testCasesData.push({
        index: i,
        title: await this.getTestCaseTitle(i),
        priority: await this.getTestCasePriority(i),
        steps: await this.getTestCaseSteps(i),
        expectedResult: await this.getTestCaseExpectedResult(i),
      });
    }

    return testCasesData;
  }

  async verifyTestCaseStructure(index: number): Promise<boolean> {
    const testCase = this.testCaseItems.nth(index);
    const title = await this.getTestCaseTitle(index);
    const steps = await this.getTestCaseSteps(index);
    const expectedResult = await this.getTestCaseExpectedResult(index);

    return !!(title && steps.length > 0 && expectedResult);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/${name}.png`, fullPage: true });
  }

  async recheckPage() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async getDownloadButtonCount() {
    return await this.downloadButtons.count();
  }

  async clickDownloadButton(index: number = 0) {
    await this.downloadButtons.nth(index).click();
  }

  async waitForTestCasesLoading(timeout: number = 10000) {
    await this.page.waitForSelector('.test-case, [data-testid="test-case"]', { timeout });
  }

  // ============ Advanced Interaction Methods ============

  async collapseTestCase(index: number) {
    const testCase = this.testCaseItems.nth(index);
    const isExpanded = await this.isTestCaseExpanded(index);
    if (isExpanded) {
      await testCase.click();
    }
  }

  async getFormValues() {
    return {
      storyTitle: await this.storyTitleInput.inputValue(),
      acceptanceCriteria: await this.acceptanceCriteriaInput.inputValue(),
      description: await this.descriptionInput.inputValue(),
      additionalInfo: await this.additionalInfoInput.inputValue(),
    };
  }

  async isErrorMessageVisible(expectedText?: string): Promise<boolean> {
    const isVisible = await this.errorMessage.isVisible();
    if (!isVisible) return false;
    
    if (expectedText) {
      const message = await this.errorMessage.textContent();
      return message?.includes(expectedText) || false;
    }
    return true;
  }

  async waitForErrorMessage(timeout: number = 5000) {
    await this.errorMessage.waitFor({ state: 'visible', timeout });
  }

  async getLoadingState(): Promise<boolean> {
    return await this.loadingIndicator.isVisible();
  }

  async waitForPageReady() {
    await this.page.waitForLoadState('networkidle');
  }

  async getPageTitle(): Promise<string | null> {
    return await this.page.title();
  }

  async getAllTestCaseTitles(): Promise<(string | null)[]> {
    const count = await this.getTestCasesCount();
    const titles: (string | null)[] = [];
    
    for (let i = 0; i < count; i++) {
      titles.push(await this.getTestCaseTitle(i));
    }
    
    return titles;
  }

  async getTestCasesByPriority(priority: 'High' | 'Medium' | 'Low'): Promise<any[]> {
    const count = await this.getTestCasesCount();
    const testCases: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const testCasePriority = await this.getTestCasePriority(i);
      if (testCasePriority?.includes(priority)) {
        testCases.push({
          index: i,
          title: await this.getTestCaseTitle(i),
          priority: testCasePriority,
          steps: await this.getTestCaseSteps(i),
        });
      }
    }
    
    return testCases;
  }

  async searchTestCase(keyword: string): Promise<number | -1> {
    const titles = await this.getAllTestCaseTitles();
    const index = titles.findIndex(title => title?.toLowerCase().includes(keyword.toLowerCase()));
    return index !== -1 ? index : -1;
  }

  async exportTestCases(): Promise<string> {
    const testCases = await this.getAllTestCaseData();
    return JSON.stringify(testCases, null, 2);
  }

  async isPageLoaded(): Promise<boolean> {
    try {
      const button = await this.generateButton.isVisible();
      return button;
    } catch {
      return false;
    }
  }

  async scrollToTestCase(index: number) {
    const testCase = this.testCaseItems.nth(index);
    await testCase.scrollIntoViewIfNeeded();
  }

  async getFirstTestCaseData() {
    return {
      title: await this.getTestCaseTitle(0),
      priority: await this.getTestCasePriority(0),
      steps: await this.getTestCaseSteps(0),
      expectedResult: await this.getTestCaseExpectedResult(0),
    };
  }

  async verifyAllTestCasesHaveRequiredFields(): Promise<boolean> {
    const count = await this.getTestCasesCount();
    
    for (let i = 0; i < count; i++) {
      const isValid = await this.verifyTestCaseStructure(i);
      if (!isValid) return false;
    }
    
    return true;
  }

  async waitAndVerifyResults(timeout: number = 10000): Promise<boolean> {
    try {
      await this.waitForResultsToLoad(timeout);
      return await this.isResultsVisible();
    } catch {
      return false;
    }
  }

  async performFullWorkflow(storyTitle: string, acceptanceCriteria: string, description?: string, additionalInfo?: string) {
    await this.submitForm(storyTitle, acceptanceCriteria, description, additionalInfo);
    await this.waitForLoadingToComplete();
    const resultsVisible = await this.waitAndVerifyResults();
    return resultsVisible;
  }
}
