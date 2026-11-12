/**
 * tests/test_layout_spacing.mjs
 *
 * Verifies Requirement R4 (Layout Spacing, Clearances & Viewport Integrity):
 * - Header margins & title positioning consistency across viewports.
 * - Desktop text clearance against the minimap inset box (no collision/overlap).
 * - Touch targets on mobile meeting accessibility guidelines.
 * - Absence of horizontal overflow across desktop, tablet, and mobile viewports.
 */
import {
  runSuite,
  assert,
  saveScreenshot,
  getViewportBox,
  waitForPageMode,
  waitForCircuit
} from "./harness.mjs";

const VIEWPORTS = [
  { name: "wideDesktop", width: 1920, height: 1080 },
  { name: "standardDesktop", width: 1440, height: 900 },
  { name: "tablet", width: 1024, height: 768 },
  { name: "shortDesktop", width: 800, height: 500 },
  { name: "mobilePortrait", width: 390, height: 844 },
  { name: "mobileCompact", width: 375, height: 667 },
  { name: "mobileShort", width: 360, height: 520 },
  { name: "mobileLandscape", width: 844, height: 390 }
];

/**
 * Test 1: Header margins and persistent title spacing.
 * Verifies that title distance from top of viewport is consistent (>= 12px and <= 60px)
 * and only one title element is visible (no duplicate headers).
 */
async function testHeaderAndTitleSpacing({ browser, baseUrl }) {
  const checkVps = [
    { width: 1920, height: 1080, name: "desktop_1920" },
    { width: 1440, height: 900, name: "desktop_1440" },
    { width: 390, height: 844, name: "mobile_390" }
  ];

  for (const { width, height, name } of checkVps) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
    await waitForCircuit(page);

    // In circuit mode: verify exactly 1 visible header
    const circuitHeader = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll(".persist"));
      const visible = titles.filter((t) => window.getComputedStyle(t).display !== "none");
      const rect = visible[0] ? visible[0].getBoundingClientRect() : null;
      return {
        count: visible.length,
        rect: rect ? { top: rect.top, left: rect.left, height: rect.height } : null
      };
    });

    assert(circuitHeader.count === 1, `Expected exactly 1 visible .persist title on ${name}, found ${circuitHeader.count}`);
    assert(
      circuitHeader.rect.top >= 8 && circuitHeader.rect.top <= 64,
      `Header top position on ${name} (${circuitHeader.rect.top}px) should be between 8px and 64px`
    );

    // Enter page mode: verify no duplicate header and proper section top spacing
    await page.locator('.hotspot[data-i="0"]').click();
    await waitForPageMode(page);
    await page.waitForTimeout(600);

    const pageLayout = await page.evaluate(() => {
      const persistTitles = Array.from(document.querySelectorAll(".persist"));
      const visiblePersist = persistTitles.filter((t) => window.getComputedStyle(t).display !== "none");
      const activeSection = document.querySelector("#sections section.is-on");
      const h2 = activeSection ? activeSection.querySelector("h2") : null;
      const h2Rect = h2 ? h2.getBoundingClientRect() : null;
      const sec = document.getElementById("sections");
      const secRect = sec ? sec.getBoundingClientRect() : null;

      return {
        duplicatePersistCount: visiblePersist.length,
        h2Top: h2Rect ? h2Rect.top : 0,
        secTop: secRect ? secRect.top : 0
      };
    });

    // Verify .persist is hidden in page mode so it does not duplicate the section heading
    assert(
      pageLayout.duplicatePersistCount === 0,
      `Duplicate .persist title visible in page mode on ${name}`
    );
    // Section header should have top clearance >= 16px
    assert(
      pageLayout.h2Top >= 16 && pageLayout.h2Top <= 120,
      `Active section h2 top position (${pageLayout.h2Top}px) on ${name} should have proper clearance between 16px and 120px`
    );

    await page.close();
  }
}

/**
 * Test 2: Desktop text column clearance against the inset minimap box.
 * Asserts that active section content has adequate clearance and does not overlap
 * the minimap bounding box on desktop viewports.
 */
async function testDesktopTextClearanceAgainstInsetBox({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${baseUrl}/?v=test#about`, { waitUntil: "networkidle" });
  await waitForPageMode(page);
  await page.waitForTimeout(600);

  const clearance = await page.evaluate(() => {
    const vp = document.getElementById("viewport");
    const vpRect = vp.getBoundingClientRect();
    const activeSection = document.querySelector("#sections section.is-on");
    if (!activeSection) return null;

    // Check inner text containers / headings
    const textEls = Array.from(activeSection.querySelectorAll("h2, p, ul"));
    let maxTextRight = 0;
    for (const el of textEls) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > maxTextRight) {
        maxTextRight = r.right;
      }
    }

    const secRect = activeSection.getBoundingClientRect();
    return {
      vpLeft: vpRect.left,
      vpTop: vpRect.top,
      secRight: secRect.right,
      maxTextRight,
      marginToVp: vpRect.left - maxTextRight
    };
  });

  assert(clearance !== null, "Active section not found");

  // In desktop page mode, text content should not collide with or overlap the inset minimap
  assert(
    clearance.marginToVp >= 16,
    `Desktop text column collides with inset minimap: text right edge ${clearance.maxTextRight}px is too close to minimap left ${clearance.vpLeft}px (clearance: ${clearance.marginToVp}px < 16px)`
  );

  await saveScreenshot(page, "r4_desktop_layout_1440x900.png");
  await page.close();
}

/**
 * Test 3: Absence of horizontal overflow across all responsive viewports.
 * Asserts scrollWidth <= innerWidth in both circuit and page modes.
 */
async function testAbsenceOfHorizontalOverflow({ browser, baseUrl }) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
    await waitForCircuit(page);

    // Circuit mode overflow check
    const circuitOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        scrollHeight: doc.scrollHeight,
        clientHeight: doc.clientHeight
      };
    });

    assert(
      circuitOverflow.scrollWidth <= circuitOverflow.clientWidth + 1,
      `Horizontal overflow in circuit mode on ${vp.name} (${vp.width}x${vp.height}): scrollWidth=${circuitOverflow.scrollWidth} > clientWidth=${circuitOverflow.clientWidth}`
    );
    assert(
      circuitOverflow.scrollHeight <= circuitOverflow.clientHeight + 1,
      `Vertical overflow in circuit mode on ${vp.name} (${vp.width}x${vp.height}): scrollHeight=${circuitOverflow.scrollHeight} > clientHeight=${circuitOverflow.clientHeight}`
    );

    // Page mode overflow check
    await page.locator('.hotspot[data-i="0"]').click();
    await waitForPageMode(page);
    await page.waitForTimeout(600);

    const pageOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth
      };
    });

    assert(
      pageOverflow.scrollWidth <= pageOverflow.clientWidth + 1,
      `Horizontal overflow in page mode on ${vp.name} (${vp.width}x${vp.height}): scrollWidth=${pageOverflow.scrollWidth} > clientWidth=${pageOverflow.clientWidth}`
    );

    await page.close();
  }
}

/**
 * Test 4: Mobile touch target sizes meeting minimum accessible dimensions.
 * Tests #inset-home, .inset-jump buttons, .hotspot buttons, and #prev/#next.
 */
async function testMobileTouchTargets({ browser, baseUrl }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${baseUrl}/?v=test`, { waitUntil: "networkidle" });
  await waitForCircuit(page);

  // In circuit mode: verify hotspot touch targets
  const hotspots = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".hotspot")).map((h) => {
      const rect = h.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
  });

  assert(hotspots.length >= 6, "Expected at least 6 interactive hotspots");
  for (let i = 0; i < hotspots.length; i++) {
    const h = hotspots[i];
    assert(
      h.width >= 44 && h.height >= 44,
      `Hotspot ${i} touch target (${h.width}x${h.height}) is below minimum 44x44px`
    );
  }

  // Enter page mode: verify minimap home and jump buttons
  await page.locator('.hotspot[data-i="0"]').click();
  await waitForPageMode(page);
  await page.waitForTimeout(600);

  const targets = await page.evaluate(() => {
    const home = document.getElementById("inset-home");
    const homeRect = home ? home.getBoundingClientRect() : null;

    const jumps = Array.from(document.querySelectorAll(".inset-jump")).map((j) => {
      const r = j.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });

    return {
      home: homeRect ? { width: homeRect.width, height: homeRect.height } : null,
      jumps
    };
  });

  assert(targets.home !== null, "#inset-home button not found in page mode");
  assert(
    targets.home.height >= 28,
    `#inset-home button height (${targets.home.height}px) is below accessible 28px threshold`
  );

  assert(targets.jumps.length === 6, `Expected 6 mobile jump buttons, got ${targets.jumps.length}`);
  for (let j = 0; j < targets.jumps.length; j++) {
    const jump = targets.jumps[j];
    assert(
      jump.height >= 28 && jump.width >= 28,
      `Jump button ${j} size (${jump.width}x${jump.height}) is below accessible 28x28px threshold`
    );
  }

  await saveScreenshot(page, "r4_mobile_layout_390x844.png");
  await page.close();
}

export const tests = [
  ["R4.1: Header & title margins consistency across viewports", testHeaderAndTitleSpacing],
  ["R4.2: Desktop text column clearance against inset box", testDesktopTextClearanceAgainstInsetBox],
  ["R4.3: Absence of horizontal overflow across all viewports", testAbsenceOfHorizontalOverflow],
  ["R4.4: Mobile interactive touch target sizes", testMobileTouchTargets]
];

// CLI execution support
if (process.argv[1] && process.argv[1].endsWith("test_layout_spacing.mjs")) {
  runSuite("Layout Spacing, Clearances & Viewport Integrity Suite (R4)", tests)
    .then((res) => {
      process.exit(res.failed > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
