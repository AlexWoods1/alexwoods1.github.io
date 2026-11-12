// tests/test_m4_assets.mjs
// Automated verification for Milestone 4 Category C & D vector media assets.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.join(__dirname, '..', 'docs', 'media');

const expectedAssets = [
  { name: '[PROJECTS] SNN Biological Simulation - 800x450.svg', width: 800, height: 450, terms: ['LIF', 'surrogate gradient', 'JAX'] },
  { name: '[PROJECTS] Headcount Evacuation Pipeline - 800x450.svg', width: 800, height: 450, terms: ['Evacuation', 'Voice', 'AIC Hack', '1st Place'], forbiddenTerms: ['Whisper', 'Gemini'] },
  { name: '[PROJECTS] SuperSmallModel Transformer - 800x450.svg', width: 800, height: 450, terms: ['PyTorch', 'Causal', 'Attention', '~1M-parameter'] },
  { name: '[PROJECTS] EEG Lie Detection Architecture - 800x450.svg', width: 800, height: 450, terms: ['P300', '100 ms', 'ERP', '8-Channel'] },
  { name: '[PROJECTS] Spoken Multimodal Telephony - 600x400.svg', width: 600, height: 400, terms: ['Q-learning', 'Whisper', 'Gemini'] },
  { name: '[PROJECTS] Conceiva Telehealth Platform - 600x400.svg', width: 600, height: 400, terms: ['motility', 'FastAPI', 'AWS', 'Vercel'] },
  { name: '[PROJECTS] EMG Flappy Bird Neural Interface - 600x400.svg', width: 600, height: 400, terms: ['sEMG', 'BENG 152', 'Comparator'] },
  { name: '[PROJECTS] TritonDefense Autonomous Robot Car - 600x400.svg', width: 600, height: 400, terms: ['C++', 'Python', 'YOLO'] },
  { name: '[PROJECTS] Wingman Presentation Coach - 600x400.svg', width: 600, height: 400, terms: ['Smart-glasses', 'WPM', 'DS3 Hacktoberfest'] },
  { name: '[ICONS & BADGES] Component Library - 1200x800.svg', width: 1200, height: 800, terms: ['GitHub', 'LinkedIn', 'Resume', 'Python', 'AIC HACK 2026'] }
];

let failed = 0;

for (const asset of expectedAssets) {
  const filePath = path.join(mediaDir, asset.name);
  if (!fs.existsSync(filePath)) {
    console.error(`[FAIL] File missing: ${asset.name}`);
    failed++;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (content.length < 500) {
    console.error(`[FAIL] File too small: ${asset.name} (${content.length} bytes)`);
    failed++;
    continue;
  }

  // Check SVG root and dimensions
  const widthMatch = content.match(/width="(\d+)"/);
  const heightMatch = content.match(/height="(\d+)"/);
  if (!widthMatch || parseInt(widthMatch[1], 10) !== asset.width) {
    console.error(`[FAIL] Width mismatch on ${asset.name}: expected ${asset.width}, got ${widthMatch ? widthMatch[1] : 'none'}`);
    failed++;
    continue;
  }
  if (!heightMatch || parseInt(heightMatch[1], 10) !== asset.height) {
    console.error(`[FAIL] Height mismatch on ${asset.name}: expected ${asset.height}, got ${heightMatch ? heightMatch[1] : 'none'}`);
    failed++;
    continue;
  }

  // Check absence of forbidden initials
  if (/\bAW\b/.test(content)) {
    console.error(`[FAIL] Forbidden monogram initials 'AW' found in ${asset.name}`);
    failed++;
    continue;
  }

  // Check required terms
  for (const term of asset.terms) {
    if (!content.toLowerCase().includes(term.toLowerCase())) {
      console.error(`[FAIL] Expected term '${term}' missing from ${asset.name}`);
      failed++;
    }
  }

  // Check forbidden unverified guesses
  if (asset.forbiddenTerms) {
    for (const term of asset.forbiddenTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        console.error(`[FAIL] Unverified term '${term}' present in ${asset.name}`);
        failed++;
      }
    }
  }

  console.log(`[PASS] ${asset.name} (${content.length} bytes, ${asset.width}x${asset.height})`);
}

if (failed === 0) {
  console.log(`\nALL ${expectedAssets.length} ASSET VERIFICATIONS PASSED CLEANLY!`);
  process.exit(0);
} else {
  console.error(`\n${failed} ASSERTIONS FAILED.`);
  process.exit(1);
}
