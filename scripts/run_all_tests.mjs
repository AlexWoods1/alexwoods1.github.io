/**
 * scripts/run_all_tests.mjs
 *
 * Unified Playwright Test Runner for Portfolio UI & Circuit Minimap Stabilization.
 * Runs all test suites (R2, R3, R4, Regression), reports pass/fail metrics,
 * inventories screenshot evidence, and exits with code 0 on complete pass.
 */
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { startServer, runSuite, SCREENSHOTS_DIR } from "../tests/harness.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..");

const SUITES = [
  {
    name: "Minimap Sizing & Schematic Visibility (R2)",
    path: path.resolve(REPO_ROOT, "tests/test_minimap_sizing.mjs")
  },
  {
    name: "Minimap Transitions & Symbol Synchronization (R3)",
    path: path.resolve(REPO_ROOT, "tests/test_transitions_sync.mjs")
  },
  {
    name: "Layout Spacing, Clearances & Viewport Integrity (R4)",
    path: path.resolve(REPO_ROOT, "tests/test_layout_spacing.mjs")
  },
  {
    name: "Controls, Zoom & Membrane Stability (Regression)",
    path: path.resolve(REPO_ROOT, "tests/regression.mjs")
  }
];

async function main() {
  console.log("=======================================================================");
  console.log(" Portfolio UI & Circuit Minimap Stabilization: Full Test Suite Runner ");
  console.log("=======================================================================");
  console.log(`Starting at: ${new Date().toISOString()}`);

  const startTime = performance.now();
  const { server, port, baseUrl, stop } = await startServer();
  console.log(`Ephemeral static server active at: ${baseUrl} (port ${port})\n`);
  process.env.SITE_URL = baseUrl;

  const suiteResults = [];
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of SUITES) {
    try {
      const module = await import(`file://${suite.path}?bust=${Date.now()}`);
      if (!module.tests || !Array.isArray(module.tests)) {
        throw new Error(`Suite ${suite.name} does not export 'tests' array`);
      }
      const result = await runSuite(suite.name, module.tests);
      suiteResults.push(result);
      totalTests += result.total;
      totalPassed += result.passed;
      totalFailed += result.failed;
    } catch (err) {
      console.error(`[ERROR] Failed to run suite ${suite.name}: ${err.message}`);
      suiteResults.push({
        suiteName: suite.name,
        passed: 0,
        failed: 1,
        total: 1,
        results: [{ name: suite.name, pass: false, error: err.message }]
      });
      totalTests += 1;
      totalFailed += 1;
    }
  }

  await stop();
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2);

  // Inventory screenshot artifacts
  let screenshotFiles = [];
  if (fs.existsSync(SCREENSHOTS_DIR)) {
    screenshotFiles = fs.readdirSync(SCREENSHOTS_DIR).filter((f) => f.endsWith(".png"));
  }

  console.log("\n=======================================================================");
  console.log("                         TEST EXECUTION SUMMARY                        ");
  console.log("=======================================================================");
  console.table(
    suiteResults.map((s) => ({
      "Test Suite": s.suiteName,
      Status: s.failed === 0 ? "PASSED" : "FAILED",
      Passed: s.passed,
      Failed: s.failed,
      Total: s.total
    }))
  );

  console.log(`Total Suites:     ${suiteResults.length}`);
  console.log(`Total Test Cases: ${totalTests}`);
  console.log(`Passed:           ${totalPassed} \x1b[32m✓\x1b[0m`);
  console.log(`Failed:           ${totalFailed} ${totalFailed > 0 ? "\x1b[31m✗\x1b[0m" : ""}`);
  console.log(`Total Time:       ${totalDuration}s`);
  console.log(`Screenshots Saved: ${screenshotFiles.length} in tests/screenshots/\n`);

  if (screenshotFiles.length > 0) {
    console.log("Captured Evidence Artifacts:");
    for (const f of screenshotFiles) {
      console.log(`  - tests/screenshots/${f}`);
    }
    console.log("");
  }

  if (totalFailed > 0) {
    console.error(`\x1b[31m[FAILURE] ${totalFailed} test(s) failed.\x1b[0m`);
    process.exit(1);
  } else {
    console.log("\x1b[32m[SUCCESS] All test suites passed successfully!\x1b[0m\n");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Fatal runner error:", err);
  process.exit(1);
});
