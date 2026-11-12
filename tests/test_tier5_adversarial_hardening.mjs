/**
 * tests/test_tier5_adversarial_hardening.mjs
 *
 * Tier 5 Adversarial Coverage Hardening Suite (White-Box):
 * 1. Hash Navigation & History:
 *    - Direct loading for all 6 canonical sections (#about, #experience, #skills, #projects, #honors, #contact).
 *    - Direct loading for legacy hashes (#current, #charge, #leak, #threshold, #spike, #synapse, #highlights).
 *    - Dynamic runtime hashchange across all sections, legacy hashes, empty hash, and #circuit.
 *    - Browser back & forward (popstate) navigation across multiple sections and back to circuit mode.
 * 2. Keyboard Accessibility & Shortcuts:
 *    - Arrow keys (Right/Down advance, Left/Up reverse) in circuit and page modes with clamp limits.
 *    - Home / End keys (circuit jump to 0/5, scroll preservation in page mode).
 *    - Escape key (returns to circuit mode) and Enter key (opens page mode).
 *    - Skip link dynamic target (#minimap on desktop circuit, #prev on mobile circuit, #sections in page mode).
 *    - Focus outline visibility (:focus-visible) on all interactive elements.
 * 3. Edge Case State Transitions:
 *    - Rapid ping-pong transitions between page mode and circuit mode during active animations.
 *    - Rapid section hammering in page mode.
 *    - prefers-reduced-motion: reduce emulation and dynamic runtime toggling.
 *    - Invariant preservation: no NaN in transforms/bounds, no duplicate/missing mode classes, no stuck morph states.
 */
import {
  runSuite,
  launchBrowser,
  getTestUrl,
  saveScreenshot,
  assert,
  waitForPageMode,
  waitForCircuit,
  getViewportBox,
  getStageScale,
  SCREENSHOTS_DIR
} from "./harness.mjs";

const CANONICAL_SECTIONS = [
  { hash: "about", index: 0, name: "About", num: "01" },
  { hash: "experience", index: 1, name: "Experience", num: "02" },
  { hash: "skills", index: 2, name: "Skills", num: "03" },
  { hash: "projects", index: 3, name: "Projects", num: "04" },
  { hash: "honors", index: 4, name: "Honors", num: "05" },
  { hash: "contact", index: 5, name: "Contact", num: "06" }
];

const LEGACY_HASHES = [
  { hash: "current", expectedIndex: 0, expectedName: "About" },
  { hash: "charge", expectedIndex: 1, expectedName: "Experience" },
  { hash: "leak", expectedIndex: 2, expectedName: "Skills" },
  { hash: "threshold", expectedIndex: 3, expectedName: "Projects" },
  { hash: "spike", expectedIndex: 4, expectedName: "Honors" },
  { hash: "synapse", expectedIndex: 5, expectedName: "Contact" },
  { hash: "highlights", expectedIndex: 4, expectedName: "Honors" }
];

/**
 * Reads full application state snapshot from page.
 */
async function getAppState(page) {
  return page.evaluate(() => {
    const body = document.body;
    const vp = document.getElementById("viewport");
    const stage = document.getElementById("stage");
    const sections = document.getElementById("sections");
    const caption = document.getElementById("inset-caption");
    const panels = sections ? Array.from(sections.querySelectorAll("section")) : [];
    const activePanels = panels.filter((p) => p.classList.contains("is-on"));
    const motionPanels = panels.filter((p) => p.classList.contains("is-panel-active"));
    const vpRect = vp ? vp.getBoundingClientRect() : null;

    const hotSymbols = Array.from(document.querySelectorAll(".sym.is-hot")).map((el) => el.id);

    return {
      isPageMode: body.classList.contains("page-mode"),
      isCircuitOn: body.classList.contains("circuit-on"),
      hasPageChromeEnter: body.classList.contains("page-chrome-enter"),
      hasPageChromeVisible: body.classList.contains("page-chrome-visible"),
      hasPageChromeExit: body.classList.contains("page-chrome-exit"),
      isViewportAnimating: vp ? vp.classList.contains("is-animating") : false,
      isStageMorphing: stage ? stage.classList.contains("is-morphing") : false,
      stageTransform: stage ? stage.style.transform : "",
      vpStyle: vp
        ? {
            top: vp.style.top,
            left: vp.style.left,
            width: vp.style.width,
            height: vp.style.height
          }
        : null,
      vpRect: vpRect
        ? {
            x: vpRect.x,
            y: vpRect.y,
            width: vpRect.width,
            height: vpRect.height,
            top: vpRect.top,
            left: vpRect.left,
            right: vpRect.right,
            bottom: vpRect.bottom
          }
        : null,
      captionText: caption ? caption.textContent.trim() : "",
      panelCount: panels.length,
      activePanelCount: activePanels.length,
      activePanelIndex: panels.findIndex((p) => p.classList.contains("is-on")),
      motionPanelCount: motionPanels.length,
      hotSymbols,
      sectionsScrollTop: sections ? sections.scrollTop : 0,
      sectionsMinHeight: sections ? sections.style.minHeight : "",
      hash: location.hash,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  });
}

/**
 * Asserts baseline state invariants.
 */
function assertInvariants(state, label = "") {
  // Invariant 1: Mutually exclusive top-level mode classes
  if (state.isPageMode) {
    assert(!state.isCircuitOn, `${label}: body cannot have circuit-on while in page-mode`);
  } else if (state.isCircuitOn) {
    assert(!state.isPageMode, `${label}: body cannot have page-mode while in circuit-on`);
  }

  // Invariant 2: No NaNs in stage transform
  assert(!state.stageTransform.includes("NaN"), `${label}: stage transform contains NaN: ${state.stageTransform}`);

  // Invariant 3: No NaNs in viewport styles
  if (state.vpStyle) {
    assert(!String(state.vpStyle.top).includes("NaN"), `${label}: vpStyle.top contains NaN`);
    assert(!String(state.vpStyle.left).includes("NaN"), `${label}: vpStyle.left contains NaN`);
    assert(!String(state.vpStyle.width).includes("NaN"), `${label}: vpStyle.width contains NaN`);
    assert(!String(state.vpStyle.height).includes("NaN"), `${label}: vpStyle.height contains NaN`);
  }

  // Invariant 4: Single active panel in settled page mode
  if (state.isPageMode && !state.isViewportAnimating && state.motionPanelCount === 0) {
    assert(
      state.activePanelCount === 1,
      `${label}: expected exactly 1 active panel in settled page mode, found ${state.activePanelCount}`
    );
  }
}

/**
 * 1. Direct Loading: Canonical Section Hashes
 */
async function testDirectLoadingCanonicalHashes({ browser, baseUrl }) {
  console.log("  -> Testing direct loading for all 6 canonical section hashes...");
  for (const item of CANONICAL_SECTIONS) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/#${item.hash}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const state = await getAppState(page);
    assertInvariants(state, `Direct load #${item.hash}`);

    assert(state.isPageMode, `Expected page-mode on direct load of #${item.hash}`);
    assert(!state.isCircuitOn, `Did not expect circuit-on on direct load of #${item.hash}`);
    assert(
      state.activePanelIndex === item.index,
      `Expected active panel index ${item.index} for #${item.hash}, got ${state.activePanelIndex}`
    );
    assert(
      state.captionText.includes(item.name),
      `Expected caption to include "${item.name}", got "${state.captionText}"`
    );
    assert(
      state.hotSymbols.includes(`sym-${item.index}`),
      `Expected sym-${item.index} to be hot, got ${JSON.stringify(state.hotSymbols)}`
    );

    // Inset viewport must be smaller than full screen
    assert(
      state.vpRect.width < state.windowWidth,
      `Minimap width (${state.vpRect.width}) should be less than window width (${state.windowWidth})`
    );

    await saveScreenshot(page, `t5_direct_canonical_${item.hash}.png`);
    await page.close();
  }
}

/**
 * 2. Direct Loading: Legacy Section Hashes
 */
async function testDirectLoadingLegacyHashes({ browser, baseUrl }) {
  console.log("  -> Testing direct loading for legacy section hashes...");
  for (const item of LEGACY_HASHES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/#${item.hash}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);

    const state = await getAppState(page);
    assertInvariants(state, `Direct load legacy #${item.hash}`);

    assert(state.isPageMode, `Expected page-mode on direct load of legacy #${item.hash}`);
    assert(
      state.activePanelIndex === item.expectedIndex,
      `Legacy #${item.hash} should map to index ${item.expectedIndex}, got ${state.activePanelIndex}`
    );
    assert(
      state.captionText.includes(item.expectedName),
      `Expected caption to include "${item.expectedName}", got "${state.captionText}"`
    );

    await page.close();
  }
}

/**
 * 3. Runtime hashchange, popstate, and Circuit Return
 */
async function testHashchangeAndPopstateNavigation({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  console.log("  -> Testing runtime hash changes through all 6 sections...");
  for (const item of CANONICAL_SECTIONS) {
    await page.evaluate((h) => { location.hash = h; }, item.hash);
    await page.waitForTimeout(400);

    const state = await getAppState(page);
    assertInvariants(state, `hashchange to #${item.hash}`);
    assert(state.isPageMode, `Expected page mode after setting hash to #${item.hash}`);
    assert(
      state.activePanelIndex === item.index,
      `Expected active panel ${item.index} for #${item.hash}, got ${state.activePanelIndex}`
    );
  }

  console.log("  -> Testing runtime legacy hash navigation via hashchange...");
  for (const item of LEGACY_HASHES) {
    await page.evaluate((h) => { location.hash = h; }, item.hash);
    await page.waitForTimeout(400);

    const state = await getAppState(page);
    assert(
      state.activePanelIndex === item.expectedIndex,
      `hashchange to legacy #${item.hash} expected index ${item.expectedIndex}, got ${state.activePanelIndex}`
    );
  }

  console.log("  -> Testing browser back (popstate) navigation across history entries...");
  // Now navigate specifically: about -> experience -> projects -> contact
  await page.evaluate(() => { location.hash = "about"; });
  await page.waitForTimeout(200);
  await page.evaluate(() => { location.hash = "experience"; });
  await page.waitForTimeout(200);
  await page.evaluate(() => { location.hash = "projects"; });
  await page.waitForTimeout(200);
  await page.evaluate(() => { location.hash = "contact"; });
  await page.waitForTimeout(300);

  // Back 1 -> projects
  await page.goBack();
  await page.waitForTimeout(400);
  let state = await getAppState(page);
  assert(state.activePanelIndex === 3, `Expected back to projects (3), got ${state.activePanelIndex}`);

  // Back 2 -> experience
  await page.goBack();
  await page.waitForTimeout(400);
  state = await getAppState(page);
  assert(state.activePanelIndex === 1, `Expected back to experience (1), got ${state.activePanelIndex}`);

  // Back 3 -> about
  await page.goBack();
  await page.waitForTimeout(400);
  state = await getAppState(page);
  assert(state.activePanelIndex === 0, `Expected back to about (0), got ${state.activePanelIndex}`);

  console.log("  -> Testing browser forward navigation...");
  // Forward 1 -> experience
  await page.goForward();
  await page.waitForTimeout(400);
  state = await getAppState(page);
  assert(state.activePanelIndex === 1, `Expected forward to experience (1), got ${state.activePanelIndex}`);

  // Forward 2 -> projects
  await page.goForward();
  await page.waitForTimeout(400);
  state = await getAppState(page);
  assert(state.activePanelIndex === 3, `Expected forward to projects (3), got ${state.activePanelIndex}`);

  console.log("  -> Testing return to circuit via location.hash = '#circuit' and empty hash...");
  await page.evaluate(() => { location.hash = "circuit"; });
  await page.waitForTimeout(900);
  state = await getAppState(page);
  assert(state.isCircuitOn, "Setting hash to #circuit must return to circuit mode");

  // Re-enter page mode and test empty hash
  await page.evaluate(() => { location.hash = "skills"; });
  await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = ""; });
  await page.waitForTimeout(900);
  state = await getAppState(page);
  assert(state.isCircuitOn, "Clearing hash to empty must return to circuit mode");

  console.log("  -> Testing unknown hash fallback...");
  await page.evaluate(() => { location.hash = "nonexistent-random-route"; });
  await page.waitForTimeout(400);
  state = await getAppState(page);
  assertInvariants(state, "Unknown hash handling");

  await saveScreenshot(page, "t5_hashchange_popstate_settled.png");
  await page.close();
}

/**
 * 4. Keyboard Shortcuts: Arrow Keys, Home, End, Escape, Enter
 */
async function testKeyboardShortcutsAndNavigation({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  console.log("  -> Testing Arrow keys in circuit mode...");
  // Initially at index 0. ArrowRight advances to 1, 2, 3, 4, 5.
  for (let step = 1; step <= 5; step++) {
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(250);
    const hot = await page.evaluate(() => {
      const el = document.querySelector(".sym.is-hot");
      return el ? el.id : "";
    });
    assert(hot === `sym-${step}`, `Expected sym-${step} after ArrowRight step ${step}, got ${hot}`);
  }

  // Clamping at 5: extra ArrowRight should stay at 5
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  let hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-5", `ArrowRight must clamp at sym-5, got ${hot}`);

  // ArrowLeft reverses from 5 back to 0
  for (let step = 4; step >= 0; step--) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(250);
    hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
    assert(hot === `sym-${step}`, `Expected sym-${step} after ArrowLeft, got ${hot}`);
  }

  // Clamping at 0: extra ArrowLeft should stay at 0
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(200);
  hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-0", `ArrowLeft must clamp at sym-0, got ${hot}`);

  // ArrowDown acts like ArrowRight, ArrowUp acts like ArrowLeft
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(250);
  hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-1", `ArrowDown should advance to sym-1, got ${hot}`);

  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(250);
  hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-0", `ArrowUp should reverse to sym-0, got ${hot}`);

  console.log("  -> Testing Home and End keys in circuit mode...");
  await page.keyboard.press("End");
  await page.waitForTimeout(300);
  hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-5", `End key in circuit mode should jump to sym-5, got ${hot}`);

  await page.keyboard.press("Home");
  await page.waitForTimeout(300);
  hot = await page.evaluate(() => document.querySelector(".sym.is-hot")?.id || "");
  assert(hot === "sym-0", `Home key in circuit mode should jump to sym-0, got ${hot}`);

  console.log("  -> Testing Enter key to open page mode from circuit...");
  await page.keyboard.press("Enter");
  await waitForPageMode(page);
  await page.waitForTimeout(800);
  let state = await getAppState(page);
  assert(state.isPageMode, "Enter key on circuit should enter page mode");
  assert(state.activePanelIndex === 0, `Enter key should open panel 0, got ${state.activePanelIndex}`);

  console.log("  -> Testing Arrow keys in page mode...");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(650);
  state = await getAppState(page);
  assert(state.activePanelIndex === 1, `ArrowRight in page mode should advance to panel 1, got ${state.activePanelIndex}`);

  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(650);
  state = await getAppState(page);
  assert(state.activePanelIndex === 2, `ArrowDown in page mode should advance to panel 2, got ${state.activePanelIndex}`);

  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(650);
  state = await getAppState(page);
  assert(state.activePanelIndex === 1, `ArrowLeft in page mode should reverse to panel 1, got ${state.activePanelIndex}`);

  await page.keyboard.press("ArrowUp");
  await page.waitForTimeout(650);
  state = await getAppState(page);
  assert(state.activePanelIndex === 0, `ArrowUp in page mode should reverse to panel 0, got ${state.activePanelIndex}`);

  console.log("  -> Testing Escape key to return to circuit mode...");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  state = await getAppState(page);
  assert(state.isCircuitOn, "Escape key in page mode must return to circuit mode");
  assert(!state.isPageMode, "body should not retain page-mode after Escape");

  await saveScreenshot(page, "t5_keyboard_navigation_settled.png");
  await page.close();
}

/**
 * 5. Skip Link Navigation & Focus Outline Visibility
 */
async function testSkipLinkAndFocusOutlines({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  console.log("  -> Testing skip link target in circuit mode (desktop)...");
  let skipHref = await page.evaluate(() => document.querySelector(".skip")?.getAttribute("href"));
  assert(skipHref === "#minimap", `Desktop circuit mode skip link href should be '#minimap', got '${skipHref}'`);

  console.log("  -> Testing skip link focus reveal...");
  // Press Tab from initial document to focus the skip link
  await page.keyboard.press("Tab");
  // Wait 200ms for .skip 150ms CSS transform transition to settle
  await page.waitForTimeout(200);
  const skipMetrics = await page.evaluate(() => {
    const skip = document.querySelector(".skip");
    const rect = skip.getBoundingClientRect();
    const style = getComputedStyle(skip);
    return {
      activeId: document.activeElement ? document.activeElement.className : "",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      transform: style.transform,
      outlineStyle: style.outlineStyle
    };
  });
  assert(skipMetrics.top >= 0, `Focused skip link should be visible on screen, top is ${skipMetrics.top}`);
  assert(skipMetrics.width > 20, "Focused skip link width should be > 20px");

  console.log("  -> Testing skip link in mobile viewport...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  skipHref = await page.evaluate(() => document.querySelector(".skip")?.getAttribute("href"));
  assert(skipHref === "#prev", `Mobile circuit mode skip link href should be '#prev', got '${skipHref}'`);

  console.log("  -> Testing skip link in page mode...");
  await page.evaluate(() => { location.hash = "about"; });
  await waitForPageMode(page);
  await page.waitForTimeout(400);
  skipHref = await page.evaluate(() => document.querySelector(".skip")?.getAttribute("href"));
  assert(skipHref === "#sections", `Page mode skip link href should be '#sections', got '${skipHref}'`);

  console.log("  -> Testing :focus-visible outlines on interactive elements...");
  const focusOutlineResults = await page.evaluate(() => {
    const results = [];
    const elementsToTest = [
      { sel: "#inset-home", name: "Inset Home" },
      { sel: ".inset-jump", name: "Inset Jump Button" },
      { sel: "#prev", name: "Prev Button" },
      { sel: "#next", name: "Next Button" },
      { sel: "#reset-btn", name: "Reset Button" },
      { sel: ".hotspot[data-i='0']", name: "Hotspot 0" },
      { sel: "#sections a", name: "Section Link" }
    ];

    for (const item of elementsToTest) {
      const el = document.querySelector(item.sel);
      if (!el) continue;
      el.focus();
      const style = getComputedStyle(el);
      results.push({
        name: item.name,
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth) || 0,
        outlineColor: style.outlineColor
      });
    }
    return results;
  });

  for (const r of focusOutlineResults) {
    console.log(`     - ${r.name}: outline ${r.outlineWidth}px ${r.outlineStyle} (${r.outlineColor})`);
    assert(
      r.outlineStyle !== "none" || r.outlineWidth > 0,
      `Focus outline missing or 0px on ${r.name}`
    );
  }

  await saveScreenshot(page, "t5_focus_outlines_audit.png");
  await page.close();
}

/**
 * 6. Edge Case State Transitions: Rapid Ping-Pong Between Page and Circuit
 */
async function testRapidPingPongTransitions({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  console.log("  -> Stress testing rapid ping-pong transitions during active animations...");

  // Trigger rapid succession of enterPage and enterCircuit calls
  await page.evaluate(async () => {
    // Helper to click hotspot or trigger hash
    location.hash = "about"; // triggers enterPage(0)
    await new Promise((r) => setTimeout(r, 60)); // t=60ms (mid morph)

    const home = document.getElementById("inset-home");
    if (home) home.click(); // triggers enterCircuit()
    await new Promise((r) => setTimeout(r, 80)); // t=80ms (mid exit morph)

    location.hash = "skills"; // triggers enterPage(2)
    await new Promise((r) => setTimeout(r, 90));

    if (home) home.click(); // triggers enterCircuit()
    await new Promise((r) => setTimeout(r, 110));

    location.hash = "projects"; // final target
  });

  // Wait for all settling timers (TIMING.MORPH_MS + buffers = ~1200ms)
  await page.waitForTimeout(1400);

  const state = await getAppState(page);
  assertInvariants(state, "Rapid ping-pong settled state");

  assert(state.isPageMode, "App should settle in page-mode after final hash was #projects");
  assert(!state.isCircuitOn, "body cannot be circuit-on in settled page mode");
  assert(
    state.activePanelIndex === 3,
    `Expected settled panel index 3 (Projects), got ${state.activePanelIndex}`
  );
  assert(!state.isViewportAnimating, "viewport should not remain is-animating after settling");
  assert(!state.isStageMorphing, "stage should not remain is-morphing after settling");
  assert(!state.hasPageChromeEnter, "page-chrome-enter should be removed after settling");
  assert(!state.hasPageChromeExit, "page-chrome-exit should be removed after settling");

  // Viewport dimensions must be valid positive numbers
  assert(state.vpRect.width > 200, `Minimap width should be > 200px, got ${state.vpRect.width}`);
  assert(state.vpRect.height > 100, `Minimap height should be > 100px, got ${state.vpRect.height}`);

  await saveScreenshot(page, "t5_rapid_ping_pong_settled.png");
  await page.close();
}

/**
 * 7. Edge Case: Rapid Section Hammering in Page Mode
 */
async function testRapidSectionHammering({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/#about`, { waitUntil: "networkidle" });
  await waitForPageMode(page);
  await page.waitForTimeout(800);

  console.log("  -> Hammering rapid section changes: 0 -> 5 -> 1 -> 4 -> 2 -> 3 with 35ms delay...");
  await page.evaluate(async () => {
    const sequence = ["contact", "experience", "honors", "skills", "projects"];
    for (const s of sequence) {
      location.hash = s;
      await new Promise((r) => setTimeout(r, 35));
    }
  });

  // Wait for panel animations to settle (PANEL_MS + buffer = ~700ms)
  await page.waitForTimeout(900);

  const state = await getAppState(page);
  assertInvariants(state, "Rapid section hammering settled state");

  assert(
    state.activePanelIndex === 3,
    `Expected final active panel index 3 (Projects), got ${state.activePanelIndex}`
  );
  assert(
    state.activePanelCount === 1,
    `Expected exactly 1 panel with .is-on class, got ${state.activePanelCount}`
  );
  assert(
    state.motionPanelCount === 0,
    `Expected 0 panels with .is-panel-active after settling, got ${state.motionPanelCount}`
  );
  assert(
    state.sectionsMinHeight === "",
    `sections minHeight should be cleared after settling, got "${state.sectionsMinHeight}"`
  );

  await saveScreenshot(page, "t5_rapid_sections_settled.png");
  await page.close();
}

/**
 * 8. Reduced-Motion Mode Emulation and Dynamic Toggling
 */
async function testReducedMotionToggling({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log("  -> Emulating prefers-reduced-motion: reduce...");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
  await waitForCircuit(page);

  // In reduced motion, entering page mode should be instantaneous
  await page.evaluate(() => { location.hash = "experience"; });
  await page.waitForTimeout(100); // Only small wait

  let state = await getAppState(page);
  assert(state.isPageMode, "Expected immediate page-mode under reduced motion");
  assert(
    !state.isViewportAnimating,
    "Viewport should NOT animate under reduced motion"
  );
  assert(
    state.activePanelIndex === 1,
    `Expected active panel 1 under reduced motion, got ${state.activePanelIndex}`
  );

  // Return to circuit under reduced motion
  await page.evaluate(() => { location.hash = "circuit"; });
  await page.waitForTimeout(100);
  state = await getAppState(page);
  assert(state.isCircuitOn, "Expected immediate circuit-on under reduced motion");
  assert(
    !state.isViewportAnimating,
    "Viewport should NOT animate on return under reduced motion"
  );

  console.log("  -> Dynamically toggling prefers-reduced-motion to no-preference...");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForTimeout(200);

  // Now transition should be animated
  await page.evaluate(() => { location.hash = "skills"; });
  await page.waitForTimeout(100);
  state = await getAppState(page);
  // During animation, isViewportAnimating should be true
  assert(state.isPageMode, "Expected page-mode after dynamic toggle to no-preference");

  // Wait for settling
  await page.waitForTimeout(800);
  state = await getAppState(page);
  assertInvariants(state, "Settled after dynamic motion toggle");
  assert(state.activePanelIndex === 2, `Expected panel 2 active, got ${state.activePanelIndex}`);

  await saveScreenshot(page, "t5_reduced_motion_settled.png");
  await page.close();
}

/**
 * 9. In-Flight Exit Morph Interruption Race Condition
 */
async function testInFlightExitInterruption({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/#about`, { waitUntil: "domcontentloaded" });
  await waitForPageMode(page);
  await page.waitForTimeout(800);

  console.log("  -> Testing interruption of in-flight enterCircuit by enterPage (hotspot click)...");
  // Click #inset-home to start 720ms exit morph
  await page.locator("#inset-home").click();
  // Wait 100ms (mid-way through exit morph)
  await page.waitForTimeout(100);

  // Click hotspot 2 (Skills) while exit morph is in-flight
  await page.evaluate(() => document.querySelector(".hotspot[data-i='2']")?.click());

  // Wait 1200ms for all timers to settle
  await page.waitForTimeout(1200);

  const finalState = await getAppState(page);
  console.log(`     - Settled state: isPageMode=${finalState.isPageMode}, isCircuitOn=${finalState.isCircuitOn}, hash=${finalState.hash}, activePanelIndex=${finalState.activePanelIndex}`);

  // Invariant assertion: If user clicked hotspot 2 and URL hash is #skills, the app MUST settle in page mode on section 2
  assert(
    finalState.isPageMode,
    `Race Condition Bug Confirmed: Interrupted enterCircuit morph settled into circuit-on mode with hash '${finalState.hash}' and hidden #sections (display: none)`
  );
  assert(
    finalState.activePanelIndex === 2,
    `Expected panel index 2 (Skills), got ${finalState.activePanelIndex}`
  );

  await page.close();
}

const tests = [
  ["T5.1.1: Direct Loading — Canonical Section Hashes", testDirectLoadingCanonicalHashes],
  ["T5.1.2: Direct Loading — Legacy Section Hashes", testDirectLoadingLegacyHashes],
  ["T5.1.3: Runtime Hashchange, Popstate & Return to Circuit", testHashchangeAndPopstateNavigation],
  ["T5.2.1: Keyboard Shortcuts — Arrow Keys, Home, End, Escape, Enter", testKeyboardShortcutsAndNavigation],
  ["T5.2.2: Skip Link Target & Focus Outline Audit", testSkipLinkAndFocusOutlines],
  ["T5.3.1: Rapid Ping-Pong Mode Transitions Stress", testRapidPingPongTransitions],
  ["T5.3.2: Rapid Section Hammering Panel Stability", testRapidSectionHammering],
  ["T5.3.3: Reduced-Motion Emulation & Dynamic Toggling", testReducedMotionToggling],
  ["T5.3.4: In-Flight Exit Morph Interruption Race Condition", testInFlightExitInterruption]
];

export { tests };

if (process.argv[1] && process.argv[1].endsWith("test_tier5_adversarial_hardening.mjs")) {
  runSuite("Tier 5 Adversarial Coverage Hardening Suite", tests).then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}

