/**
 * tests/regression.mjs
 *
 * Browser regression checks for circuit controls, zoom restore,
 * membrane reset firing, and mobile section stability.
 *
 * Can be run standalone: node tests/regression.mjs
 * Or with custom URL: SITE_URL=http://127.0.0.1:8010 node tests/regression.mjs
 */
import {
  runSuite,
  devices,
  assert,
  saveScreenshot,
  getStageScale,
  waitForCircuit,
  waitForPageMode
} from "./harness.mjs";

async function activePanel(page) {
  return page.evaluate(() => {
    const on = document.querySelector("#sections section.is-on");
    return on ? on.getAttribute("data-panel") : null;
  });
}

/**
 * Test 1: Desktop controls rail in page mode.
 */
async function testDesktopControlsInPageMode({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=reg`, { waitUntil: "networkidle" });
  await page.locator('.hotspot[data-i="0"]').click();
  await waitForPageMode(page);

  const visible = await page.evaluate(() => {
    const bar = document.querySelector(".controls");
    if (!bar) return false;
    return window.getComputedStyle(bar).display !== "none";
  });
  assert(visible, "Desktop page mode should show the bottom controls bar");
  await page.close();
}

/**
 * Test 2: Desktop zoom restore after closing inset minimap.
 */
async function testDesktopZoomAfterInset({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=reg`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  const fullScale = await getStageScale(page);
  assert(fullScale > 1, `Expected full-circuit scale > 1, got ${fullScale}`);

  await page.locator('.hotspot[data-i="1"]').click();
  await waitForPageMode(page);
  await page.waitForTimeout(780);

  await page.locator("#inset-home").click();
  await waitForCircuit(page);
  await page.waitForTimeout(780);

  const afterScale = await getStageScale(page);
  assert(
    afterScale >= fullScale * 0.92,
    `Circuit should fully zoom after closing inset: ${afterScale} vs ${fullScale}`
  );
  await page.close();
}

/**
 * Test 3: Membrane firing and reset switch activation.
 */
async function testMembraneFiring({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=reg`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  // Navigate to section 3 first so voltage accumulates
  await page.evaluate(() => {
    const nextBtn = document.getElementById("next");
    if (nextBtn) {
      nextBtn.click();
      nextBtn.click();
    }
  });
  await page.waitForTimeout(400);

  // Trigger membrane reset switch via #reset-btn
  const resetBtn = page.locator("#reset-btn");
  assert((await resetBtn.count()) > 0, "Reset button #reset-btn not found");
  await resetBtn.click();

  // Verify switch closes immediately and #sym-reset gets .is-hot
  const activeState = await page.evaluate(() => {
    const sym = document.getElementById("sym-reset");
    const blade = document.getElementById("reset-blade");
    return {
      isHot: sym ? sym.classList.contains("is-hot") : false,
      bladeD: blade ? blade.getAttribute("d") : null
    };
  });

  assert(activeState.isHot, "Expected #sym-reset to have class 'is-hot' during membrane reset");
  assert(
    activeState.bladeD === "M442 462 L442 500",
    `Expected reset blade closed path "M442 462 L442 500", got "${activeState.bladeD}"`
  );

  await saveScreenshot(page, "regression_membrane_firing_closed.png");

  // Wait 750ms for switch to open back up
  await page.waitForTimeout(750);

  const releasedState = await page.evaluate(() => {
    const sym = document.getElementById("sym-reset");
    const blade = document.getElementById("reset-blade");
    return {
      isHot: sym ? sym.classList.contains("is-hot") : false,
      bladeD: blade ? blade.getAttribute("d") : null
    };
  });

  assert(!releasedState.isHot, "Expected #sym-reset to remove 'is-hot' after timeout");
  assert(
    releasedState.bladeD === "M442 462 L460 496",
    `Expected reset blade open path "M442 462 L460 496", got "${releasedState.bladeD}"`
  );

  await page.close();
}

/**
 * Test 4: Mobile section stability (no accidental flip during animation).
 */
async function testMobileSectionStable({ browser, baseUrl }) {
  const iphone = devices["iPhone 13"];
  const page = await browser.newPage({
    ...iphone,
    viewport: iphone.viewport
  });
  await page.goto(`${baseUrl}/?v=reg`, { waitUntil: "networkidle" });
  await page.locator('.hotspot[data-i="0"]').click();
  await waitForPageMode(page);
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

/**
 * Test 5: Mobile scrolling inside sections does not flip active section.
 */
async function testMobileScrollDoesNotFlipSection({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseUrl}/?v=reg#experience`, { waitUntil: "networkidle" });
  await waitForPageMode(page);
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

export const tests = [
  ["desktop controls in page mode", testDesktopControlsInPageMode],
  ["desktop zoom after inset", testDesktopZoomAfterInset],
  ["membrane firing & reset switch", testMembraneFiring],
  ["mobile section stable", testMobileSectionStable],
  ["mobile scroll no flip", testMobileScrollDoesNotFlipSection]
];

// CLI execution support
if (process.argv[1] && process.argv[1].endsWith("regression.mjs")) {
  runSuite("Regression Suite", tests)
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
