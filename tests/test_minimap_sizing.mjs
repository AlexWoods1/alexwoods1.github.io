/**
 * Test Suite: Minimap Sizing and Schematic Text Visibility (Milestone 1 / F1, F2, F3).
 * Verifies:
 * 1. Small Viewport Minimap Sizing: visible bounding area larger than baseline without overflowing.
 * 2. Available inner height allows schematic scale >= 0.22 on short viewports (< 560px).
 * 3. Schematic text visibility: all labels and node tags clearly visible, crisp, and not clipped.
 * 4. Multi-viewport validation: 360x520, 390x844, 800x500.
 */
import {
  runSuite,
  launchBrowser,
  getTestUrl,
  saveScreenshot,
  assert,
  getStageScale,
  getViewportBox,
  waitForPageMode
} from "./harness.mjs";

const VIEWPORTS = [
  {
    name: "Short Mobile (360x520)",
    width: 360,
    height: 520,
    baselineArea: 340 * 184, // 62,560 px²
    minScale: 0.22,
    baselineScale: 0.1781
  },
  {
    name: "Modern Mobile (390x844)",
    width: 390,
    height: 844,
    baselineArea: 370 * 236, // 87,320 px²
    minScale: 0.28,
    baselineScale: 0.2834
  },
  {
    name: "Tablet / Short Landscape (800x500)",
    width: 800,
    height: 500,
    baselineArea: 780 * 184, // 143,520 px²
    minScale: 0.22,
    baselineScale: 0.1781
  }
];

const tests = [
  ...VIEWPORTS.map((vp) => [
    `minimap sizing & bounds on ${vp.name}`,
    async ({ browser, baseUrl }) => {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      // Click first hotspot to enter page mode (minimap view)
      await page.locator('.hotspot[data-i="0"]').click();
      await waitForPageMode(page);
      await page.waitForTimeout(800); // Allow morph and settle

      const box = await getViewportBox(page);
      assert(box, "Viewport box must be present");

      const boxArea = box.width * box.height;
      assert(
        boxArea > vp.baselineArea,
        `Minimap area (${boxArea}px²) should be larger than baseline (${vp.baselineArea}px²)`
      );

      // Verify no overflow of viewport boundaries
      assert(box.left >= 0, `Minimap left (${box.left}) must not be negative`);
      assert(box.top >= 0, `Minimap top (${box.top}) must not be negative`);
      assert(
        box.right <= vp.width + 1,
        `Minimap right (${box.right}) overflows viewport width (${vp.width})`
      );
      assert(
        box.bottom <= vp.height + 1,
        `Minimap bottom (${box.bottom}) overflows viewport height (${vp.height})`
      );

      const scale = await getStageScale(page);
      assert(
        scale >= vp.minScale,
        `Schematic scale (${scale}) must be >= ${vp.minScale} (baseline was ${vp.baselineScale})`
      );

      await saveScreenshot(page, `minimap_sizing_${vp.width}x${vp.height}.png`);
      await page.close();
    }
  ]),

  ...VIEWPORTS.map((vp) => [
    `schematic text & traces visibility on ${vp.name}`,
    async ({ browser, baseUrl }) => {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(baseUrl, { waitUntil: "networkidle" });

      await page.locator('.hotspot[data-i="0"]').click();
      await waitForPageMode(page);
      await page.waitForTimeout(800);

      const vpBox = await getViewportBox(page);

      const elements = await page.evaluate(() => {
        const symTexts = Array.from(document.querySelectorAll("#stage .sym text")).map((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            text: el.textContent.trim(),
            display: style.display,
            visibility: style.visibility,
            opacity: parseFloat(style.opacity),
            fontSize: style.fontSize,
            isNodeTag: el.classList.contains("node-tag"),
            fill: style.fill,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          };
        });

        const inkTexts = Array.from(document.querySelectorAll("#stage .ink text")).map((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            text: el.textContent.trim(),
            display: style.display,
            visibility: style.visibility,
            opacity: parseFloat(style.opacity),
            fontSize: style.fontSize,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          };
        });

        const traces = Array.from(document.querySelectorAll("#stage .wires path")).map((el) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            display: style.display,
            strokeWidth: style.strokeWidth,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          };
        });

        return { symTexts, inkTexts, traces };
      });

      assert(elements.symTexts.length === 16, `Expected 16 sym text elements, got ${elements.symTexts.length}`);
      assert(elements.inkTexts.length === 1, `Expected 1 ink text element, got ${elements.inkTexts.length}`);
      assert(elements.traces.length > 0, "Traces must be present");

      // Verify all text elements are visible and styled properly
      for (const t of elements.symTexts) {
        assert(t.display !== "none", `Sym text "${t.text}" must not have display: none`);
        assert(t.visibility !== "hidden", `Sym text "${t.text}" must not be hidden`);
        assert(t.opacity >= 0.5, `Sym text "${t.text}" opacity (${t.opacity}) should be >= 0.5`);
        assert(t.rect.width > 0 && t.rect.height > 0, `Sym text "${t.text}" must have non-zero dimensions`);

        // Check bounds are strictly inside minimap viewport (no clipping)
        assert(
          t.rect.x >= vpBox.left - 2 && t.rect.x + t.rect.width <= vpBox.right + 2,
          `Text "${t.text}" horizontal position [${t.rect.x}, ${t.rect.x + t.rect.width}] clipped by viewport [${vpBox.left}, ${vpBox.right}]`
        );
        assert(
          t.rect.y >= vpBox.top - 2 && t.rect.y + t.rect.height <= vpBox.bottom + 2,
          `Text "${t.text}" vertical position [${t.rect.y}, ${t.rect.y + t.rect.height}] clipped by viewport [${vpBox.top}, ${vpBox.bottom}]`
        );
      }

      for (const t of elements.inkTexts) {
        assert(t.display !== "none", `Ink text "${t.text}" must not have display: none`);
        assert(t.visibility !== "hidden", `Ink text "${t.text}" must not be hidden`);
        assert(t.opacity >= 0.5, `Ink text "${t.text}" opacity (${t.opacity}) should be >= 0.5`);
      }

      await saveScreenshot(page, `schematic_text_${vp.width}x${vp.height}.png`);
      await page.close();
    }
  ])
];

export { tests };

if (process.argv[1] && process.argv[1].endsWith("test_minimap_sizing.mjs")) {
  runSuite("Minimap Sizing and Schematic Text Visibility (R2)", tests).then((res) => {
    if (res.failed > 0) process.exit(1);
  });
}
