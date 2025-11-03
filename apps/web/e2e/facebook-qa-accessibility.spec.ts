/**
 * Accessibility Tests for Facebook Q&A System
 * Tests WCAG 2.1 Level AA compliance using axe-core
 *
 * Coverage:
 * - Color contrast ratios
 * - ARIA attributes and roles
 * - Keyboard navigation
 * - Semantic HTML structure
 * - Form labels and validation
 * - Heading hierarchy
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Facebook Q&A - Accessibility Compliance", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("should have no WCAG 2.1 Level AA violations on question detail page", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    console.log(
      `✓ Accessibility scan completed: ${accessibilityScanResults.violations.length} violations found`
    );

    if (accessibilityScanResults.violations.length > 0) {
      console.log("\n⚠️  WCAG Violations Found:");
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.id} (${violation.impact})`);
        console.log(`   Description: ${violation.description}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Elements affected: ${violation.nodes.length}`);
        violation.nodes.slice(0, 2).forEach((node, nodeIndex) => {
          console.log(
            `   - Element ${nodeIndex + 1}: ${node.html.substring(0, 100)}...`
          );
        });
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have no color contrast violations", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2aa"])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === "color-contrast"
    );

    console.log(
      `✓ Color contrast check: ${contrastViolations.length} violations found`
    );

    if (contrastViolations.length > 0) {
      console.log("\n⚠️  Color Contrast Violations:");
      contrastViolations.forEach(violation => {
        console.log(`   - ${violation.help}`);
        violation.nodes.forEach(node => {
          console.log(`     Element: ${node.html.substring(0, 80)}...`);
          console.log(
            `     Issue: ${node.any.map(check => check.message).join(", ")}`
          );
        });
      });
    }

    expect(contrastViolations).toEqual([]);
  });

  test("should have proper ARIA attributes on interactive elements", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const ariaViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id.includes("aria") ||
        violation.id.includes("button-name") ||
        violation.id.includes("link-name")
    );

    console.log(
      `✓ ARIA attributes check: ${ariaViolations.length} violations found`
    );

    if (ariaViolations.length > 0) {
      console.log("\n⚠️  ARIA Attribute Violations:");
      ariaViolations.forEach(violation => {
        console.log(`   - ${violation.id}: ${violation.help}`);
        violation.nodes.slice(0, 3).forEach(node => {
          console.log(`     Element: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(ariaViolations).toEqual([]);
  });

  test("should have semantic HTML structure", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["best-practice"])
      .analyze();

    const semanticViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id.includes("landmark") ||
        violation.id.includes("region") ||
        violation.id.includes("heading")
    );

    console.log(
      `✓ Semantic HTML check: ${semanticViolations.length} violations found`
    );

    if (semanticViolations.length > 0) {
      console.log("\n⚠️  Semantic HTML Violations:");
      semanticViolations.forEach(violation => {
        console.log(`   - ${violation.id}: ${violation.help}`);
      });
    }

    expect(semanticViolations).toEqual([]);
  });

  test("should have proper form labels and validation", async ({ page }) => {
    // Check if answer input form exists
    const answerForm = page.locator("form, textarea").first();
    const formExists = (await answerForm.count()) > 0;

    if (!formExists) {
      console.log("ℹ️  No form elements found on page (may require login)");
      return;
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const formViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id.includes("label") ||
        violation.id.includes("form-field-multiple-labels") ||
        violation.id.includes("input")
    );

    console.log(
      `✓ Form labels check: ${formViolations.length} violations found`
    );

    if (formViolations.length > 0) {
      console.log("\n⚠️  Form Label Violations:");
      formViolations.forEach(violation => {
        console.log(`   - ${violation.id}: ${violation.help}`);
        violation.nodes.forEach(node => {
          console.log(`     Element: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(formViolations).toEqual([]);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["best-practice"])
      .analyze();

    const headingViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes("heading-order")
    );

    console.log(
      `✓ Heading hierarchy check: ${headingViolations.length} violations found`
    );

    if (headingViolations.length > 0) {
      console.log("\n⚠️  Heading Hierarchy Violations:");
      headingViolations.forEach(violation => {
        console.log(`   - ${violation.help}`);
        violation.nodes.forEach(node => {
          console.log(`     Element: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(headingViolations).toEqual([]);
  });

  test("should support keyboard navigation on Facebook Q&A components", async ({
    page,
  }) => {
    // Test keyboard focus on interactive elements
    const interactiveElements = [
      'button:has-text("좋아요")',
      'button:has-text("싫어요")',
      'button:has-text("답글")',
      "textarea",
    ];

    console.log("✓ Testing keyboard navigation:");

    for (const selector of interactiveElements) {
      const element = page.locator(selector).first();
      const elementCount = await element.count();

      if (elementCount > 0) {
        await element.focus();
        const isFocused = await element.evaluate(el => {
          return document.activeElement === el;
        });

        console.log(
          `   - ${selector}: ${isFocused ? "✓ Focusable" : "✗ Not focusable"}`
        );
        expect(isFocused).toBe(true);
      } else {
        console.log(`   - ${selector}: Not found (may require login)`);
      }
    }
  });

  test("should have no critical accessibility violations on answer list", async ({
    page,
  }) => {
    // Check if answers exist
    const answerList = page
      .locator('[data-testid="facebook-answer-item"]')
      .first();
    const answersExist = (await answerList.count()) > 0;

    if (!answersExist) {
      console.log("ℹ️  No answers found on page");
      return;
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[data-testid="facebook-answer-item"]')
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.impact === "critical" || violation.impact === "serious"
    );

    console.log(
      `✓ Answer list accessibility: ${criticalViolations.length} critical/serious violations found`
    );

    if (criticalViolations.length > 0) {
      console.log("\n⚠️  Critical/Serious Violations in Answer List:");
      criticalViolations.forEach(violation => {
        console.log(
          `   - ${violation.id} (${violation.impact}): ${violation.help}`
        );
        violation.nodes.slice(0, 2).forEach(node => {
          console.log(`     Element: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(criticalViolations).toEqual([]);
  });

  test("should have accessible badge components", async ({ page }) => {
    // Check if badges exist
    const badges = page.locator('[class*="badge"]').first();
    const badgesExist = (await badges.count()) > 0;

    if (!badgesExist) {
      console.log("ℹ️  No badge components found on page");
      return;
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('[class*="badge"]')
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    console.log(
      `✓ Badge accessibility: ${accessibilityScanResults.violations.length} violations found`
    );

    if (accessibilityScanResults.violations.length > 0) {
      console.log("\n⚠️  Badge Accessibility Violations:");
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`   - ${violation.id}: ${violation.help}`);
      });
    }

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have accessible nested reply structure", async ({ page }) => {
    // Look for nested replies
    const nestedReplies = page.locator('[class*="ml-"]').filter({
      has: page.locator('button:has-text("답글")'),
    });
    const hasNestedReplies = (await nestedReplies.count()) > 0;

    if (!hasNestedReplies) {
      console.log("ℹ️  No nested replies found on page");
      return;
    }

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const nestingViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id.includes("nested") ||
        violation.id.includes("list") ||
        violation.id.includes("definition-list")
    );

    console.log(
      `✓ Nested reply structure: ${nestingViolations.length} violations found`
    );

    if (nestingViolations.length > 0) {
      console.log("\n⚠️  Nested Structure Violations:");
      nestingViolations.forEach(violation => {
        console.log(`   - ${violation.id}: ${violation.help}`);
      });
    }

    expect(nestingViolations).toEqual([]);
  });
});

test.describe("Facebook Q&A - Screen Reader Compatibility", () => {
  const questionId = "cmhbvi9y400ossda2zjbif9ug";
  const questionUrl = `http://localhost:3000/questions/${questionId}`;

  test.beforeEach(async ({ page }) => {
    await page.goto(questionUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
  });

  test("should have meaningful link text", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const linkViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id === "link-name" || violation.id === "link-in-text-block"
    );

    console.log(`✓ Link text check: ${linkViolations.length} violations found`);

    if (linkViolations.length > 0) {
      console.log("\n⚠️  Link Text Violations:");
      linkViolations.forEach(violation => {
        console.log(`   - ${violation.help}`);
        violation.nodes.forEach(node => {
          console.log(`     Link: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(linkViolations).toEqual([]);
  });

  test("should have proper image alt text", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const imageViolations = accessibilityScanResults.violations.filter(
      violation =>
        violation.id === "image-alt" || violation.id === "image-redundant-alt"
    );

    console.log(
      `✓ Image alt text check: ${imageViolations.length} violations found`
    );

    if (imageViolations.length > 0) {
      console.log("\n⚠️  Image Alt Text Violations:");
      imageViolations.forEach(violation => {
        console.log(`   - ${violation.help}`);
        violation.nodes.forEach(node => {
          console.log(`     Image: ${node.html.substring(0, 80)}...`);
        });
      });
    }

    expect(imageViolations).toEqual([]);
  });

  test("should have accessible focus indicators", async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const focusViolations = accessibilityScanResults.violations.filter(
      violation => violation.id.includes("focus")
    );

    console.log(
      `✓ Focus indicators check: ${focusViolations.length} violations found`
    );

    if (focusViolations.length > 0) {
      console.log("\n⚠️  Focus Indicator Violations:");
      focusViolations.forEach(violation => {
        console.log(`   - ${violation.help}`);
      });
    }

    expect(focusViolations).toEqual([]);
  });
});
