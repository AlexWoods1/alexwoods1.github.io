/**
 * Browser regression checks for circuit zoom and mobile page stability.
 * Usage: SITE_URL=http://127.0.0.1:8010 node tests/regression.mjs
 */
import { chromium, devices } from "playwright";

const BASE = process.env.SITE_URL || "http://127.0.0.1:8010";
const CACHE = process.env.CACHE_BUST || "23";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function stageScale(page) {
  return page.evaluate(() => {
    var stage = document.getElementById("stage");
    if (!stage) return 0;
    var t = stage.style.transform || "";
    var m = t.match(/scale\(([\d.]+)\)/);
    return m ? parseFloat(m[1]) : 0;
  });
}

async function activePanel(page) {
  return page.evaluate(() => {
    var on = document.querySelector("#sections section.is-on");
    return on ? on.getAttribute("data-panel") : null;
  });
}

async function waitCircuit(page) {
  await page.waitForFunction(() => document.body.classList.contains("circuit-on"));
}

async function testDesktopControlsInPageMode(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/?v=${CACHE}`, { waitUntil: "networkidle" });
  await page.locator('.hotspot[data-i="0"]').click();
  await page.waitForFunction(() => document.body.classList.contains("page-mode"));
  const visible = await page.evaluate(() => {
    var bar = document.querySelector(".controls");
    if (!bar) return false;
    return window.getComputedStyle(bar).display !== "none";
  });
  assert(visible, "Desktop page mode should show the bottom controls bar");
  await page.close();
}

async function testDesktopZoomAfterInset(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/?v=${CACHE}`, { waitUntil: "networkidle" });
  await waitCircuit(page);
  const fullScale = await stageScale(page);
  assert(fullScale > 1, `Expected full-circuit scale > 1, got ${fullScale}`);

  await page.locator('.hotspot[data-i="1"]').click();
  await page.waitForFunction(() => document.body.classList.contains("page-mode"));
  await page.waitForTimeout(780);

  await page.locator("#inset-home").click();
  await waitCircuit(page);
  await page.waitForTimeout(780);

  const afterScale = await stageScale(page);
  assert(
    afterScale >= fullScale * 0.92,
    `Circuit should fully zoom after closing inset: ${afterScale} vs ${fullScale}`
  );
  await page.close();
}

async function testMobileSectionStable(browser) {
  const iphone = devices["iPhone 13"];
  const page = await browser.newPage({
    ...iphone,
    viewport: iphone.viewport
  });
  await page.goto(`${BASE}/?v=${CACHE}`, { waitUntil: "networkidle" });
  await page.locator('.hotspot[data-i="0"]').click();
  await page.waitForFunction(() => document.body.classList.contains("page-mode"));
  await page.waitForTimeout(400);

  const first = await activePanel(page);
  assert(first === "0", `Expected panel 0 (about), got ${first}`);

  await page.waitForTimeout(700);
  const still = await activePanel(page);
  assert(still === "0", `Section flipped unexpectedly: ${still}`);

  await page.locator(".inset-jump").nth(2).click();
  await page.waitForTimeout(450);
  const third = await activePanel(page);
  assert(third === "2", `Expected panel 2 after jump 03, got ${third}`);

  await page.close();
}

async function testMobileScrollDoesNotFlipSection(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${BASE}/?v=${CACHE}#experience`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.classList.contains("page-mode"));
  await page.waitForTimeout(350);

  const before = await activePanel(page);
  assert(before === "1", `Expected panel 1 from #experience hash, got ${before}`);

  const box = await page.locator("#sections").boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 80, { steps: 8 });
    await page.mouse.up();
  }
  await page.waitForTimeout(400);

  const after = await activePanel(page);
  assert(after === before, `Scroll should not change section: ${before} -> ${after}`);
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const tests = [
    ["desktop controls in page mode", () => testDesktopControlsInPageMode(browser)],
    ["desktop zoom after inset", () => testDesktopZoomAfterInset(browser)],
    ["mobile section stable", () => testMobileSectionStable(browser)],
    ["mobile scroll no flip", () => testMobileScrollDoesNotFlipSection(browser)]
  ];
  let failed = 0;
  for (const [name, fn] of tests) {
    try {
      await fn();
      console.log(`ok  ${name}`);
    } catch (e) {
      failed++;
      console.error(`fail ${name}: ${e.message}`);
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
