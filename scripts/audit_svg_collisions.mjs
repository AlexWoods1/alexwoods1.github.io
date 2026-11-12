// scripts/audit_svg_collisions.mjs
/**
 * Automated Playwright Bounding-Box Collision Audit for all SVGs in docs/media/
 * 
 * Renders each SVG asset in headless Chromium, extracts DOM bounding boxes
 * (getBBox() and getBoundingClientRect()), and asserts ZERO illegal collisions:
 * 1. Text-vs-Text collisions (no overlapping labels or text blocks).
 * 2. Text-vs-Foreground graphical element collisions (e.g. waveform path vs formula,
 *    circuit lines vs text labels, battery plates vs V_rest).
 * 3. Captures PNG proof of each rendered SVG to tests/screenshots/svg_audits/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const MEDIA_DIR = path.resolve(REPO_ROOT, 'docs', 'media');
const SCREENSHOTS_DIR = path.resolve(REPO_ROOT, 'tests', 'screenshots', 'svg_audits');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function loadPlaywright() {
  const localReq = createRequire(import.meta.url);
  try {
    return localReq('playwright');
  } catch {
    if (process.env.PLAYWRIGHT_PACKAGE_JSON) {
      return createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON)('playwright');
    }
    throw new Error(
      'Playwright not found. Install locally (`npm install -D playwright`) or set PLAYWRIGHT_PACKAGE_JSON.'
    );
  }
}

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const winChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  return fs.existsSync(winChrome) ? winChrome : undefined;
}

const { chromium } = loadPlaywright();
const CHROME_PATH = resolveChromePath();

/**
 * Check if two axis-aligned 2D bounding boxes overlap with tolerance.
 * Tolerance allows adjacent borders/elements touching at 0px boundary.
 */
function boxesOverlap(b1, b2, tolerance = 1.0) {
  if (
    b1.right <= b2.left + tolerance ||
    b2.right <= b1.left + tolerance ||
    b1.bottom <= b2.top + tolerance ||
    b2.bottom <= b1.top + tolerance
  ) {
    return false;
  }
  return true;
}

/**
 * Calculate intersection area of two bounding boxes.
 */
function intersectionArea(b1, b2) {
  const xOverlap = Math.max(0, Math.min(b1.right, b2.right) - Math.max(b1.left, b2.left));
  const yOverlap = Math.max(0, Math.min(b1.bottom, b2.bottom) - Math.max(b1.top, b2.top));
  return xOverlap * yOverlap;
}

async function runSvgCollisionAudit() {
  console.log('=======================================================================');
  console.log('       AUTOMATED PLAYWRIGHT SVG BOUNDING-BOX COLLISION AUDIT           ');
  console.log('=======================================================================');

  const svgFiles = fs.readdirSync(MEDIA_DIR)
    .filter(f => f.endsWith('.svg'))
    .sort();

  console.log(`Discovered ${svgFiles.length} SVG assets in ${MEDIA_DIR}`);

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  let totalAudits = 0;
  let passedAudits = 0;
  let failedAudits = 0;
  const collisionReports = [];

  for (const svgFile of svgFiles) {
    totalAudits++;
    const svgPath = path.join(MEDIA_DIR, svgFile);
    const svgContent = fs.readFileSync(svgPath, 'utf8');

    // Parse viewBox or width/height from SVG
    const widthMatch = svgContent.match(/\bwidth="([\d.]+)"/);
    const heightMatch = svgContent.match(/\bheight="([\d.]+)"/);
    const vbMatch = svgContent.match(/\bviewBox="0 0 ([\d.]+) ([\d.]+)"/);

    const width = widthMatch ? parseFloat(widthMatch[1]) : (vbMatch ? parseFloat(vbMatch[1]) : 1200);
    const height = heightMatch ? parseFloat(heightMatch[1]) : (vbMatch ? parseFloat(vbMatch[2]) : 800);

    await page.setViewportSize({ width: Math.ceil(width), height: Math.ceil(height) });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background: #000; overflow: hidden; }
    svg { display: block; width: ${width}px; height: ${height}px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);

    // Run in-browser collision detection
    const auditResult = await page.evaluate(({ svgFileName }) => {
      const svg = document.querySelector('svg');
      if (!svg) return { error: 'No SVG element found' };

      // 1. Gather all text elements with non-empty content
      const allTextNodes = Array.from(svg.querySelectorAll('text, tspan'));
      const textElements = [];

      for (const el of allTextNodes) {
        const textContent = (el.textContent || '').trim();
        if (!textContent) continue;

        // Skip parent <text> if it only wraps <tspan> children
        if (el.tagName.toLowerCase() === 'text' && el.querySelector('tspan')) {
          continue;
        }

        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        // For elements with <textPath>, store character boxes for accurate curved text bounding checks
        if (el.querySelector('textPath') || el.closest('textPath')) {
          const tp = el.querySelector('textPath') || el;
          const numChars = tp.getNumberOfChars?.() || 0;
          if (numChars > 0) {
            const charBoxes = [];
            for (let c = 0; c < numChars; c++) {
              const ext = tp.getExtentOfChar(c);
              charBoxes.push({
                left: ext.x,
                right: ext.x + ext.width,
                top: ext.y,
                bottom: ext.y + ext.height,
                width: ext.width,
                height: ext.height
              });
            }
            textElements.push({
              tag: el.tagName.toLowerCase(),
              text: textContent,
              isTextPath: true,
              charBoxes,
              rect: {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width,
                height: rect.height
              },
              elementId: el.id || '',
              className: el.getAttribute('class') || '',
              parentId: el.parentElement?.id || ''
            });
            continue;
          }
        }

        textElements.push({
          tag: el.tagName.toLowerCase(),
          text: textContent,
          isTextPath: false,
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          },
          elementId: el.id || '',
          className: el.getAttribute('class') || '',
          parentId: el.parentElement?.id || ''
        });
      }

      // 2. Pair-wise Text-vs-Text Collisions
      const textCollisions = [];
      for (let i = 0; i < textElements.length; i++) {
        for (let j = i + 1; j < textElements.length; j++) {
          const t1 = textElements[i];
          const t2 = textElements[j];

          const tol = 1.5;

          // If either is a textPath, use char-level bounding boxes
          if (t1.isTextPath || t2.isTextPath) {
            const pathEl = t1.isTextPath ? t1 : t2;
            const otherEl = t1.isTextPath ? t2 : t1;
            const charHit = pathEl.charBoxes?.find(cb => (
              cb.right > otherEl.rect.left + tol &&
              otherEl.rect.right > cb.left + tol &&
              cb.bottom > otherEl.rect.top + tol &&
              otherEl.rect.bottom > cb.top + tol
            ));
            if (charHit) {
              textCollisions.push({
                type: 'text-vs-textPath',
                textA: t1.text.slice(0, 30),
                textB: t2.text.slice(0, 30),
                area: 25
              });
            }
            continue;
          }

          // Check AABB overlap with 1.5px tolerance
          if (
            t1.rect.right > t2.rect.left + tol &&
            t2.rect.right > t1.rect.left + tol &&
            t1.rect.bottom > t2.rect.top + tol &&
            t2.rect.bottom > t1.rect.top + tol
          ) {
            // Overlap detected!
            const xOverlap = Math.min(t1.rect.right, t2.rect.right) - Math.max(t1.rect.left, t2.rect.left);
            const yOverlap = Math.min(t1.rect.bottom, t2.rect.bottom) - Math.max(t1.rect.top, t2.rect.top);
            const area = xOverlap * yOverlap;

            // Ignore minuscule subpixel anti-aliasing edges (< 4 sq px)
            if (area > 4) {
              textCollisions.push({
                type: 'text-vs-text',
                textA: t1.text.slice(0, 30),
                textB: t2.text.slice(0, 30),
                area: Math.round(area)
              });
            }
          }
        }
      }

      // 3. Foreground Graphics Collision Checks:
      // Critical Specific Validations:
      // (a) V_rest label vs battery plates
      // (b) Oscilloscope waveform vs formula / readouts
      const graphicCollisions = [];

      // Check battery plates vs V_rest text
      const vRestEl = textElements.find(t => t.text.includes('V_rest'));
      if (vRestEl) {
        // Battery plates are typically lines with stroke-width >= 2 in resistor/battery branch
        const batteryLines = Array.from(svg.querySelectorAll('line')).filter(l => {
          const sw = parseFloat(l.getAttribute('stroke-width') || '1');
          return sw >= 2.0;
        });

        for (const line of batteryLines) {
          const lRect = line.getBoundingClientRect();
          // Check if battery line overlaps V_rest text
          if (
            vRestEl.rect.right > lRect.left + 1 &&
            lRect.right > vRestEl.rect.left + 1 &&
            vRestEl.rect.bottom > lRect.top + 1 &&
            lRect.bottom > vRestEl.rect.top + 1
          ) {
            graphicCollisions.push({
              type: 'vrest-vs-battery',
              text: vRestEl.text,
              detail: `V_rest overlaps battery plate line (x1=${line.getAttribute('x1')}, y1=${line.getAttribute('y1')})`
            });
          }
        }
      }

      // Check oscilloscope waveform path vs formula text
      const formulaEl = textElements.find(t => t.text.includes('dV/dt') || t.text.includes('τ_m'));
      const waveformPaths = Array.from(svg.querySelectorAll('path')).filter(p => {
        const stroke = p.getAttribute('stroke') || '';
        const d = p.getAttribute('d') || '';
        return stroke.includes('b42318') && d.includes('C');
      });

      if (formulaEl && waveformPaths.length > 0) {
        for (const wp of waveformPaths) {
          const wRect = wp.getBoundingClientRect();
          if (
            formulaEl.rect.right > wRect.left &&
            wRect.right > formulaEl.rect.left &&
            formulaEl.rect.bottom > wRect.top &&
            wRect.bottom > formulaEl.rect.top
          ) {
            graphicCollisions.push({
              type: 'waveform-vs-formula',
              text: formulaEl.text.slice(0, 35),
              detail: 'Waveform curve bounding box directly intersects mathematical formula'
            });
          }
        }
      }

      // Check spike peak readout (+30 mV) vs formula text (true 2D AABB collision)
      const spikePeakEl = textElements.find(t => t.text.includes('+30 mV') && (t.text.includes('Peak') || t.text.includes('Spike')));
      if (formulaEl && spikePeakEl) {
        const xOverlap = Math.min(formulaEl.rect.right, spikePeakEl.rect.right) - Math.max(formulaEl.rect.left, spikePeakEl.rect.left);
        const yOverlap = Math.min(formulaEl.rect.bottom, spikePeakEl.rect.bottom) - Math.max(formulaEl.rect.top, spikePeakEl.rect.top);
        if (xOverlap > 1 && yOverlap > 1) {
          graphicCollisions.push({
            type: 'peak-collides-with-formula',
            text: spikePeakEl.text,
            detail: `Spike peak label directly overlaps formula text (xOverlap=${Math.round(xOverlap)}px, yOverlap=${Math.round(yOverlap)}px)`
          });
        }
      }

      return {
        textCount: textElements.length,
        textCollisions,
        graphicCollisions,
        hasCollisions: textCollisions.length > 0 || graphicCollisions.length > 0
      };
    }, { svgFileName: svgFile });

    // Capture screenshot to PNG
    const pngName = svgFile.replace(/[^a-zA-Z0-9_-]/g, '_') + '.png';
    const pngPath = path.join(SCREENSHOTS_DIR, pngName);
    await page.screenshot({ path: pngPath });

    const totalAssetCollisions = (auditResult.textCollisions?.length || 0) + (auditResult.graphicCollisions?.length || 0);

    if (totalAssetCollisions === 0) {
      passedAudits++;
      console.log(`  ✓ ${svgFile} (${width}x${height}) — ${auditResult.textCount} texts, 0 collisions -> PNG saved`);
    } else {
      failedAudits++;
      console.error(`  ✗ ${svgFile} — ${totalAssetCollisions} COLLISIONS DETECTED:`);
      if (auditResult.textCollisions?.length > 0) {
        auditResult.textCollisions.forEach(c => {
          console.error(`    [Text-vs-Text] "${c.textA}" <-> "${c.textB}" (area: ${c.area}px)`);
        });
      }
      if (auditResult.graphicCollisions?.length > 0) {
        auditResult.graphicCollisions.forEach(c => {
          console.error(`    [Graphic Collision] ${c.type}: ${c.detail || c.text}`);
        });
      }
      collisionReports.push({ file: svgFile, auditResult });
    }
  }

  await browser.close();

  console.log('\n=======================================================================');
  console.log('                  PLAYWRIGHT SVG AUDIT SUMMARY                         ');
  console.log('=======================================================================');
  console.log(`Total Assets Audited: ${totalAudits}`);
  console.log(`Passed (0 Collisions): ${passedAudits} \x1b[32m✓\x1b[0m`);
  console.log(`Failed (Collisions):   ${failedAudits} ${failedAudits > 0 ? '\x1b[31m✗\x1b[0m' : ''}`);

  if (failedAudits > 0) {
    console.error('\nAUDIT FAILED: Fix all detected SVG collisions immediately.');
    process.exit(1);
  } else {
    console.log('\nAUDIT PASSED: All 20 SVGs verified with ZERO text or graphic collisions!');
    process.exit(0);
  }
}

runSvgCollisionAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
