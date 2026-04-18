Feature: User Story to Tests Generator
  As a QA Engineer
  I want to generate test cases from user stories
  So that I can create comprehensive test scenarios quickly

  Background:
    Given user navigates to the application
    And the application is fully loaded

  Scenario: Generate tests with valid user story
    When user enters a story title "Login Feature"
    And user enters acceptance criteria "User should be able to login with valid credentials"
    And user enters description "User attempts to login with username and password"
    And user enters additional info "Test across Chrome and Firefox"
    And user clicks the Generate Tests button
    Then test cases should be generated successfully
    And test cases should be displayed in the results section
    And test cases should have title, priority, steps, and expected results

  Scenario: Validate required fields
    When user tries to submit form without story title
    And user enters acceptance criteria "Some criteria"
    And user clicks the Generate Tests button
    Then error message should be displayed
    And error message should say "Story Title and Acceptance Criteria are required"

  Scenario: Display loading state during generation
    When user enters a story title "Payment Processing"
    And user enters acceptance criteria "Process payment successfully"
    And user clicks the Generate Tests button
    Then loading indicator should be visible
    And form should be disabled during processing

  Scenario: Download generated test cases
    Given test cases have been generated
    When user clicks the download button
    Then test cases should be downloadable
    And file format should be supported

  Scenario: Test case expansion and collapse
    Given test cases have been generated
    When user clicks on a test case to expand
    Then test case details should be visible
    And when user clicks to collapse
    Then test case details should be hidden

  Scenario: Health check endpoint
    When user makes a request to health check endpoint
    Then endpoint should return status OK
    And response should include timestamp
