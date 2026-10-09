#!/usr/bin/env node
/**
 * Zen 2.0 Design System - Automated Invariant Verification Script
 * Uses Playwright to programmatically audit any web page against the 7 Inviolable Invariants.
 * 
 * Usage:
 *   node verify-design.js [URL]
 * Example:
 *   node verify-design.js http://localhost:5173
 */

import { chromium } from 'playwright';

const targetUrl = process.argv[2] || 'http://localhost:5173';

console.log(`\n🔍 Starting Zen 2.0 Design Invariant Audit on: ${targetUrl}\n`);

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failedTests++;
    }
  }

  try {
    // 1. Desktop Audit (1280x800)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    console.log('--- 1. Testing Default Baseline Theme (Desktop) ---');
    const isLightDefault = await page.evaluate(() => {
      const html = document.documentElement;
      return !html.classList.contains('dark') || html.classList.contains('light');
    });
    assert(isLightDefault, 'Page loads in crisp Light Mode by default (Invariant 2)');

    // 2. Mobile Viewport 375px (iPhone SE)
    console.log('\n--- 2. Testing 375px Mobile Viewport (iPhone SE) ---');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    const overflow375 = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth;
    });
    assert(!overflow375, 'Zero horizontal overflow on 375px mobile viewport (Invariant 6)');

    // 3. Mobile Viewport 390px (iPhone 14/15/16)
    console.log('\n--- 3. Testing 390px Mobile Viewport (iPhone 14/15/16) ---');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    const overflow390 = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth;
    });
    assert(!overflow390, 'Zero horizontal overflow on 390px mobile viewport (Invariant 6)');

    // 4. Form Input 16px Font Size Rule
    console.log('\n--- 4. Testing iOS Safari Auto-Zoom Safeguards ---');
    const inputsAudit = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
      if (inputs.length === 0) return { passed: true, count: 0 };
      const smallInputs = inputs.filter(el => {
        const size = parseFloat(window.getComputedStyle(el).fontSize);
        return size < 16;
      });
      return { passed: smallInputs.length === 0, count: inputs.length, failing: smallInputs.length };
    });
    assert(inputsAudit.passed, `All input elements have font-size >= 16px on mobile (Found ${inputsAudit.count} inputs, ${inputsAudit.failing} failing) (Invariant 6)`);

    // 5. Anti-Bubble Geometry Audit
    console.log('\n--- 5. Testing Anti-Bubble Geometry Scale ---');
    const bubbleAudit = await page.evaluate(() => {
      // Find functional UI elements with rounded-full or 9999px radius
      const functionalSelectors = 'button, .card-tactile, .segmented-glass-container, .badge-glass, input';
      const elements = Array.from(document.querySelectorAll(functionalSelectors));
      const bubbly = elements.filter(el => {
        const radius = window.getComputedStyle(el).borderRadius;
        return radius.includes('9999px') || radius === '50%';
      });
      return { passed: bubbly.length === 0, count: elements.length, bubblyCount: bubbly.length };
    });
    assert(bubbleAudit.passed, `No functional UI controls use bloated rounded-full/9999px geometry (Invariant 1)`);

    // 6. Summary Report
    console.log('\n========================================');
    console.log(`Audit Completed: ${passedTests} Passed, ${failedTests} Failed`);
    console.log('========================================\n');

    await browser.close();
    process.exit(failedTests > 0 ? 1 : 0);
  } catch (err) {
    console.error(`Audit error: ${err.message}`);
    await browser.close();
    process.exit(1);
  }
}

runAudit();
