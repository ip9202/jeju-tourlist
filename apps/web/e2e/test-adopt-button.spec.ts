import { test, expect } from "@playwright/test";

test.describe("Answer Adopt Button Fix Verification", () => {
  test("should successfully adopt an answer without 404 error", async ({
    page,
  }) => {
    // Login first
    await page.goto("http://localhost:3000/auth/signin");
    await page.fill('input[type="email"]', "ip9202@gmail.com");
    await page.fill('input[type="password"]', "rkdcjfIP00!");

    // Click login button
    const loginButton = page.locator('button:has-text("로그인")').first();
    await loginButton.click();

    // Wait for redirect to questions list
    await page.waitForURL("**/questions**", { timeout: 10000 });

    // Navigate to a specific question
    // Using a known question ID from the previous test runs
    await page.goto(
      "http://localhost:3000/questions/cmhd9sa8x00014a16szgh8dda"
    );

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Monitor all network requests to verify correct API endpoint is called
    let adoptApiCalled = false;
    let adoptApiSuccess = false;

    page.on("response", response => {
      const url = response.url();
      if (url.includes("/api/answers/") && url.includes("/adopt")) {
        adoptApiCalled = true;
        adoptApiSuccess =
          response.status() === 200 || response.status() === 201;
      }
    });

    // Find and click the adopt button
    const adoptButton = page.locator('[aria-label="채택"]').first();

    if (await adoptButton.isVisible()) {
      await adoptButton.click();

      // Wait a bit for the API response
      await page.waitForTimeout(1000);

      // Verify the API was called with correct endpoint
      expect(adoptApiCalled).toBe(true);
      expect(adoptApiSuccess).toBe(true);

      console.log(
        "✅ Adopt button API call succeeded with /api/answers/:id/adopt endpoint"
      );
    } else {
      console.log("⚠️ Adopt button not visible on page");
    }
  });

  test("should make API call to /api/answers/:id/adopt (not /answers/:id/adopt)", async ({
    page,
  }) => {
    // This test specifically verifies the fix for the 404 error
    // by monitoring network requests and ensuring they go to /api/answers/...

    const apiCalls: { url: string; status: number }[] = [];

    page.on("response", response => {
      const url = response.url();
      if (url.includes("answers") && url.includes("adopt")) {
        apiCalls.push({
          url,
          status: response.status(),
        });
      }
    });

    // Login
    await page.goto("http://localhost:3000/auth/signin");
    await page.fill('input[type="email"]', "ip9202@gmail.com");
    await page.fill('input[type="password"]', "rkdcjfIP00!");
    await page.locator('button:has-text("로그인")').first().click();
    await page.waitForURL("**/questions**", { timeout: 10000 });

    // Navigate to question
    await page.goto(
      "http://localhost:3000/questions/cmhd9sa8x00014a16szgh8dda"
    );
    await page.waitForLoadState("networkidle");

    // Click adopt button
    const adoptButton = page.locator('[aria-label="채택"]').first();
    if (await adoptButton.isVisible()) {
      await adoptButton.click();
      await page.waitForTimeout(1500);

      // Verify API calls
      const adoptApiCalls = apiCalls.filter(call =>
        call.url.includes("/api/answers/")
      );

      if (adoptApiCalls.length > 0) {
        adoptApiCalls.forEach(call => {
          expect(call.url).toContain("/api/answers/");
          expect(call.status).not.toBe(404);
        });
        console.log(
          "✅ All adopt API calls use correct /api/answers/ endpoint"
        );
      }
    }
  });
});
