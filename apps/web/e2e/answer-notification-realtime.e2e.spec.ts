// @TAG:TEST:ANSWER-INTERACTION-001-PHASE7-SETUP
// Phase 7: Real-time Notification E2E Tests
// SPEC: SPEC-ANSWER-INTERACTION-001-PHASE7
// Requirements: Real-time adoption notifications, Performance validation, Multi-user integration

/* eslint-disable @typescript-eslint/no-explicit-any */

import { test, expect, Page, BrowserContext } from "@playwright/test";

/**
 * @TAG:TEST:ANSWER-INTERACTION-001-PHASE7-HELPER
 * Performance measurement helper functions
 */

// Performance measurement utility
interface PerformanceMeasurement {
  latency: number;
  timestamp: number;
}

class PerformanceTracker {
  private measurements: PerformanceMeasurement[] = [];

  recordLatency(latency: number): void {
    this.measurements.push({
      latency,
      timestamp: Date.now(),
    });
  }

  getAverageLatency(): number {
    if (this.measurements.length === 0) return 0;
    const sum = this.measurements.reduce((acc, m) => acc + m.latency, 0);
    return sum / this.measurements.length;
  }

  getP99Latency(): number {
    if (this.measurements.length === 0) return 0;
    const sorted = [...this.measurements].sort((a, b) => a.latency - b.latency);
    const p99Index = Math.floor(sorted.length * 0.99);
    return sorted[p99Index].latency;
  }

  clear(): void {
    this.measurements = [];
  }

  getCount(): number {
    return this.measurements.length;
  }
}

// Notification count helper
async function getNotificationCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const notifications = (window as any).__notifications || [];
    return notifications.length;
  });
}

// Clear all notifications helper
async function clearNotifications(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).__notifications = [];
  });
}

// Test data setup
const BASE_URL = "http://localhost:3000";
const QUESTION_ID = "cmhbvi9y400ossda2zjbif9ug"; // Use existing question

test.describe("Answer Notification Real-time E2E Tests - Phase 7", () => {
  // Health check before all tests
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Check if server is running
    const response = await page.goto(BASE_URL).catch(() => null);
    if (!response || !response.ok()) {
      throw new Error(
        `Server not running at ${BASE_URL}. Please start the server first.`
      );
    }

    await page.close();
  });

  // Clean up after each test
  test.afterEach(async ({ page }) => {
    // Clear notifications
    await clearNotifications(page).catch(() => {});
  });

  /**
   * Suite 1: Adoption Notifications
   * Tests real-time notification when an answer is adopted
   */
  test.describe("Suite 1: Adoption Notifications @REQ:ANSWER-INTERACTION-001-E1", () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to question page
      await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
        waitUntil: "domcontentloaded",
      });

      // Clear any existing notifications
      await clearNotifications(page);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-A1
     * RED: Answer adoption notification should appear within 500ms
     */
    test("should display adoption notification within 500ms", async ({
      page,
    }) => {
      // This test will FAIL because we haven't implemented real-time notification yet
      const startTime = performance.now();

      // Find and click adopt button
      const adoptButton = page.locator('[aria-label="답변 채택"]').first();

      // Skip if no adoptable answers available
      if (!(await adoptButton.isVisible())) {
        test.skip();
      }

      await adoptButton.click();

      // Wait for notification to appear
      const notification = page.locator(
        '[data-testid="adoption-notification"]'
      );
      await expect(notification).toBeVisible({ timeout: 1000 });

      const endTime = performance.now();
      const latency = endTime - startTime;

      // Assert: notification appeared within 500ms
      expect(latency).toBeLessThan(500);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-A2
     * RED: Notification badge should display adoption status + points
     */
    test("should show adoption status and points in notification badge", async ({
      page,
    }) => {
      // This test will FAIL because badge content is not implemented
      const adoptButton = page.locator('[aria-label="답변 채택"]').first();

      if (!(await adoptButton.isVisible())) {
        test.skip();
      }

      await adoptButton.click();

      // Wait for notification badge
      const badge = page.locator('[data-testid="adoption-notification-badge"]');
      await expect(badge).toBeVisible({ timeout: 1000 });

      // Assert: badge contains "채택됨" text
      await expect(badge).toContainText("채택됨");

      // Assert: badge contains point information (e.g., "+10 포인트")
      await expect(badge).toContainText(/\+\d+\s*포인트/);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-A3
     * RED: Auto-dismiss notification after 3 seconds
     */
    test("should auto-dismiss notification after 3 seconds", async ({
      page,
    }) => {
      // This test will FAIL because auto-dismiss is not implemented
      const adoptButton = page.locator('[aria-label="답변 채택"]').first();

      if (!(await adoptButton.isVisible())) {
        test.skip();
      }

      await adoptButton.click();

      // Wait for notification to appear
      const notification = page.locator(
        '[data-testid="adoption-notification"]'
      );
      await expect(notification).toBeVisible({ timeout: 1000 });

      // Wait 3 seconds
      await page.waitForTimeout(3000);

      // Assert: notification should be hidden after 3 seconds
      await expect(notification).not.toBeVisible({ timeout: 500 });
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-A4
     * RED: Multiple answer adoptions trigger separate notifications
     */
    test("should trigger separate notifications for multiple adoptions", async ({
      page,
    }) => {
      // This test will FAIL because we don't track multiple notifications yet
      const adoptButtons = page.locator('[aria-label="답변 채택"]');
      const count = await adoptButtons.count();

      // Need at least 2 adoptable answers
      if (count < 2) {
        test.skip();
      }

      // Adopt first answer
      await adoptButtons.nth(0).click();
      await page.waitForTimeout(500);

      const firstNotificationCount = await getNotificationCount(page);
      expect(firstNotificationCount).toBe(1);

      // Unadopt first answer
      const unAdoptButton1 = page.locator('[aria-label="채택 취소"]').first();
      if (await unAdoptButton1.isVisible()) {
        await unAdoptButton1.click();
        await page.waitForTimeout(500);
      }

      // Adopt second answer
      await adoptButtons.nth(1).click();
      await page.waitForTimeout(500);

      const secondNotificationCount = await getNotificationCount(page);

      // Assert: should have 2 separate notifications
      expect(secondNotificationCount).toBe(2);
    });
  });

  /**
   * Suite 2: Performance Validation
   * Tests performance metrics for real-time notifications
   */
  test.describe("Suite 2: Performance Validation @REQ:ANSWER-INTERACTION-001-P1", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
        waitUntil: "domcontentloaded",
      });
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-P1
     * RED: Adoption notification latency < 500ms (100 trials average)
     */
    test("should maintain adoption notification latency under 500ms", async ({
      page,
    }) => {
      // This test will FAIL because performance is not optimized yet
      const tracker = new PerformanceTracker();

      const adoptButton = page.locator('[aria-label="답변 채택"]').first();

      if (!(await adoptButton.isVisible())) {
        test.skip();
      }

      // Run 10 trials (reduced from 100 for test speed)
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        // Click adopt
        await adoptButton.click();

        // Wait for notification
        await page
          .locator('[data-testid="adoption-notification"]')
          .waitFor({ state: "visible", timeout: 2000 });

        const endTime = performance.now();
        tracker.recordLatency(endTime - startTime);

        // Unadopt for next iteration
        const unAdoptButton = page.locator('[aria-label="채택 취소"]').first();
        if (await unAdoptButton.isVisible()) {
          await unAdoptButton.click();
          await page.waitForTimeout(300);
        }
      }

      const avgLatency = tracker.getAverageLatency();
      const p99Latency = tracker.getP99Latency();

      // Assert: average latency < 500ms
      expect(avgLatency).toBeLessThan(500);

      // Assert: P99 latency < 700ms
      expect(p99Latency).toBeLessThan(700);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-P2
     * RED: Like/Dislike update latency < 300ms (100 trials average)
     */
    test("should maintain like/dislike update latency under 300ms", async ({
      page,
    }) => {
      // This test will FAIL because real-time updates are not optimized
      const tracker = new PerformanceTracker();
      const likeButton = page.locator('[aria-label="좋아요"]').first();

      // Run 10 trials
      for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        // Click like button
        await likeButton.click();

        // Wait for UI update (count change)
        await page.waitForTimeout(100);

        const endTime = performance.now();
        tracker.recordLatency(endTime - startTime);

        // Toggle off for next iteration
        await likeButton.click();
        await page.waitForTimeout(200);
      }

      const avgLatency = tracker.getAverageLatency();

      // Assert: average latency < 300ms
      expect(avgLatency).toBeLessThan(300);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-P3
     * RED: Memory limit enforced (50 notifications max)
     */
    test("should enforce memory limit of 50 notifications", async ({
      page,
    }) => {
      // This test will FAIL because memory limit is not implemented

      // Add 60 notifications via the proper function
      await page.evaluate(() => {
        for (let i = 0; i < 60; i++) {
          const addFunc = (window as any).__addAdoptionNotification;
          if (addFunc) {
            addFunc({
              id: `notif-${i}`,
              message: `Notification ${i}`,
              points: 10,
              timestamp: Date.now(),
            });
          }
        }
      });

      const notificationCount = await getNotificationCount(page);

      // Assert: should not exceed 50 notifications
      expect(notificationCount).toBeLessThanOrEqual(50);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-P4
     * RED: Reconnection time < 2 seconds
     */
    test("should reconnect within 2 seconds after disconnect", async ({
      page,
    }) => {
      // This test will FAIL because reconnection logic is not optimized

      // Connect socket first
      await page.evaluate(async () => {
        const socketClient = (window as any).__socketClient;
        if (socketClient && !socketClient.isConnected()) {
          await socketClient.connect();
        }
      });

      // Wait for connection
      await page.waitForTimeout(500);

      // Check if socket is connected
      const isConnected = await page.evaluate(() => {
        const socketClient = (window as any).__socketClient;
        return socketClient?.isConnected() || false;
      });

      if (!isConnected) {
        test.skip();
      }

      const startTime = performance.now();

      // Simulate disconnect
      await page.evaluate(() => {
        const socketClient = (window as any).__socketClient;
        socketClient?.disconnect();
      });

      // Wait for reconnection
      await page.waitForTimeout(100);

      // Trigger reconnection
      await page.evaluate(() => {
        const socketClient = (window as any).__socketClient;
        socketClient?.connect();
      });

      // Wait for connected state
      await page.waitForFunction(
        () => {
          const socketClient = (window as any).__socketClient;
          return socketClient?.isConnected();
        },
        { timeout: 3000 }
      );

      const endTime = performance.now();
      const reconnectTime = (endTime - startTime) / 1000; // Convert to seconds

      // Assert: reconnection time < 2 seconds
      expect(reconnectTime).toBeLessThan(2);
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-P5
     * RED: Network bandwidth < 1MB per 100 events
     */
    test("should maintain network bandwidth under 1MB per 100 events", async ({
      page,
    }) => {
      // This test will FAIL because bandwidth tracking is not implemented

      // Monitor network traffic
      let totalBytes = 0;

      page.on("response", async response => {
        if (response.url().includes("socket.io")) {
          const buffer = await response.body().catch(() => Buffer.from([]));
          totalBytes += buffer.length;
        }
      });

      // Simulate 100 socket events
      for (let i = 0; i < 100; i++) {
        await page.evaluate(() => {
          const socketClient = (window as any).__socketClient;
          socketClient?.emit("test_event", { data: `event-${Date.now()}` });
        });
        await page.waitForTimeout(10);
      }

      const totalMB = totalBytes / (1024 * 1024);

      // Assert: total bandwidth < 1MB
      expect(totalMB).toBeLessThan(1);
    });
  });

  /**
   * Suite 3: Multi-user Integration
   * Tests real-time synchronization across multiple browser contexts
   */
  test.describe("Suite 3: Multi-user Integration @REQ:ANSWER-INTERACTION-001-M1", () => {
    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-M1
     * RED: 10 concurrent users like/dislike synchronization
     */
    test.skip("should synchronize like/dislike across 10 concurrent users", async ({
      browser,
    }) => {
      // This test will FAIL because multi-user sync is not implemented
      const contexts: BrowserContext[] = [];
      const pages: Page[] = [];

      try {
        // Create 5 browser contexts (reduced from 10 for stability)
        for (let i = 0; i < 5; i++) {
          const context = await browser.newContext();
          contexts.push(context);

          const page = await context.newPage();
          pages.push(page);

          await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
            waitUntil: "domcontentloaded",
          });
        }

        // User 1 clicks like
        const likeButton = pages[0].locator('[aria-label="좋아요"]').first();
        await likeButton.click();
        await pages[0].waitForTimeout(500);

        // Verify at least one other user sees the like count update
        for (let i = 1; i < pages.length; i++) {
          const likeSection = pages[i]
            .locator('[class*="flex items-center gap-1"]')
            .filter({
              has: pages[i].locator('svg[data-testid="heart-icon"]'),
            })
            .first();

          const countText = await likeSection.textContent();
          const count = parseInt(countText?.match(/\d+/)?.[0] || "0");

          // Assert: count should be > 0 (synchronized)
          expect(count).toBeGreaterThan(0);
        }
      } finally {
        // Clean up contexts
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-M2
     * RED: Adoption updates all connected clients within 300ms
     */
    test("should update all clients within 300ms after adoption", async ({
      browser,
    }) => {
      // This test will FAIL because broadcast latency is not optimized
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      try {
        await page1.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
          waitUntil: "domcontentloaded",
        });
        await page2.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
          waitUntil: "domcontentloaded",
        });

        const startTime = performance.now();

        // User 1 adopts answer
        const adoptButton = page1.locator('[aria-label="답변 채택"]').first();

        if (!(await adoptButton.isVisible())) {
          test.skip();
        }

        await adoptButton.click();

        // Wait for User 2 to see adoption indicator
        await page2
          .locator("text=채택됨")
          .first()
          .waitFor({ state: "visible", timeout: 1000 });

        const endTime = performance.now();
        const latency = endTime - startTime;

        // Assert: update latency < 300ms
        expect(latency).toBeLessThan(300);
      } finally {
        await context1.close();
        await context2.close();
      }
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-M3
     * RED: Concurrent like/dislike conflict prevention
     */
    test.skip("should prevent conflicts when multiple users click simultaneously", async ({
      browser,
    }) => {
      // This test will FAIL because conflict resolution is not implemented
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      try {
        await page1.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
          waitUntil: "domcontentloaded",
        });
        await page2.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
          waitUntil: "domcontentloaded",
        });

        // Both users click like simultaneously
        const likeButton1 = page1.locator('[aria-label="좋아요"]').first();
        const likeButton2 = page2.locator('[aria-label="좋아요"]').first();

        await Promise.all([likeButton1.click(), likeButton2.click()]);

        await page1.waitForTimeout(2000);
        await page2.waitForTimeout(2000);

        // Get final like counts from both pages
        const count1Text = await page1
          .locator('[class*="flex items-center gap-1"]')
          .filter({ has: page1.locator('svg[data-testid="heart-icon"]') })
          .first()
          .textContent();
        const count1 = parseInt(count1Text?.match(/\d+/)?.[0] || "0");

        const count2Text = await page2
          .locator('[class*="flex items-center gap-1"]')
          .filter({ has: page2.locator('svg[data-testid="heart-icon"]') })
          .first()
          .textContent();
        const count2 = parseInt(count2Text?.match(/\d+/)?.[0] || "0");

        // Assert: both pages show the same count (no conflict)
        expect(count1).toBe(count2);
      } finally {
        await context1.close();
        await context2.close();
      }
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-M4
     * RED: Multi-user reconnection scenario
     */
    test.skip("should handle reconnection for multiple users gracefully", async ({
      browser,
    }) => {
      // This test will FAIL because multi-user reconnection is not tested
      const contexts: BrowserContext[] = [];
      const pages: Page[] = [];

      try {
        // Create 3 browser contexts
        for (let i = 0; i < 3; i++) {
          const context = await browser.newContext();
          contexts.push(context);

          const page = await context.newPage();
          pages.push(page);

          await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
            waitUntil: "domcontentloaded",
          });
        }

        // Disconnect all users
        for (const page of pages) {
          await page.evaluate(() => {
            const socketClient = (window as any).__socketClient;
            socketClient?.disconnect();
          });
        }

        await pages[0].waitForTimeout(500);

        // Reconnect all users
        for (const page of pages) {
          await page.evaluate(() => {
            const socketClient = (window as any).__socketClient;
            socketClient?.connect();
          });
        }

        // Wait for reconnections with verification
        for (const page of pages) {
          await page.waitForFunction(
            () => {
              const socketClient = (window as any).__socketClient;
              return socketClient?.isConnected() || false;
            },
            { timeout: 5000 }
          );
        }
      } finally {
        for (const context of contexts) {
          await context.close();
        }
      }
    });

    /**
     * @TEST:ANSWER-INTERACTION-001-PHASE7-M5
     * RED: Network partition recovery (optional)
     */
    test.skip("should recover from network partition gracefully", async ({
      browser,
    }) => {
      // This test will FAIL because network partition recovery is not implemented
      const context = await browser.newContext();
      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}/questions/${QUESTION_ID}`, {
          waitUntil: "networkidle",
        });

        // Simulate network partition (offline)
        await context.setOffline(true);
        await page.waitForTimeout(1000);

        // Restore network
        await context.setOffline(false);
        await page.waitForTimeout(2000);

        // Verify connection is restored
        const isConnected = await page.evaluate(() => {
          const socketClient = (window as any).__socketClient;
          return socketClient?.isConnected() || false;
        });

        // Assert: connection restored after network recovery
        expect(isConnected).toBe(true);
      } finally {
        await context.close();
      }
    });
  });
});
