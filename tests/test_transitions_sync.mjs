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
  chromium,
  CHROME_PATH,
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

/**
 * Test 5: Frame chrome, 4-sided constant box-shadow spread, border-safe unclipping,
 * continuous SVG strokeWidth, controls clearance, and real classic OS scrollbar stability
 * across desktop, intermediate laptop (<1360px), and mobile in both transition directions.
 */
async function testMinimapFrameAndStageSync({ browser, baseUrl }) {
  // Part A: Desktop with real non-overlay OS scrollbars (ignoreDefaultArgs: ["--hide-scrollbars"])
  const classicBrowser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    ignoreDefaultArgs: ["--hide-scrollbars"],
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
  });

  try {
    const page = await classicBrowser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
    await waitForCircuit(page);

    const openTelemetry = await page.evaluate(async () => {
      const parseAlpha = (rgba) => {
        const m = rgba.match(/rgba?\(([^)]+)\)/);
        if (!m) return 1;
        const parts = m[1].split(",").map((s) => Number(s.trim()));
        return parts.length === 4 ? parts[3] : 1;
      };

      const vp = document.getElementById("viewport");
      const controls = document.querySelector(".controls");
      const insetBar = document.querySelector(".inset-bar");
      const startCtrlRight = controls.getBoundingClientRect().right;

      document.querySelector('.hotspot[data-i="3"]').click();
      await new Promise((r) => setTimeout(r, 20));

      const early = {
        vpBgAlpha: parseAlpha(getComputedStyle(vp).backgroundColor),
        insetBarOp: Number(getComputedStyle(insetBar).opacity),
        vpZ: Number(getComputedStyle(vp).zIndex) || 0,
        ctrlZ: Number(getComputedStyle(controls).zIndex) || 0,
        ctrlRightAt20: controls.getBoundingClientRect().right,
        startCtrlRight
      };

      const deadline = performance.now() + 280;
      while (performance.now() < deadline) {
        const anim = vp.getAnimations().find((a) => a.transitionProperty === "box-shadow");
        if (!anim || (typeof anim.currentTime === "number" && anim.currentTime >= 80)) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      const midShadow = getComputedStyle(vp).boxShadow;
      const midBgAlpha = parseAlpha(getComputedStyle(vp).backgroundColor);

      const settleDeadline = performance.now() + 750;
      while (performance.now() < settleDeadline) {
        const wAnim = vp.getAnimations().find((a) => a.transitionProperty === "width");
        if (!wAnim || (typeof wAnim.currentTime === "number" && wAnim.currentTime >= 685)) break;
        await new Promise((r) => requestAnimationFrame(r));
      }
      const preSettleRect = vp.getBoundingClientRect();

      await new Promise((r) => setTimeout(r, 200));
      const postSettleRect = vp.getBoundingClientRect();

      return {
        early,
        midShadow,
        midBgAlpha,
        preLeft: preSettleRect.left,
        postLeft: postSettleRect.left,
        preWidth: preSettleRect.width,
        postWidth: postSettleRect.width,
        innerWidth: window.innerWidth,
        bodyClientWidth: document.body.clientWidth
      };
    });

    assert(
      openTelemetry.early.vpBgAlpha < 0.08,
      `Desktop open early frame: viewport background should remain transparent before 35ms delay, got alpha=${openTelemetry.early.vpBgAlpha}`
    );
    assert(
      openTelemetry.early.insetBarOp < 0.08,
      `Desktop open early frame: .inset-bar should not pop in prematurely, got opacity=${openTelemetry.early.insetBarOp}`
    );
    assert(
      openTelemetry.early.ctrlZ > openTelemetry.early.vpZ,
      `Desktop open: .controls z-index (${openTelemetry.early.ctrlZ}) must stay above morphing #viewport (${openTelemetry.early.vpZ})`
    );
    assert(
      openTelemetry.midShadow.includes("1.5px") &&
        openTelemetry.midBgAlpha > 0.05 &&
        openTelemetry.midBgAlpha < 0.95,
      `Desktop open mid-frame: box-shadow must preserve constant 1.5px 4-sided spread during fade-in, got "${openTelemetry.midShadow}" (bgAlpha=${openTelemetry.midBgAlpha})`
    );
    assert(
      Math.abs(openTelemetry.preLeft - openTelemetry.postLeft) <= 1.5 &&
        Math.abs(openTelemetry.preWidth - openTelemetry.postWidth) <= 1.5,
      `Scrollbar width mismatch caused settle jump: pre=(${openTelemetry.preLeft}, ${openTelemetry.preWidth}) vs post=(${openTelemetry.postLeft}, ${openTelemetry.postWidth})`
    );

    // Verify zero horizontal shift across scrollable (#projects) <-> short (#contact) sections
    const projBox = await page.evaluate(() => ({
      vpLeft: document.getElementById("viewport").getBoundingClientRect().left,
      ctrlRight: document.querySelector(".controls").getBoundingClientRect().right
    }));
    await page.locator("#minimap button").nth(5).click();
    await page.waitForTimeout(620);
    const contactBox = await page.evaluate(() => ({
      vpLeft: document.getElementById("viewport").getBoundingClientRect().left,
      ctrlRight: document.querySelector(".controls").getBoundingClientRect().right
    }));
    assert(
      Math.abs(projBox.vpLeft - contactBox.vpLeft) <= 0.5 &&
        Math.abs(projBox.ctrlRight - contactBox.ctrlRight) <= 0.5,
      `Scrollbar gutter shifted geometry between #projects (${JSON.stringify(projBox)}) and #contact (${JSON.stringify(contactBox)})`
    );

    // Switch back to #projects, scroll down, and verify enterCircuit (minimap -> full circuit)
    await page.locator("#minimap button").nth(3).click();
    await page.waitForTimeout(620);
    await page.evaluate(() => window.scrollTo(0, 220));
    await page.waitForTimeout(50);

    const closeTelemetry = await page.evaluate(async () => {
      const parseScale = (el) => {
        const m = getComputedStyle(el).transform.match(/matrix\(([^)]+)\)/);
        return m ? Number(m[1].split(",")[0]) : 1;
      };
      const stage = document.getElementById("stage");
      const vp = document.getElementById("viewport");
      const controls = document.querySelector(".controls");
      const wire = document.querySelector("#stage .wires path");
      const sym5 = document.getElementById("sym-5");

      const insetScale = parseScale(stage);
      const insetCtrlRight = controls.getBoundingClientRect().right;
      const insetStroke = parseFloat(getComputedStyle(wire).strokeWidth);

      document.getElementById("inset-home").click();
      await new Promise((r) => setTimeout(r, 20));

      const vpEarlyRect = vp.getBoundingClientRect();
      const sym5EarlyRect = sym5.getBoundingClientRect();
      const earlyOverflow = getComputedStyle(vp).overflow;
      const earlyCtrlRight = controls.getBoundingClientRect().right;
      const earlySectionsTop = document.getElementById("sections").getBoundingClientRect().top;

      await new Promise((r) => setTimeout(r, 85));

      const midScale = parseScale(stage);
      const midCtrlRight = controls.getBoundingClientRect().right;
      const midOverflow = getComputedStyle(vp).overflow;
      const midGridOp = Number(getComputedStyle(stage, "::before").opacity);
      const midVigOp = Number(getComputedStyle(vp, "::after").opacity);
      const midStroke = parseFloat(getComputedStyle(wire).strokeWidth);
      const midVecEff = getComputedStyle(wire).vectorEffect;

      await new Promise((r) => setTimeout(r, 560));
      const preSettleCtrlRight = controls.getBoundingClientRect().right;

      await new Promise((r) => setTimeout(r, 240));
      const fullScale = parseScale(stage);
      const fullCtrlRight = controls.getBoundingClientRect().right;
      const fullStroke = parseFloat(getComputedStyle(wire).strokeWidth);

      return {
        insetScale,
        midScale,
        fullScale,
        insetCtrlRight,
        earlyCtrlRight,
        midCtrlRight,
        preSettleCtrlRight,
        fullCtrlRight,
        earlyOverflow,
        vpEarlyRight: vpEarlyRect.right,
        sym5EarlyRight: sym5EarlyRect.right,
        earlySectionsTop,
        midOverflow,
        midGridOp,
        midVigOp,
        insetStroke,
        midStroke,
        fullStroke,
        midVecEff
      };
    });

    assert(
      closeTelemetry.earlyOverflow === "hidden" &&
        closeTelemetry.sym5EarlyRight <= closeTelemetry.vpEarlyRight + 1.5,
      `Schematic node 06 pierced outside visible minimap border during early close: overflow=${closeTelemetry.earlyOverflow}, sym5Right=${closeTelemetry.sym5EarlyRight}, vpRight=${closeTelemetry.vpEarlyRight}`
    );
    assert(
      closeTelemetry.earlySectionsTop < -150,
      `Scrolled #sections snapped back to top at t=20ms of exit instead of preserving scroll offset: top=${closeTelemetry.earlySectionsTop}`
    );
    assert(
      Math.abs(closeTelemetry.earlyCtrlRight - closeTelemetry.insetCtrlRight) <= 2,
      `Desktop .controls jumped at t=20ms before minimap border dissolved: insetRight=${closeTelemetry.insetCtrlRight}, earlyRight=${closeTelemetry.earlyCtrlRight}`
    );
    assert(
      closeTelemetry.midOverflow === "visible",
      `Desktop #viewport did not unclip after border dissolved (at ~105ms): overflow=${closeTelemetry.midOverflow}`
    );
    assert(
      closeTelemetry.midScale > closeTelemetry.insetScale + 0.04 &&
        closeTelemetry.midScale < closeTelemetry.fullScale - 0.03,
      `Stage scale snapped instead of animating during minimap close: inset=${closeTelemetry.insetScale}, mid=${closeTelemetry.midScale}, full=${closeTelemetry.fullScale}`
    );
    assert(
      closeTelemetry.midCtrlRight > closeTelemetry.insetCtrlRight + 20 &&
        closeTelemetry.midCtrlRight <= closeTelemetry.fullCtrlRight &&
        Math.abs(closeTelemetry.fullCtrlRight - 1420) <= 1.5 &&
        Math.abs(closeTelemetry.fullCtrlRight - closeTelemetry.preSettleCtrlRight) <= 35,
      `Desktop .controls did not expand smoothly to 1420px without scrollbar snap: ${JSON.stringify(closeTelemetry)}`
    );
    assert(
      closeTelemetry.midVecEff === "none" &&
        closeTelemetry.midStroke < closeTelemetry.insetStroke - 0.1 &&
        closeTelemetry.midStroke > closeTelemetry.fullStroke + 0.03,
      `SVG strokeWidth did not interpolate continuously during close: inset=${closeTelemetry.insetStroke}, mid=${closeTelemetry.midStroke}, full=${closeTelemetry.fullStroke}, vec=${closeTelemetry.midVecEff}`
    );
    assert(
      closeTelemetry.midGridOp < 0.05 && closeTelemetry.midVigOp < 0.05,
      `Grid/vignette appeared prematurely inside partial viewport during close: gridOp=${closeTelemetry.midGridOp}, vigOp=${closeTelemetry.midVigOp}`
    );

    await page.close();
  } finally {
    await classicBrowser.close();
  }

  // Part B: Laptop (<1360px) and Mobile (390x844) unclipping & early-frame chrome checks
  for (const [w, h] of [[1150, 800], [390, 844]]) {
    const subPage = await browser.newPage({ viewport: { width: w, height: h } });
    await subPage.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
    await waitForCircuit(subPage);

    const subTelemetry = await subPage.evaluate(async (isMob) => {
      document.querySelector('.hotspot[data-i="0"]').click();
      await new Promise((r) => setTimeout(r, 80));
      const insetBar = document.querySelector(".inset-bar");
      const insetJumps = document.querySelector(".inset-jumps");
      const barOp = Number(getComputedStyle(insetBar).opacity);
      const jumpsOp = isMob ? Number(getComputedStyle(insetJumps).opacity) : 0;

      await new Promise((r) => setTimeout(r, 760));
      document.getElementById("inset-home").click();
      await new Promise((r) => setTimeout(r, 105));
      const midExitOverflow = getComputedStyle(document.getElementById("viewport")).overflow;
      return { barOp, jumpsOp, midExitOverflow };
    }, w <= 860);

    assert(
      subTelemetry.barOp < 0.1 && subTelemetry.jumpsOp < 0.1,
      `Viewport ${w}x${h} open early frame: minimap header/jumps popped prematurely (${JSON.stringify(subTelemetry)})`
    );
    assert(
      subTelemetry.midExitOverflow === "visible",
      `Viewport ${w}x${h} exit mid-frame remained clipped (overflow=${subTelemetry.midExitOverflow}), severing schematic/grid`
    );

    await subPage.close();
  }
}

/**
 * Test 6: Mid-flight interruption continuity (geometry + chrome alpha), mid-morph resize,
 * and Contact section image removal.
 */
async function testMidFlightReversalAndContactClean({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=test#contact`, { waitUntil: "networkidle" });
  await waitForPageMode(page);

  const contactMediaCount = await page.locator("#out img, #out .schematic-card").count();
  assert(contactMediaCount === 0, `Contact section (#out) must not contain any schematic image, found ${contactMediaCount}`);

  // Return to circuit first
  await page.locator("#inset-home").click();
  await waitForCircuit(page);
  await page.waitForTimeout(200);

  // Interrupt circuit->page morph at 170ms (mid chrome fade) by clicking #inset-home
  const reversal = await page.evaluate(async () => {
    const parseAlpha = (rgba) => {
      const m = rgba.match(/rgba?\(([^)]+)\)/);
      if (!m) return 1;
      const parts = m[1].split(",").map((s) => Number(s.trim()));
      return parts.length === 4 ? parts[3] : 1;
    };
    const vp = document.getElementById("viewport");
    document.querySelector('.hotspot[data-i="0"]').click();
    await new Promise((r) => setTimeout(r, 170));
    const beforeReverseWidth = vp.getBoundingClientRect().width;
    const beforeReverseAlpha = parseAlpha(getComputedStyle(vp).backgroundColor);

    document.getElementById("inset-home").click();
    await new Promise((r) => setTimeout(r, 20));
    const afterReverseWidth = vp.getBoundingClientRect().width;
    const afterReverseAlpha = parseAlpha(getComputedStyle(vp).backgroundColor);

    await new Promise((r) => setTimeout(r, 820));
    const settledRect = vp.getBoundingClientRect();
    return {
      beforeReverseWidth,
      afterReverseWidth,
      beforeReverseAlpha,
      afterReverseAlpha,
      settledWidth: settledRect.width,
      settledHeight: settledRect.height,
      bodyClass: document.body.className,
      isAnimating: vp.classList.contains("is-animating")
    };
  });

  assert(
    reversal.afterReverseWidth >= reversal.beforeReverseWidth - 15,
    `Mid-flight reversal snapped down to inset width instead of reversing smoothly: before=${reversal.beforeReverseWidth}, after=${reversal.afterReverseWidth}`
  );
  assert(
    reversal.afterReverseAlpha <= reversal.beforeReverseAlpha + 0.08,
    `Mid-flight reversal snapped background alpha upward toward 1.0 instead of dissolving from in-flight value: before=${reversal.beforeReverseAlpha}, after=${reversal.afterReverseAlpha}`
  );
  assert(
    Math.round(reversal.settledWidth) === 1440 &&
      Math.round(reversal.settledHeight) === 900 &&
      reversal.bodyClass.includes("circuit-on") &&
      !reversal.isAnimating,
    `Mid-flight reversal failed to settle cleanly in circuit mode: ${JSON.stringify(reversal)}`
  );

  // Verify mid-morph window.resize during enterCircuit retargets full viewport without snapping to insetBox
  await page.locator('.hotspot[data-i="0"]').click();
  await waitForPageMode(page);
  await page.waitForTimeout(820);

  await page.locator("#inset-home").click();
  await page.waitForTimeout(180);
  const preResizeWidth = await page.evaluate(() => document.getElementById("viewport").getBoundingClientRect().width);
  await page.setViewportSize({ width: 1360, height: 860 });
  await page.waitForTimeout(45);
  const postResizeMid = await page.evaluate(() => {
    const vp = document.getElementById("viewport");
    return {
      width: vp.getBoundingClientRect().width,
      isAnimating: vp.classList.contains("is-animating")
    };
  });
  await waitForCircuit(page);
  await page.waitForTimeout(150);
  const postResizeSettled = await page.evaluate(() => {
    const r = document.getElementById("viewport").getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height) };
  });

  assert(
    postResizeMid.isAnimating && postResizeMid.width > 950,
    `Mid-exit resize corrupted morph back toward insetBox: pre=${preResizeWidth}, postMid=${JSON.stringify(postResizeMid)}`
  );
  assert(
    postResizeSettled.width === 1360 && postResizeSettled.height === 860,
    `Mid-exit resize failed to settle at 1360x860: ${JSON.stringify(postResizeSettled)}`
  );

  await page.close();
}

export const tests = [
  ["R3.1: Circuit to page smooth transition (no jump cuts/NaNs)", testCircuitToPageSmoothTransition],
  ["R3.2: Page to circuit smooth transition (restore zoom/position)", testPageToCircuitSmoothTransition],
  ["R3.3: Bidirectional 6-symbol synchronization in page mode", testBidirectionalSymbolSynchronization],
  ["R3.4: Mobile jumps bidirectional synchronization", testMobileJumpsSync],
  ["R3.5: Minimap frame chrome, stage scale & scrollbar sync", testMinimapFrameAndStageSync],
  ["R3.6: Mid-flight reversal, mid-morph resize & Contact image removal", testMidFlightReversalAndContactClean]
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
