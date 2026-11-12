// scripts/generate_all_m4_svgs.js
// Master generation script for Milestone 4 (Category C & D Media Assets)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  generateSNNSvg,
  generateHeadcountSvg,
  generateSSMSvg,
  generateEEGLieDetectionSvg
} from './generate_flagship_projects.js';

import {
  generateSpokenSvg,
  generateConceivaSvg,
  generateFlappyBirdSvg,
  generateTritonDefenseSvg,
  generateWingmanSvg
} from './generate_secondary_projects.js';

import {
  generateComponentLibrarySvg
} from './generate_component_library.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.join(__dirname, '..', 'docs', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const assets = [
  { name: '[PROJECTS] SNN Biological Simulation - 800x450.svg', fn: generateSNNSvg },
  { name: '[PROJECTS] Headcount Evacuation Pipeline - 800x450.svg', fn: generateHeadcountSvg },
  { name: '[PROJECTS] SuperSmallModel Transformer - 800x450.svg', fn: generateSSMSvg },
  { name: '[PROJECTS] EEG Lie Detection Architecture - 800x450.svg', fn: generateEEGLieDetectionSvg },
  { name: '[PROJECTS] Spoken Multimodal Telephony - 600x400.svg', fn: generateSpokenSvg },
  { name: '[PROJECTS] Conceiva Telehealth Platform - 600x400.svg', fn: generateConceivaSvg },
  { name: '[PROJECTS] EMG Flappy Bird Neural Interface - 600x400.svg', fn: generateFlappyBirdSvg },
  { name: '[PROJECTS] TritonDefense Autonomous Robot Car - 600x400.svg', fn: generateTritonDefenseSvg },
  { name: '[PROJECTS] Wingman Presentation Coach - 600x400.svg', fn: generateWingmanSvg },
  { name: '[ICONS & BADGES] Component Library - 1200x800.svg', fn: generateComponentLibrarySvg }
];

console.log('Generating Milestone 4 Vector Assets (Category C & D)...');
let totalBytes = 0;

for (const asset of assets) {
  const content = asset.fn();
  const filePath = path.join(mediaDir, asset.name);
  fs.writeFileSync(filePath, content, 'utf8');
  const size = Buffer.byteLength(content, 'utf8');
  totalBytes += size;
  console.log(`  ✓ Generated ${asset.name} (${size} bytes)`);
}

console.log(`Successfully generated all ${assets.length} vector assets (${(totalBytes / 1024).toFixed(1)} KB total) in docs/media/`);
