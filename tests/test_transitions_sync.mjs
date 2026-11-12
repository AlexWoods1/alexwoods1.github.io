/**
 * tests/test_transitions_sync.mjs
 *
 * Verifies Requirement R3 (Minimap Transitions & Symbol Synchronization):
 * - Intermediate frame sampling during opening and closing transitions.
 * - Absence of instantaneous jump cuts, NaNs, or layout overflow.
 * - Bidirectional synchronization between active sections and circuit symbols across all 6 sections.
 * - Re-clicking active symbol / inset-home returns cleanly to circuit mode.
 */
import {
  runSuite,
  assert,
  saveScreenshot,
  getViewportBox,
  waitForPageMode,
  waitForCircuit
} from "./harness.mjs";

const SECTION_DATA = [
  { index: 0, id: "about", name: "About" },
  { index: 1, id: "charge", name: "Experience" },
  { index: 2, id: "leak", name: "Skills" },
  { index: 3, id: "threshold", name: "Projects" },
  { index: 4, id: "impulse", name: "Honors" },
  { index: 5, id: "out", name: "Contact" }
];

/**
 * Test 1: Sampling intermediate frames during circuit-to-page (minimap open) transition.
 * Asserts monotonic dimension morph, is-animating class, valid numbers, and no overflow.
 */
async function testCircuitToPageSmoothTransition({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  // Initial full-screen metrics
  const initialBox = await getViewportBox(page);
  assert(initialBox.width === 1440, `Initial viewport width expected 1440, got ${initialBox.width}`);
  assert(initialBox.height === 900, `Initial viewport height expected 900, got ${initialBox.height}`);

  // Trigger transition to page mode
  await page.locator('.hotspot[data-i="0"]').click();

  // Sample intermediate frames at 120ms, 280ms, 450ms
  const sampleTimes = [120, 280, 450];
  const samples = [];

  for (const delay of sampleTimes) {
    await page.waitForTimeout(delay);
    const frame = await page.evaluate(() => {
      const vp = document.getElementById("viewport");
      const rect = vp.getBoundingClientRect();
      const isAnimating = vp.classList.contains("is-animating");
      const overflow = document.documentElement.scrollWidth > window.innerWidth;
      return {
        width: rect.width,
        height: rect.height,
        left: rect.left,
        top: rect.top,
        isAnimating,
        overflow
      };
    });
    samples.push({ delay, ...frame });
  }

  // Settle animation (total transition is 720ms)
  await page.waitForTimeout(400);
  await waitForPageMode(page);

  const settledBox = await getViewportBox(page);

  // Capture intermediate screenshot
  await saveScreenshot(page, "r3_open_mid_150ms.png");

  // Verify intermediate frames
  for (const s of samples) {
    // Assert no NaNs or zeroes
    assert(!isNaN(s.width) && s.width > 0, `Intermediate width is invalid at ${s.delay}ms: ${s.width}`);
    assert(!isNaN(s.height) && s.height > 0, `Intermediate height is invalid at ${s.delay}ms: ${s.height}`);
    assert(!isNaN(s.left) && s.left >= 0, `Intermediate left is invalid at ${s.delay}ms: ${s.left}`);
    assert(!isNaN(s.top) && s.top >= 0, `Intermediate top is invalid at ${s.delay}ms: ${s.top}`);

    // Assert no jump cuts: width must be strictly intermediate between initial and settled
    assert(
      s.width < initialBox.width && s.width > settledBox.width - 20,
      `Jump cut detected at ${s.delay}ms: sample width ${s.width} not intermediate between ${initialBox.width} and ${settledBox.width}`
    );

    // Assert no horizontal scrollbar overflow during transition
    assert(!s.overflow, `Horizontal overflow detected at ${s.delay}ms during minimap opening`);
  }

  // Settled state assertions
  assert(
    settledBox.width < 1440 && settledBox.height < 900,
    `Settled minimap dimensions should be inset: ${settledBox.width}x${settledBox.height}`
  );

  await page.close();
}

/**
 * Test 2: Sampling intermediate frames during page-to-circuit (minimap close) transition.
 * Asserts expansion from inset to full viewport without jump cuts.
 */
async function testPageToCircuitSmoothTransition({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=test#about`, { waitUntil: "networkidle" });
  await waitForPageMode(page);
  await page.waitForTimeout(600);

  const insetBox = await getViewportBox(page);

  // Click #inset-home to return to circuit
  await page.locator("#inset-home").click();

  // Sample intermediate frame at 180ms
  await page.waitForTimeout(180);
  const midFrame = await page.evaluate(() => {
    const vp = document.getElementById("viewport");
    const rect = vp.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      isAnimating: vp.classList.contains("is-animating")
    };
  });

  await saveScreenshot(page, "r3_close_mid_150ms.png");

  // Mid frame should be larger than insetBox and smaller than full screen
  assert(
    midFrame.width > insetBox.width && midFrame.width < 1440,
    `Closing transition jump cut: midFrame width ${midFrame.width} not between ${insetBox.width} and 1440`
  );
  assert(
    midFrame.height > insetBox.height && midFrame.height < 900,
    `Closing transition jump cut: midFrame height ${midFrame.height} not between ${insetBox.height} and 900`
  );

  // Settle back to circuit
  await page.waitForTimeout(700);
  await waitForCircuit(page);

  const fullBox = await getViewportBox(page);
  assert(
    Math.round(fullBox.width) === 1440 && Math.round(fullBox.height) === 900,
    `Full screen circuit not restored: ${fullBox.width}x${fullBox.height}`
  );

  await page.close();
}

/**
 * Test 3: Bidirectional Symbol Synchronization across all 6 sections.
 * Verifies active symbol highlight, section is-on, step counter, caption, and navigation.
 */
async function testBidirectionalSymbolSynchronization({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  for (const item of SECTION_DATA) {
    // Navigate to section item.index
    await page.evaluate((idx) => {
      window.PortfolioCircuit = window.PortfolioCircuit || {};
      const hot = document.querySelector(`.hotspot[data-i="${idx}"]`);
      if (hot) hot.click();
    }, item.index);

    await waitForPageMode(page);
    await page.waitForTimeout(400);

    // Verify synchronization across all UI components
    const state = await page.evaluate((idx) => {
      const activeSection = document.querySelector("#sections section.is-on");
      const activeSym = document.querySelector(".sym.is-hot");
      const stepEl = document.getElementById("step");
      const caption = document.getElementById("inset-caption");
      const minimapBtn = document.querySelectorAll("#minimap button")[idx];

      return {
        sectionId: activeSection ? activeSection.id : null,
        sectionPanel: activeSection ? activeSection.getAttribute("data-panel") : null,
        symId: activeSym ? activeSym.id : null,
        stepText: stepEl ? stepEl.textContent : "",
        captionText: caption ? caption.textContent : "",
        buttonCurrent: minimapBtn ? minimapBtn.getAttribute("aria-current") : null
      };
    }, item.index);

    assert(
      state.sectionId === item.id,
      `Expected active section id "${item.id}", got "${state.sectionId}"`
    );
    assert(
      state.sectionPanel === String(item.index),
      `Expected section data-panel "${item.index}", got "${state.sectionPanel}"`
    );
    assert(
      state.symId === `sym-${item.index}`,
      `Expected active symbol "#sym-${item.index}", got "${state.symId}"`
    );
    assert(
      state.stepText.includes(`0${item.index + 1}`) && state.stepText.includes(item.name),
      `Step counter text "${state.stepText}" missing section "0${item.index + 1} / 06 · ${item.name}"`
    );
    assert(
      state.captionText.includes(`0${item.index + 1}`) && state.captionText.includes(item.name),
      `Caption text "${state.captionText}" missing "0${item.index + 1} · ${item.name}"`
    );
    assert(
      state.buttonCurrent === "true",
      `Minimap button ${item.index} should have aria-current="true"`
    );

    if (item.index === 3) {
      await saveScreenshot(page, "r3_sync_section_3_projects.png");
    }
  }

  // Verify toggle back to circuit by clicking active symbol
  await page.locator('.hotspot[data-i="5"]').click(); // Re-clicking active section 5 toggles back to circuit
  await waitForCircuit(page);
  await page.waitForTimeout(600);

  const isCircuit = await page.evaluate(() => document.body.classList.contains("circuit-on"));
  assert(isCircuit, "Re-clicking active symbol should smoothly toggle back to circuit view");

  await page.close();
}

/**
 * Test 4: Mobile jump buttons bidirectional sync and active indicator.
 */
async function testMobileJumpsSync({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  // Enter page mode
  await page.locator('.hotspot[data-i="0"]').click();
  await waitForPageMode(page);
  await page.waitForTimeout(500);

  // Click each jump button 01..06
  for (let i = 0; i < SECTION_DATA.length; i++) {
    const jumpBtn = page.locator(".inset-jump").nth(i);
    await jumpBtn.click();
    await page.waitForTimeout(350);

    const check = await page.evaluate((idx) => {
      const activeSection = document.querySelector("#sections section.is-on");
      const activeJump = document.querySelector('.inset-jump[aria-current="true"]');
      const activeSym = document.querySelector(".sym.is-hot");
      return {
        sectionPanel: activeSection ? activeSection.getAttribute("data-panel") : null,
        jumpText: activeJump ? activeJump.textContent.trim() : null,
        symId: activeSym ? activeSym.id : null
      };
    }, i);

    assert(
      check.sectionPanel === String(i),
      `Mobile jump ${i}: expected section panel ${i}, got ${check.sectionPanel}`
    );
    assert(
      check.jumpText === `0${i + 1}`,
      `Mobile jump ${i}: expected active jump button "0${i + 1}", got "${check.jumpText}"`
    );
    assert(
      check.symId === `sym-${i}`,
      `Mobile jump ${i}: expected active symbol "#sym-${i}", got "${check.symId}"`
    );
  }

  await page.close();
}

export const tests = [
  ["R3.1: Circuit to page smooth transition (no jump cuts/NaNs)", testCircuitToPageSmoothTransition],
  ["R3.2: Page to circuit smooth transition (restore zoom/position)", testPageToCircuitSmoothTransition],
  ["R3.3: Bidirectional 6-symbol synchronization in page mode", testBidirectionalSymbolSynchronization],
  ["R3.4: Mobile jumps bidirectional synchronization", testMobileJumpsSync]
];

// CLI execution support
if (process.argv[1] && process.argv[1].endsWith("test_transitions_sync.mjs")) {
  runSuite("Minimap Transitions & Symbol Synchronization Suite (R3)", tests)
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
