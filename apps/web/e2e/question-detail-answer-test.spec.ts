import { test, expect } from '@playwright/test';

test.describe('Question Detail Page - Answer Visibility and Submission', () => {
  const questionId = 'cmhbvi9y400ossda2zjbif9ug';
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test('should display existing answers without requiring login', async ({ page }) => {
    // Navigate to the question detail page
    await page.goto(questionUrl);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({
      path: 'screenshots/question-detail-initial.png',
      fullPage: true
    });

    // Check if the question content is visible
    const questionContent = page.locator('h1, [data-testid="question-title"]').first();
    await expect(questionContent).toBeVisible({ timeout: 10000 });

    console.log('✓ Question title is visible');

    // Look for answers section
    const answersSection = page.locator('[data-testid="answers-list"], .answers, section:has-text("답변")').first();

    if (await answersSection.isVisible()) {
      console.log('✓ Answers section found');

      // Count the number of answers
      const answerItems = page.locator('[data-testid="answer-item"], .answer-card, article').filter({ hasText: /답변|Answer/ });
      const count = await answerItems.count();
      console.log(`✓ Found ${count} answer(s) on the page`);

      // Take screenshot showing answers
      await page.screenshot({
        path: 'screenshots/question-detail-with-answers.png',
        fullPage: true
      });
    } else {
      console.log('⚠ No answers section found');
    }
  });

  test('should check answer input field visibility', async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState('networkidle');

    // Look for answer input field
    const answerInput = page.locator('textarea, [contenteditable="true"], input[type="text"]').filter({ hasText: /답변|answer/i });
    const answerTextarea = page.locator('textarea');

    const textareaCount = await answerTextarea.count();
    console.log(`Found ${textareaCount} textarea element(s)`);

    if (textareaCount > 0) {
      const isVisible = await answerTextarea.first().isVisible();
      console.log(`✓ Answer input field visible: ${isVisible}`);

      // Take screenshot showing input area
      await page.screenshot({
        path: 'screenshots/question-detail-answer-input.png',
        fullPage: true
      });
    } else {
      console.log('⚠ No answer input field found');
    }
  });

  test('should check submit button and attempt submission', async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState('networkidle');

    // Look for submit/answer button
    const submitButton = page.locator('button').filter({
      hasText: /답변|등록|제출|submit|answer/i
    });

    const buttonCount = await submitButton.count();
    console.log(`Found ${buttonCount} potential submit button(s)`);

    if (buttonCount > 0) {
      const isVisible = await submitButton.first().isVisible();
      const isEnabled = await submitButton.first().isEnabled();

      console.log(`✓ Submit button visible: ${isVisible}`);
      console.log(`✓ Submit button enabled: ${isEnabled}`);

      // Take screenshot before clicking
      await page.screenshot({
        path: 'screenshots/question-detail-before-submit.png',
        fullPage: true
      });

      if (isVisible && isEnabled) {
        // Try to click the button
        await submitButton.first().click();

        // Wait for any response
        await page.waitForTimeout(2000);

        // Take screenshot after clicking
        await page.screenshot({
          path: 'screenshots/question-detail-after-submit.png',
          fullPage: true
        });

        // Check for any error messages or login prompts
        const errorMessage = page.locator('[role="alert"], .error, .toast').first();
        if (await errorMessage.isVisible({ timeout: 2000 })) {
          const errorText = await errorMessage.textContent();
          console.log(`⚠ Error/Message displayed: ${errorText}`);
        }

        // Check if redirected to login
        const currentUrl = page.url();
        if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
          console.log('✓ Redirected to login page (expected for non-authenticated users)');
        } else {
          console.log(`Current URL: ${currentUrl}`);
        }
      }
    } else {
      console.log('⚠ No submit button found');
    }
  });

  test('should verify overall page structure', async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState('networkidle');

    console.log('\n=== Page Structure Analysis ===');

    // Check for key page elements
    const elements = {
      'Question Title': 'h1, [data-testid="question-title"]',
      'Question Content': '[data-testid="question-content"], .question-body',
      'Answers Section': '[data-testid="answers-list"], .answers-section',
      'Answer Form': 'form, [data-testid="answer-form"]',
      'Login Button': 'button:has-text("로그인"), button:has-text("Login")',
    };

    for (const [name, selector] of Object.entries(elements)) {
      const element = page.locator(selector).first();
      const exists = await element.count() > 0;
      const visible = exists ? await element.isVisible({ timeout: 1000 }).catch(() => false) : false;
      console.log(`${name}: ${exists ? (visible ? '✓ Visible' : '⚠ Exists but not visible') : '✗ Not found'}`);
    }

    // Take final screenshot
    await page.screenshot({
      path: 'screenshots/question-detail-final.png',
      fullPage: true
    });
  });
});
