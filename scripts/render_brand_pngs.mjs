// scripts/render_brand_pngs.mjs
// Deterministically renders raster PNG assets (Open Graph, Apple Touch Icon, PWA Icons)
// from the canonical SVG media sources in docs/media/.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
const MEDIA_DIR = path.resolve(REPO_ROOT, "docs", "media");

function loadPlaywright() {
  const localReq = createRequire(import.meta.url);
  try {
    return localReq("playwright");
  } catch {
    if (process.env.PLAYWRIGHT_PACKAGE_JSON) {
      return createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON)("playwright");
    }
    throw new Error(
      "Playwright not found. Install locally (`npm install -D playwright`) or set PLAYWRIGHT_PACKAGE_JSON."
    );
  }
}

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const winChrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  return fs.existsSync(winChrome) ? winChrome : undefined;
}

const TARGETS = [
  {
    svg: "[BRAND] Open Graph Master - 1200x630.svg",
    out: "og-image.png",
    width: 1200,
    height: 630,
    transparent: false
  },
  {
    svg: "[BRAND] Apple Touch Icon - 180x180.svg",
    out: "apple-touch-icon.png",
    width: 180,
    height: 180,
    transparent: true
  },
  {
    svg: "[BRAND] PWA Launcher Icon - 512x512.svg",
    out: "icon-512.png",
    width: 512,
    height: 512,
    transparent: true
  },
  {
    svg: "[BRAND] PWA Launcher Icon - 512x512.svg",
    out: "icon-192.png",
    width: 192,
    height: 192,
    transparent: true
  }
];

async function main() {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    executablePath: resolveChromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"]
  });

  const page = await browser.newPage({ deviceScaleFactor: 1 });

  for (const t of TARGETS) {
    const svgPath = path.join(MEDIA_DIR, t.svg);
    const svgContent = fs.readFileSync(svgPath, "utf8");
    await page.setViewportSize({ width: t.width, height: t.height });

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: ${t.width}px; height: ${t.height}px; overflow: hidden; background: ${t.transparent ? "transparent" : "#f3f0e8"}; }
    svg { display: block; width: ${t.width}px; height: ${t.height}px; }
  </style>
</head>
<body>${svgContent}</body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);

    const outPath = path.join(REPO_ROOT, t.out);
    await page.screenshot({ path: outPath, omitBackground: t.transparent });
    const bytes = fs.statSync(outPath).size;
    console.log(`  ✓ Rendered ${t.out} (${t.width}x${t.height}, ${bytes} bytes)`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Fatal PNG render error:", err);
  process.exit(1);
});
