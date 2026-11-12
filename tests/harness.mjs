/**
 * Shared Playwright Test Harness for Portfolio UI & Circuit Minimap Stabilization.
 * Provides ephemeral HTTP static server on port 0 and local Chrome launcher.
 */
import { createRequire } from "node:module";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");
export const SCREENSHOTS_DIR = path.resolve(__dirname, "screenshots");

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

export const { chromium, devices } = loadPlaywright();
export const CHROME_PATH = resolveChromePath();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

/**
 * Creates and starts an ephemeral static HTTP server serving the repo root on port 0.
 * @returns {Promise<{ server: http.Server, port: number, baseUrl: string, stop: () => Promise<void> }>}
 */
export async function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = new URL(req.url, "http://127.0.0.1");
        let pathname = decodeURIComponent(parsedUrl.pathname);
        if (pathname === "/") pathname = "/index.html";

        const filePath = path.normalize(path.join(REPO_ROOT, pathname));

        if (!filePath.startsWith(REPO_ROOT)) {
          res.writeHead(403, { "Content-Type": "text/plain" });
          res.end("Forbidden");
          return;
        }

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("Not Found: " + pathname);
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const content = fs.readFileSync(filePath);

        res.writeHead(200, {
          "Content-Type": contentType,
          "Content-Length": content.length,
          "Cache-Control": "no-cache, no-store, must-revalidate"
        });
        res.end(content);
      } catch (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error: " + err.message);
      }
    });

    server.on("error", reject);

    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address.port;
      const baseUrl = `http://127.0.0.1:${port}`;
      resolve({
        server,
        port,
        baseUrl,
        stop: () =>
          new Promise((closeResolve) => {
            server.close(() => closeResolve());
          })
      });
    });
  });
}

/**
 * Gets test base URL: either from process.env.SITE_URL or spins up an ephemeral server.
 */
export async function getTestUrl() {
  if (process.env.SITE_URL) {
    return {
      baseUrl: process.env.SITE_URL,
      stop: async () => {}
    };
  }
  return startServer();
}

/**
 * Launches local Google Chrome via Playwright.
 */
export async function launchBrowser(extraOptions = {}) {
  return chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none"
    ],
    ...extraOptions
  });
}

/**
 * Ensures screenshots directory exists and captures page screenshot.
 */
export async function saveScreenshot(page, filename) {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
  const destPath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: destPath, fullPage: false });
  return destPath;
}

/**
 * Simple assertion utility.
 */
export function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg);
  }
}

/**
 * Reads the stage scale transform from the page.
 */
export async function getStageScale(page) {
  return page.evaluate(() => {
    const stage = document.getElementById("stage");
    if (!stage) return 0;
    const t = stage.style.transform || "";
    const m = t.match(/scale\(([\d.]+)\)/);
    return m ? parseFloat(m[1]) : 0;
  });
}

/**
 * Reads the stage translation (tx, ty) from the page.
 */
export async function getStageTranslate(page) {
  return page.evaluate(() => {
    const stage = document.getElementById("stage");
    if (!stage) return { x: 0, y: 0 };
    const t = stage.style.transform || "";
    const m = t.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
  });
}

/**
 * Reads viewport bounding box.
 */
export async function getViewportBox(page) {
  return page.evaluate(() => {
    const vp = document.getElementById("viewport");
    if (!vp) return null;
    const rect = vp.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height
    };
  });
}

/**
 * Waits for circuit mode.
 */
export async function waitForCircuit(page, timeout = 5000) {
  await page.waitForFunction(() => document.body.classList.contains("circuit-on"), null, {
    timeout
  });
}

/**
 * Waits for page mode.
 */
export async function waitForPageMode(page, timeout = 5000) {
  await page.waitForFunction(() => document.body.classList.contains("page-mode"), null, {
    timeout
  });
}

/**
 * Helper to run a test suite object: { suiteName, tests: [ [name, fn], ... ] }
 */
export async function runSuite(suiteName, tests) {
  console.log(`\n=== Running Test Suite: ${suiteName} ===`);
  const { baseUrl, stop } = await getTestUrl();
  const browser = await launchBrowser();
  let passed = 0;
  let failed = 0;
  const results = [];

  for (const [name, fn] of tests) {
    const start = performance.now();
    try {
      await fn({ browser, baseUrl });
      const dur = Math.round(performance.now() - start);
      console.log(`  [PASS] ${name} (${dur}ms)`);
      results.push({ name, pass: true, duration: dur });
      passed++;
    } catch (err) {
      const dur = Math.round(performance.now() - start);
      console.error(`  [FAIL] ${name} (${dur}ms): ${err.message}`);
      results.push({ name, pass: false, error: err.message, duration: dur });
      failed++;
    }
  }

  await browser.close();
  await stop();

  console.log(
    `--- Finished ${suiteName}: ${passed} passed, ${failed} failed (${results.length} total) ---\n`
  );

  return { suiteName, passed, failed, total: results.length, results };
}
