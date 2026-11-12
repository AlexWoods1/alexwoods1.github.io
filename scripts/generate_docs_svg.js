// scripts/generate_docs_svg.js
// Generates the two minimal, spacious Figma documentation frames in docs/media/
// Frame 1: [DOCS] Design System Foundations & Specifications (1600x1200)
// Frame 2: [DOCS] Gap Analysis & Technical Design Plan (1600x1200)
// Enforces User Redirects:
// 1. Clean, minimal, spacious notebook sheets with generous whitespace.
// 2. Sparse typography and ZERO dense multi-box clutter (no solid black header cards or overstuffed spec walls).
// 3. ZERO initials or lettermarks.
// 4. Incorporates Code Refactoring & Integration Step.
// 5. Absolute resume factuality adhering 100% to Alexander_Woods_Resume.pdf and index.html.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.join(__dirname, '..', 'docs', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const COMMON_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap');
  .font-brand { font-family: 'Familjen Grotesk', -apple-system, sans-serif; font-weight: 600; }
  .font-sans { font-family: 'Familjen Grotesk', -apple-system, sans-serif; }
  .font-mono { font-family: 'IBM Plex Mono', monospace; }
`;

// ==============================================================================
// FRAME 1: [DOCS] Design System Foundations & Specifications (1600x1200)
// ==============================================================================
function generateFrame1Svg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200" id="[DOCS] Design System Foundations &amp; Specifications">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="f1-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(20, 19, 17, 0.03)" stroke-width="1"/>
    </pattern>
    <pattern id="f1-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#f1-grid-minor)"/>
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(20, 19, 17, 0.06)" stroke-width="1.2"/>
    </pattern>
  </defs>

  <!-- Background Base Canvas & Grid -->
  <rect width="1600" height="1200" fill="#f3f0e8"/>
  <rect width="1600" height="1200" fill="url(#f1-grid-major)"/>

  <!-- Minimal Hairline Structural Border -->
  <rect x="36" y="36" width="1528" height="1128" fill="none" stroke="#141311" stroke-width="1.5"/>

  <!-- ========================================================================= -->
  <!-- HEADER: MINIMAL LAB NOTEBOOK BANNER                                       -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 75)">
    <text x="0" y="20" class="font-mono" font-size="13" font-weight="600" fill="#b42318" letter-spacing="0.14em">LAB NOTEBOOK // ARCHITECTURAL SPECIFICATION 01</text>
    <text x="0" y="65" class="font-brand" font-size="40" font-weight="600" fill="#141311" letter-spacing="-0.03em">Design System Foundations &amp; Specifications</text>
    <text x="0" y="98" class="font-mono" font-size="14" fill="rgba(20, 19, 17, 0.7)">Alexander Woods Portfolio · Leaky Integrate-and-Fire Laboratory Metaphor · UC San Diego</text>
    <line x1="0" y1="120" x2="1440" y2="120" stroke="rgba(20, 19, 17, 0.18)" stroke-width="1"/>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 1: COLOR PALETTE & TOKEN SYSTEM (Y: 230 to 450)                   -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 230)">
    <text x="0" y="20" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">01 / COLOR PALETTE &amp; TOKEN SYSTEM</text>
    <text x="0" y="44" class="font-sans" font-size="18" font-weight="600" fill="#141311">Laboratory Paper, Deep Carbon Ink &amp; Action Potential Crimson</text>

    <!-- Color Swatches: Clean, Open Layout -->
    <g transform="translate(0, 70)">
      <!-- Swatch 1: paper token -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="260" height="90" fill="#f3f0e8" stroke="#141311" stroke-width="1.5"/>
        <rect x="14" y="14" width="40" height="40" fill="#f3f0e8" stroke="#141311" stroke-width="1"/>
        <text x="68" y="32" class="font-mono" font-size="13" font-weight="600" fill="#141311">--paper</text>
        <text x="68" y="50" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">#f3f0e8 · Base Paper</text>
        <text x="14" y="76" class="font-sans" font-size="11" fill="rgba(20, 19, 17, 0.65)">Laboratory parchment background</text>
      </g>

      <!-- Swatch 2: ink token -->
      <g transform="translate(295, 0)">
        <rect x="0" y="0" width="260" height="90" fill="#f3f0e8" stroke="#141311" stroke-width="1.5"/>
        <rect x="14" y="14" width="40" height="40" fill="#141311"/>
        <text x="68" y="32" class="font-mono" font-size="13" font-weight="600" fill="#141311">--ink</text>
        <text x="68" y="50" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">#141311 · Carbon Ink</text>
        <text x="14" y="76" class="font-sans" font-size="11" fill="rgba(20, 19, 17, 0.65)">Hairlines, borders &amp; typography</text>
      </g>

      <!-- Swatch 3: spike token -->
      <g transform="translate(590, 0)">
        <rect x="0" y="0" width="260" height="90" fill="#f3f0e8" stroke="#141311" stroke-width="1.5"/>
        <rect x="14" y="14" width="40" height="40" fill="#b42318"/>
        <text x="68" y="32" class="font-mono" font-size="13" font-weight="600" fill="#b42318">--spike</text>
        <text x="68" y="50" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">#b42318 · Crimson Spike</text>
        <text x="14" y="76" class="font-sans" font-size="11" fill="rgba(20, 19, 17, 0.65)">Action potential crest &amp; focal pulse</text>
      </g>

      <!-- Swatch 4: paper-glass token -->
      <g transform="translate(885, 0)">
        <rect x="0" y="0" width="260" height="90" fill="#f3f0e8" stroke="#141311" stroke-width="1.5"/>
        <rect x="14" y="14" width="40" height="40" fill="rgba(243, 240, 232, 0.92)" stroke="#141311" stroke-width="1"/>
        <text x="68" y="32" class="font-mono" font-size="13" font-weight="600" fill="#141311">--paper-glass</text>
        <text x="68" y="50" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">rgba(243,240,232,0.92)</text>
        <text x="14" y="76" class="font-sans" font-size="11" fill="rgba(20, 19, 17, 0.65)">Frosted HUD overlays &amp; controls</text>
      </g>

      <!-- Swatch 5: ink-muted token -->
      <g transform="translate(1180, 0)">
        <rect x="0" y="0" width="260" height="90" fill="#f3f0e8" stroke="#141311" stroke-width="1.5"/>
        <rect x="14" y="14" width="40" height="40" fill="rgba(20, 19, 17, 0.62)"/>
        <text x="68" y="32" class="font-mono" font-size="13" font-weight="600" fill="#141311">--ink-muted</text>
        <text x="68" y="50" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">rgba(20,19,17,0.62)</text>
        <text x="14" y="76" class="font-sans" font-size="11" fill="rgba(20, 19, 17, 0.65)">Technical descriptions &amp; dates</text>
      </g>
    </g>

    <!-- Extended Formal Tokens -->
    <g transform="translate(0, 185)">
      <text x="0" y="14" class="font-mono" font-size="12" fill="rgba(20, 19, 17, 0.8)">FORMALIZED TOKENS: --grid-major: rgba(20,19,17,0.068) (120px) · --grid-minor: rgba(20,19,17,0.032) (24px) · --shadow-hard: 4px 4px 0px var(--ink)</text>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 2: TYPOGRAPHY SYSTEM (Y: 480 to 710)                              -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 480)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">02 / TYPOGRAPHY HIERARCHY</text>
    <text x="0" y="56" class="font-sans" font-size="18" font-weight="600" fill="#141311">Dual Font Stack: Humanist Grotesque &amp; High-Legibility Monospace</text>

    <g transform="translate(0, 80)">
      <!-- Left Column: Familjen Grotesk -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="700" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="20" y="32" class="font-mono" font-size="12" font-weight="600" fill="#b42318">FAMILJEN GROTESK (GOOGLE FONTS) · DISPLAY &amp; EDITORIAL</text>
        <text x="20" y="68" class="font-brand" font-size="24" font-weight="600" fill="#141311">Alexander Woods — Computational Neuroscience</text>
        <text x="20" y="96" class="font-sans" font-size="16" font-weight="400" fill="rgba(20, 19, 17, 0.8)">SemiBold 600 (Headings, titles, brand) · Regular 400 (Body text, project descriptions)</text>
        <text x="20" y="118" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.6)">Tracking: -0.04em on titles · Line-height: 0.90–1.25</text>
      </g>

      <!-- Right Column: IBM Plex Mono -->
      <g transform="translate(740, 0)">
        <rect x="0" y="0" width="700" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="20" y="32" class="font-mono" font-size="12" font-weight="600" fill="#b42318">IBM PLEX MONO (GOOGLE FONTS) · TECHNICAL &amp; EQUATIONS</text>
        <text x="20" y="68" class="font-mono" font-size="20" font-weight="500" fill="#141311">τ_m · (dV/dt) = -(V - V_rest) + R · I(t)</text>
        <text x="20" y="96" class="font-mono" font-size="13" font-weight="400" fill="rgba(20, 19, 17, 0.8)">Medium 500 (Kickers, chip controls, values) · Regular 400 (Dates, telemetry, formulas)</text>
        <text x="20" y="118" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.6)">Tracking: +0.12em uppercase kickers · Line-height: 1.00–1.45</text>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 3: LIF CIRCUIT METAPHOR PARAMETERS (Y: 740 to 950)                -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 740)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">03 / BIOLOGICAL LIF EQUIVALENT CIRCUIT PARAMETERS</text>
    <text x="0" y="56" class="font-sans" font-size="18" font-weight="600" fill="#141311">Physical Constants Derived Directly from data/lif-circuit.json &amp; index.html</text>

    <g transform="translate(0, 80)">
      <rect x="0" y="0" width="1440" height="110" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>

      <!-- Parameter List in 3 Columns -->
      <g transform="translate(30, 32)">
        <text x="0" y="0" class="font-mono" font-size="13" font-weight="600" fill="#141311">C = 200 pF</text>
        <text x="0" y="20" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Membrane Capacitance (Sec 02)</text>
        <text x="0" y="44" class="font-mono" font-size="13" font-weight="600" fill="#141311">R = 100 MΩ</text>
        <text x="0" y="64" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Leak Resistance (Sec 03)</text>
      </g>

      <g transform="translate(500, 32)">
        <text x="0" y="0" class="font-mono" font-size="13" font-weight="600" fill="#141311">τ_m = R · C = 20 ms</text>
        <text x="0" y="20" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Membrane Time Constant</text>
        <text x="0" y="44" class="font-mono" font-size="13" font-weight="600" fill="#b42318">V_th = -50 mV</text>
        <text x="0" y="64" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Comparator Threshold (Sec 04)</text>
      </g>

      <g transform="translate(970, 32)">
        <text x="0" y="0" class="font-mono" font-size="13" font-weight="600" fill="#141311">V_rest = -65 mV</text>
        <text x="0" y="20" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Resting Membrane Potential</text>
        <text x="0" y="44" class="font-mono" font-size="13" font-weight="600" fill="#b42318">V_spike = +30 mV  [V_reset = -70 mV]</text>
        <text x="0" y="64" class="font-mono" font-size="11.5" fill="rgba(20, 19, 17, 0.7)">Action Potential Crest (Sec 05)</text>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 4: MINIMALIST STANDARDS & REDIRECT COMPLIANCE (Y: 980 to 1130)    -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 980)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">04 / MINIMALIST LAYOUT STANDARDS &amp; INTEGRITY MANDATE</text>
    <text x="0" y="58" class="font-sans" font-size="15" fill="#141311">
      • ZERO initials or lettermarks: strictly NO lettermarks, initial seals, or initial watermarks anywhere.
    </text>
    <text x="0" y="82" class="font-sans" font-size="15" fill="#141311">
      • Minimalist aesthetic: abundant warm paper (#f3f0e8) whitespace, crisp hairlines (#141311), sparse typography, and single spike crimson (#b42318) accent.
    </text>
    <text x="0" y="106" class="font-sans" font-size="15" fill="#141311">
      • Factuality: 100% adherence to Alexander_Woods_Resume.pdf and index.html. No invented telemetry, fake badges, or made-up metrics.
    </text>
  </g>
</svg>`;
}

// ==============================================================================
// FRAME 2: [DOCS] Gap Analysis & Technical Design Plan (1600x1200)
// ==============================================================================
function generateFrame2Svg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1200" width="1600" height="1200" id="[DOCS] Gap Analysis &amp; Technical Design Plan">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="f2-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(20, 19, 17, 0.03)" stroke-width="1"/>
    </pattern>
    <pattern id="f2-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#f2-grid-minor)"/>
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(20, 19, 17, 0.06)" stroke-width="1.2"/>
    </pattern>
  </defs>

  <!-- Background Base Canvas & Grid -->
  <rect width="1600" height="1200" fill="#f3f0e8"/>
  <rect width="1600" height="1200" fill="url(#f2-grid-major)"/>

  <!-- Minimal Hairline Structural Border -->
  <rect x="36" y="36" width="1528" height="1128" fill="none" stroke="#141311" stroke-width="1.5"/>

  <!-- ========================================================================= -->
  <!-- HEADER: MINIMAL LAB NOTEBOOK BANNER                                       -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 75)">
    <text x="0" y="20" class="font-mono" font-size="13" font-weight="600" fill="#b42318" letter-spacing="0.14em">LAB NOTEBOOK // ARCHITECTURAL SPECIFICATION 02</text>
    <text x="0" y="65" class="font-brand" font-size="40" font-weight="600" fill="#141311" letter-spacing="-0.03em">Gap Analysis &amp; Technical Design Plan</text>
    <text x="0" y="98" class="font-mono" font-size="14" fill="rgba(20, 19, 17, 0.7)">Visual Media Audit, Production Allocation Matrix &amp; Code Refactoring Roadmap</text>
    <line x1="0" y1="120" x2="1440" y2="120" stroke="rgba(20, 19, 17, 0.18)" stroke-width="1"/>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 1: SITE GAP AUDIT (Y: 230 to 450)                                 -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 230)">
    <text x="0" y="20" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">01 / IDENTIFIED SITE DESIGN &amp; VISUAL MEDIA GAPS</text>
    <text x="0" y="44" class="font-sans" font-size="18" font-weight="600" fill="#141311">Empirical Deficiencies Identified During Portfolio Review</text>

    <g transform="translate(0, 68)">
      <rect x="0" y="0" width="1440" height="125" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>

      <g transform="translate(30, 28)">
        <text x="0" y="0" class="font-mono" font-size="12.5" font-weight="600" fill="#141311">PAUCITY OF REPOSITORY MEDIA:</text>
        <text x="0" y="20" class="font-sans" font-size="13.5" fill="rgba(20, 19, 17, 0.8)">Only favicon.svg and og-image.png existed initially; no project graphics or system schematics.</text>
        <text x="0" y="48" class="font-mono" font-size="12.5" font-weight="600" fill="#141311">MISSING WEB APPLICATION SUITE:</text>
        <text x="0" y="68" class="font-sans" font-size="13.5" fill="rgba(20, 19, 17, 0.8)">Missing Apple Touch Icon (180x180), Android PWA Launcher (512x512), and square social unfurler (1:1).</text>
      </g>

      <g transform="translate(740, 28)">
        <text x="0" y="0" class="font-mono" font-size="12.5" font-weight="600" fill="#141311">UNADORNED TECHNICAL PROJECTS:</text>
        <text x="0" y="20" class="font-sans" font-size="13.5" fill="rgba(20, 19, 17, 0.8)">All 9 projects in #threshold were plain text without data pipelines or mathematical diagrams.</text>
        <text x="0" y="48" class="font-mono" font-size="12.5" font-weight="600" fill="#141311">RECOGNITIONS LACKED PROOF:</text>
        <text x="0" y="68" class="font-sans" font-size="13.5" fill="rgba(20, 19, 17, 0.8)">1st Place win at AIC Hack for Humanity (Headcount) was buried in plain bullet text.</text>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 2: PRODUCTION MEDIA ALLOCATION MATRIX (Y: 460 to 710)             -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 460)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">02 / PRODUCTION MEDIA ASSET ALLOCATION MATRIX</text>
    <text x="0" y="56" class="font-sans" font-size="18" font-weight="600" fill="#141311">Structured Production Deliverables Across 4 Categories</text>

    <g transform="translate(0, 80)">
      <!-- 4 Columns for Categories A, B, C, D -->
      <!-- Category A -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="340" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="16" y="24" class="font-mono" font-size="12" font-weight="600" fill="#b42318">CAT A · BRAND &amp; SOCIAL (6)</text>
        <text x="16" y="48" class="font-mono" font-size="11" fill="#141311">• OG Master - 1200x630</text>
        <text x="16" y="68" class="font-mono" font-size="11" fill="#141311">• OG Retina 2x - 2400x1260</text>
        <text x="16" y="88" class="font-mono" font-size="11" fill="#141311">• OG Square - 1200x1200</text>
        <text x="16" y="108" class="font-mono" font-size="11" fill="#141311">• Apple Touch, PWA, Favicon</text>
      </g>

      <!-- Category B -->
      <g transform="translate(365, 0)">
        <rect x="0" y="0" width="340" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="16" y="24" class="font-mono" font-size="12" font-weight="600" fill="#b42318">CAT B · HERO &amp; IDENTITY (2)</text>
        <text x="16" y="48" class="font-mono" font-size="11" fill="#141311">• Architectural Banner - 1200x500</text>
        <text x="16" y="68" class="font-mono" font-size="11" fill="#141311">• Technical Circuit Seal - 400x400</text>
        <text x="16" y="96" class="font-sans" font-size="10.5" fill="rgba(20, 19, 17, 0.65)">Zero initials / lettermarks. Clean calibration seal &amp; banner.</text>
      </g>

      <!-- Category C -->
      <g transform="translate(730, 0)">
        <rect x="0" y="0" width="340" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="16" y="24" class="font-mono" font-size="12" font-weight="600" fill="#b42318">CAT C · FLAGSHIP SCHEMATICS (4)</text>
        <text x="16" y="48" class="font-mono" font-size="11" fill="#141311">• Spiking Neural Network (LIF)</text>
        <text x="16" y="68" class="font-mono" font-size="11" fill="#141311">• Headcount (AIC 1st Place)</text>
        <text x="16" y="88" class="font-mono" font-size="11" fill="#141311">• SuperSmallModel (~1M GPT)</text>
        <text x="16" y="108" class="font-mono" font-size="11" fill="#141311">• Real-Time EEG Lie Detection</text>
      </g>

      <!-- Category D -->
      <g transform="translate(1095, 0)">
        <rect x="0" y="0" width="345" height="135" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>
        <text x="16" y="24" class="font-mono" font-size="12" font-weight="600" fill="#b42318">CAT D · DOCS &amp; SYSTEMS (2)</text>
        <text x="16" y="48" class="font-mono" font-size="11" fill="#141311">• Design System Foundations</text>
        <text x="16" y="68" class="font-mono" font-size="11" fill="#141311">• Gap Analysis &amp; Design Plan</text>
        <text x="16" y="96" class="font-sans" font-size="10.5" fill="rgba(20, 19, 17, 0.65)">Clean minimal lab notebook sheets with generous whitespace.</text>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 3: CODE REFACTORING & INTEGRATION STEP (Y: 740 to 970)            -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 740)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">03 / CODE REFACTORING &amp; MODULAR INTEGRATION ROADMAP</text>
    <text x="0" y="56" class="font-sans" font-size="18" font-weight="600" fill="#141311">Minimalist, Modular Code Architecture &amp; Bloat Elimination</text>

    <g transform="translate(0, 80)">
      <rect x="0" y="0" width="1440" height="120" fill="none" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1"/>

      <g transform="translate(30, 26)">
        <text x="0" y="0" class="font-mono" font-size="12" font-weight="600" fill="#141311">1. RESPONSIVE MEDIA INTEGRATION:</text>
        <text x="0" y="20" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">Clean &lt;picture&gt; / &lt;img&gt; elements with srcset (1x/2x) for project schematics in index.html.</text>
        <text x="0" y="44" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">Metadata integration: apple-touch-icon, manifest.json, multi-res favicons, and Open Graph tags.</text>
      </g>

      <g transform="translate(560, 26)">
        <text x="0" y="0" class="font-mono" font-size="12" font-weight="600" fill="#141311">2. CSS TOKEN FORMALIZATION:</text>
        <text x="0" y="20" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">Formalize custom properties in styles.css: --grid-major, --grid-minor, --shadow-hard.</text>
        <text x="0" y="44" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">Eliminate redundant selectors &amp; duplicate media queries across breakpoints.</text>
      </g>

      <g transform="translate(1060, 26)">
        <text x="0" y="0" class="font-mono" font-size="12" font-weight="600" fill="#141311">3. MODULARITY &amp; TESTING:</text>
        <text x="0" y="20" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">Lean, pure JavaScript state transitions without bloat.</text>
        <text x="0" y="44" class="font-sans" font-size="13" fill="rgba(20, 19, 17, 0.8)">100% automated test pass via node scripts/run_all_tests.mjs.</text>
      </g>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- SECTION 4: RESUME FACTUALITY & INTEGRITY COMPLIANCE (Y: 1000 to 1130)      -->
  <!-- ========================================================================= -->
  <g transform="translate(80, 1000)">
    <line x1="0" y1="0" x2="1440" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="30" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">04 / RESUME FACTUALITY &amp; INTEGRITY COMPLIANCE</text>
    <text x="0" y="58" class="font-sans" font-size="15" fill="#141311">
      • Resume factuality: 100% faithful to Alexander_Woods_Resume.pdf. Every degree, date, project, and skill is genuine.
    </text>
    <text x="0" y="82" class="font-sans" font-size="15" fill="#141311">
      • Zero initials: absolute elimination of lettermarks, initials, or initial badges across all canvas frames.
    </text>
    <text x="0" y="106" class="font-sans" font-size="15" fill="#141311">
      • Zero fake telemetry: NO made-up metrics, NO fabricated sub-diagrams, and NO artificial stamps.
    </text>
  </g>
</svg>`;
}

// Write the two documentation frames to docs/media/
console.log('Generating minimal, spacious Figma documentation frames...');

const frame1Path = path.join(mediaDir, '[DOCS] Design System Foundations & Specifications.svg');
fs.writeFileSync(frame1Path, generateFrame1Svg(), 'utf8');
console.log(`Generated: [DOCS] Design System Foundations & Specifications.svg (${fs.statSync(frame1Path).size} bytes)`);

const frame2Path = path.join(mediaDir, '[DOCS] Gap Analysis & Technical Design Plan.svg');
fs.writeFileSync(frame2Path, generateFrame2Svg(), 'utf8');
console.log(`Generated: [DOCS] Gap Analysis & Technical Design Plan.svg (${fs.statSync(frame2Path).size} bytes)`);

console.log('Both documentation frames successfully generated in docs/media/');
