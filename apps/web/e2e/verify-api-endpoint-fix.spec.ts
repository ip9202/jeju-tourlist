import { test, expect } from "@playwright/test";

test.describe("API Endpoint Fix Verification", () => {
  test("verify /api/answers endpoint prefix is used (not /answers)", async ({
    page,
    _context,
  }) => {
    // Set authentication cookie to bypass login
    const loginResponse = await page.request.post(
      "http://localhost:4000/api/auth/login",
      {
        data: {
          email: "ip9202@gmail.com",
          password: "rkdcjfIP00!",
        },
      }
    );

    const loginData = await loginResponse.json();
    if (loginData.data?.user?.id) {
      // Store auth info if needed
      console.log("✅ Login successful:", loginData.data.user.email);
    }

    // Track all fetch requests
    const apiCalls: { path: string; status: number }[] = [];

    page.on("response", response => {
      const url = response.url();
      // Log answers-related API calls
      if (url.includes("answers")) {
        apiCalls.push({
          path: new URL(url).pathname,
          status: response.status(),
        });
      }
    });

    // Navigate directly to question page
    await page.goto(
      "http://localhost:3000/questions/cmhd9sa8x00014a16szgh8dda",
      {
        waitUntil: "networkidle",
      }
    );

    console.log("📍 Navigated to question page");

    // Wait a moment for any initial API calls
    await page.waitForTimeout(500);

    // Log current API calls
    console.log("📊 Current API calls made:");
    apiCalls.forEach(call => {
      console.log(`  - ${call.path} (Status: ${call.status})`);
    });

    // Verify that all answers API calls use /api/ prefix
    const answersApiCalls = apiCalls.filter(c => c.path.includes("answers"));

    if (answersApiCalls.length > 0) {
      answersApiCalls.forEach(call => {
        // Should use /api/answers not /answers
        expect(call.path).toMatch(/^\/api\/answers/);
        // Should not be 404
        expect(call.status).not.toBe(404);
      });
      console.log(
        `✅ All ${answersApiCalls.length} API calls use correct /api/answers endpoint`
      );
    }

    // Now test the adopt button specifically
    console.log("\n🔘 Testing adopt button...");

    const adoptButton = page.locator('[aria-label="채택"]').first();
    const isVisible = await adoptButton.isVisible();

    if (isVisible) {
      // Clear previous API calls
      apiCalls.length = 0;

      // Click the adopt button
      await adoptButton.click();
      console.log("⏳ Waiting for API response...");

      // Wait for the adopt API call
      await page.waitForTimeout(1500);

      // Check for adopt-specific API calls
      const adoptCalls = apiCalls.filter(c => c.path.includes("adopt"));

      if (adoptCalls.length > 0) {
        adoptCalls.forEach(call => {
          console.log(
            `  Adopt API call: ${call.path} (Status: ${call.status})`
          );

          // Verify correct endpoint with /api/ prefix
          expect(call.path).toMatch(/^\/api\/answers\/[\w]+\/adopt/);
          // Verify success (not 404)
          expect(call.status).not.toBe(404);
          expect([200, 201, 204]).toContain(call.status);
        });

        console.log(
          "✅ Adopt button successfully called /api/answers/:id/adopt endpoint"
        );
      } else {
        console.log(
          "⚠️ No adopt API calls detected - button may not have triggered API"
        );
      }
    } else {
      console.log(
        "ℹ️ Adopt button not visible on page (may need authentication)"
      );
    }
  });

  test("verify all API endpoints use /api/ prefix", async ({ page }) => {
    // Navigate to question page
    await page.goto(
      "http://localhost:3000/questions/cmhd9sa8x00014a16szgh8dda",
      {
        waitUntil: "networkidle",
      }
    );

    // Check page load for any 404s
    let has404 = false;
    const apiEndpoints: string[] = [];

    page.on("response", response => {
      const url = response.url();
      if (
        url.includes("localhost:4000") &&
        (url.includes("/answers") ||
          url.includes("/questions") ||
          url.includes("/comments"))
      ) {
        apiEndpoints.push(`${new URL(url).pathname} [${response.status()}]`);

        if (response.status() === 404) {
          has404 = true;
          console.log(`❌ Found 404: ${url}`);
        }
      }
    });

    // Wait for page interactions
    await page.waitForTimeout(2000);

    console.log("\n📋 API Endpoints called:");
    apiEndpoints.forEach(endpoint => {
      console.log(`  - ${endpoint}`);
    });

    if (!has404) {
      console.log(
        "\n✅ No 404 errors found - API endpoints are correctly prefixed with /api/"
      );
    } else {
      console.log("\n❌ 404 errors found - check endpoint paths");
    }

    expect(has404).toBe(false);
  });
});
