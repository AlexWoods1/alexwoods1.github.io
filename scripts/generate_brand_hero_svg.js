// scripts/generate_brand_hero_svg.js
// Remake of Category A (Brand & Social) and Category B (Hero & Identity) media assets.
// Enforces User Redirects:
// 1. ZERO initials or monograms (no "AW").
// 2. Minimalist, spacious layout with generous whitespace (warm paper #f3f0e8, ink #141311, spike-red #b42318).
// 3. Remove dense multi-panel text walls, crowded badges, or cramped multi-box layouts.
// 4. Absolute resume factuality: stick 100% to Alexander_Woods_Resume.pdf and index.html.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mediaDir = path.join(__dirname, '..', 'docs', 'media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Common font styling adhering strictly to project design tokens
const COMMON_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap');
  .font-brand { font-family: 'Familjen Grotesk', -apple-system, sans-serif; font-weight: 600; }
  .font-sans { font-family: 'Familjen Grotesk', -apple-system, sans-serif; }
  .font-mono { font-family: 'IBM Plex Mono', monospace; }
`;

// ==============================================================================
// 1. [BRAND] Open Graph Master - 1200x630
// Spacious, airy horizontal composition with generous whitespace & clean open LIF circuit
// ==============================================================================
function generateOGMasterSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" id="[BRAND] Open Graph Master - 1200x630">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="og1-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(20, 19, 17, 0.032)" stroke-width="1"/>
    </pattern>
    <pattern id="og1-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#og1-grid-minor)"/>
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(20, 19, 17, 0.068)" stroke-width="1.25"/>
    </pattern>
  </defs>

  <!-- Warm Paper Background & Technical Grid -->
  <rect width="1200" height="630" fill="#f3f0e8"/>
  <rect width="1200" height="630" fill="url(#og1-grid-major)"/>

  <!-- Minimalist Outer Hairline Border -->
  <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#141311" stroke-width="1.5"/>

  <!-- Left Column: Sparse Elegant Typography & Factual Focus -->
  <g transform="translate(72, 65)">
    <!-- Section Kicker -->
    <text x="0" y="16" class="font-mono" font-size="12" font-weight="600" fill="#b42318" letter-spacing="0.12em">I(t) · LEAKY INTEGRATE-AND-FIRE NEURON</text>

    <!-- Main Name -->
    <text x="0" y="88" class="font-brand" font-size="58" font-weight="600" fill="#141311" letter-spacing="-0.04em">Alexander Woods</text>

    <!-- Subtitle -->
    <text x="0" y="128" class="font-sans" font-size="21" font-weight="500" fill="#141311">Machine Learning, Neural Computation &amp; Applied Math</text>

    <!-- Factual Affiliation from Resume & index.html -->
    <text x="0" y="160" class="font-mono" font-size="13" font-weight="400" fill="rgba(20, 19, 17, 0.7)">UC San Diego · Cognitive Science (ML &amp; Neural Comp) &amp; Applied Math</text>

    <!-- Core Research Focus -->
    <text x="0" y="194" class="font-sans" font-size="15" font-weight="400" fill="rgba(20, 19, 17, 0.8)">Spiking neural networks, clinical &amp; real-time EEG, and applied AI systems.</text>

    <!-- Factual Honor Badge (Headcount, AIC Hack for Humanity) -->
    <g transform="translate(0, 222)">
      <rect x="0" y="0" width="340" height="28" rx="2" fill="rgba(180, 35, 24, 0.08)" stroke="#b42318" stroke-width="1"/>
      <text x="14" y="18" class="font-mono" font-size="11" font-weight="600" fill="#b42318" letter-spacing="0.04em">1st Place · AIC Hack for Humanity (Headcount)</text>
    </g>
  </g>

  <!-- Right / Center: Open Biological LIF Circuit Diagram -->
  <g id="og-circuit-schematic" transform="translate(560, 60)">
    <!-- Circuit Subtitle -->
    <text x="50" y="40" class="font-mono" font-size="11" font-weight="500" fill="rgba(20, 19, 17, 0.5)" letter-spacing="0.08em">CIRCUIT SCHEMATIC · ELECTRICAL EQUIVALENT</text>

    <!-- Main Schematic Wires -->
    <g fill="none" stroke="#141311" stroke-width="1.75" stroke-linecap="butt" stroke-linejoin="miter">
      <!-- Input current line to central node -->
      <path d="M 50 190 H 160"/>
      <path d="M 160 190 H 280"/>
      <!-- Branch down to Capacitor -->
      <path d="M 280 190 V 270"/>
      <path d="M 280 286 V 340"/>
      <!-- Branch up to Leak Resistor -->
      <path d="M 280 190 V 150"/>
      <!-- Through to Comparator -->
      <path d="M 280 190 H 370"/>
      <!-- Comparator output to spike waveform -->
      <path d="M 450 190 H 510"/>
      <!-- Output Synaptic Terminals -->
      <path d="M 560 190 H 600"/>
      <path d="M 570 190 L 600 160"/>
      <path d="M 570 190 L 600 220"/>
    </g>

    <!-- 01 · Current Source I(t) -->
    <g transform="translate(100, 190)">
      <circle cx="0" cy="0" r="24" fill="#f3f0e8" stroke="#141311" stroke-width="1.75"/>
      <line x1="-12" y1="0" x2="8" y2="0" stroke="#141311" stroke-width="1.75"/>
      <polygon points="8,-4 14,0 8,4" fill="#141311"/>
      <text x="0" y="38" text-anchor="middle" class="font-mono" font-size="13" font-weight="500" fill="#141311">I(t)</text>
    </g>

    <!-- Central Membrane Voltage Node V -->
    <circle cx="280" cy="190" r="4.5" fill="#141311"/>
    <text x="294" y="184" class="font-sans" font-size="18" font-weight="600" fill="#141311">V</text>

    <!-- 02 · Capacitor C = 200 pF -->
    <g transform="translate(280, 278)">
      <line x1="-24" y1="-8" x2="24" y2="-8" stroke="#141311" stroke-width="2"/>
      <line x1="-24" y1="8" x2="24" y2="8" stroke="#141311" stroke-width="2"/>
      <!-- Ground symbol -->
      <line x1="-18" y1="62" x2="18" y2="62" stroke="#141311" stroke-width="1.75"/>
      <line x1="-12" y1="68" x2="12" y2="68" stroke="#141311" stroke-width="1.75"/>
      <line x1="-6" y1="74" x2="6" y2="74" stroke="#141311" stroke-width="1.75"/>
      <text x="-32" y="4" text-anchor="end" class="font-mono" font-size="11.5" font-weight="500" fill="#141311">C = 200 pF</text>
    </g>

    <!-- 03 · Resistor R = 100 MΩ & Resting Potential V_rest -->
    <g transform="translate(280, 117)">
      <!-- Zigzag Resistor -->
      <path d="M 0 33 L 12 25 L -12 17 L 12 9 L -12 1 L 12 -7 L -12 -15 L 0 -23" fill="none" stroke="#141311" stroke-width="1.75"/>
      <!-- Connecting wire to battery -->
      <line x1="0" y1="-23" x2="0" y2="-52" stroke="#141311" stroke-width="1.75"/>
      <!-- Battery plates: Long plate (-52) and Short plate (-64) matching index.html -->
      <line x1="-18" y1="-52" x2="18" y2="-52" stroke="#141311" stroke-width="2.2"/>
      <line x1="-10" y1="-64" x2="10" y2="-64" stroke="#141311" stroke-width="2.2"/>
      <text x="24" y="0" class="font-mono" font-size="11.5" font-weight="500" fill="#141311">R = 100 MΩ</text>
      <text x="24" y="-55" class="font-mono" font-size="10.5" font-weight="500" fill="#141311">V_rest = -65 mV</text>
    </g>

    <!-- 04 · Comparator V_th -->
    <g transform="translate(410, 190)">
      <polygon points="-40,-35 -40,35 40,0" fill="#f3f0e8" stroke="#141311" stroke-width="1.75"/>
      <text x="-28" y="-12" class="font-mono" font-size="12" fill="#141311">+</text>
      <text x="-28" y="20" class="font-mono" font-size="12" fill="#141311">−</text>
      <text x="0" y="-42" text-anchor="middle" class="font-mono" font-size="11" font-weight="500" fill="#141311">V_th = -50 mV</text>
    </g>

    <!-- 05 · Action Potential Spike Node -->
    <g transform="translate(535, 190)">
      <path d="M -25 0 L -8 -45 L 8 40 L 25 0" fill="none" stroke="#b42318" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-8" cy="-45" r="5" fill="#b42318"/>
      <text x="-8" y="-56" text-anchor="middle" class="font-mono" font-size="11" font-weight="600" fill="#b42318">+30 mV</text>
    </g>

    <!-- 06 · Synaptic Output Nodes -->
    <g transform="translate(600, 190)">
      <circle cx="0" cy="-30" r="4.5" fill="#141311"/>
      <circle cx="0" cy="0" r="4.5" fill="#141311"/>
      <circle cx="0" cy="30" r="4.5" fill="#141311"/>
    </g>
  </g>

  <!-- Bottom: Elegant Uncrowded Oscilloscope Membrane Trace -->
  <g transform="translate(72, 420)">
    <line x1="0" y1="0" x2="1056" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>

    <!-- Equation -->
    <text x="0" y="32" class="font-mono" font-size="12" font-weight="500" fill="#141311">τ_m · (dV/dt) = -(V - V_rest) + R · I(t)  [τ_m = 20 ms]</text>

    <!-- Reference Voltage Lines -->
    <g transform="translate(480, 20)">
      <!-- -65 mV Baseline -->
      <line x1="0" y1="80" x2="465" y2="80" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="474" y="83" class="font-mono" font-size="9.5" fill="rgba(20, 19, 17, 0.6)">-65 mV (V_rest)</text>

      <!-- -50 mV Threshold -->
      <line x1="0" y1="46" x2="465" y2="46" stroke="rgba(180, 35, 24, 0.3)" stroke-width="1" stroke-dasharray="4 4"/>
      <text x="474" y="49" class="font-mono" font-size="9.5" fill="#b42318">-50 mV (V_th)</text>

      <!-- Continuous Biological Membrane Spike Waveform -->
      <path d="M 0 80 
               C 55 80, 110 74, 165 62 
               C 195 56, 215 48, 232 46
               L 242 0
               L 252 100
               C 267 96, 292 82, 330 80
               L 465 80"
            fill="none" stroke="#b42318" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="242" cy="0" r="4.5" fill="#b42318"/>
      <text x="242" y="-10" text-anchor="middle" class="font-mono" font-size="10" font-weight="600" fill="#b42318">+30 mV (Spike)</text>
    </g>

    <!-- Sparse Footer Metadata -->
    <text x="0" y="110" class="font-mono" font-size="10.5" fill="rgba(20, 19, 17, 0.5)">ALEXANDER WOODS · PORTFOLIO INSTRUMENT · HTTPS://ALEXWOODS1.GITHUB.IO/</text>
  </g>
</svg>`;
}

// ==============================================================================
// 2. [BRAND] Open Graph Retina 2x - 2400x1260
// Ultra-high-DPI 2x scale of the clean minimal OG Master
// ==============================================================================
function generateOGRetinaSvg() {
  const masterContent = generateOGMasterSvg();
  // Transform master SVG into 2x scale: viewBox="0 0 2400 1260", width="2400", height="1260"
  return masterContent
    .replace('id="[BRAND] Open Graph Master - 1200x630"', 'id="[BRAND] Open Graph Retina 2x - 2400x1260"')
    .replace('viewBox="0 0 1200 630" width="1200" height="630"', 'viewBox="0 0 2400 1260" width="2400" height="1260"')
    .replace('<rect width="1200" height="630" fill="#f3f0e8"/>\n  <rect width="1200" height="630" fill="url(#og1-grid-major)"/>',
             '<g transform="scale(2)">\n  <rect width="1200" height="630" fill="#f3f0e8"/>\n  <rect width="1200" height="630" fill="url(#og1-grid-major)"/>')
    .replace('</svg>', '</g>\n</svg>');
}

// ==============================================================================
// 3. [BRAND] Open Graph Square - 1200x1200
// Spacious 1:1 square composition with generous whitespace & clean circuit geometry
// ==============================================================================
function generateOGSquareSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200" width="1200" height="1200" id="[BRAND] Open Graph Square - 1200x1200">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="ogsq-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(20, 19, 17, 0.032)" stroke-width="1"/>
    </pattern>
    <pattern id="ogsq-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#ogsq-grid-minor)"/>
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(20, 19, 17, 0.068)" stroke-width="1.25"/>
    </pattern>
  </defs>

  <!-- Background Base Canvas & Grid -->
  <rect width="1200" height="1200" fill="#f3f0e8"/>
  <rect width="1200" height="1200" fill="url(#ogsq-grid-major)"/>

  <!-- Minimal Hairline Border -->
  <rect x="28" y="28" width="1144" height="1144" fill="none" stroke="#141311" stroke-width="1.5"/>

  <!-- Top Typographic Header -->
  <g transform="translate(80, 75)">
    <text x="0" y="20" class="font-mono" font-size="13" font-weight="600" fill="#b42318" letter-spacing="0.14em">I(t) · LEAKY INTEGRATE-AND-FIRE DYNAMICS</text>
    <text x="0" y="104" class="font-brand" font-size="68" font-weight="600" fill="#141311" letter-spacing="-0.04em">Alexander Woods</text>
    <text x="0" y="152" class="font-sans" font-size="25" font-weight="500" fill="#141311">Machine Learning, Neural Computation &amp; Applied Math</text>
    <text x="0" y="190" class="font-mono" font-size="15" fill="rgba(20, 19, 17, 0.7)">UC San Diego · Cognitive Science (ML &amp; Neural Comp) &amp; Applied Math</text>
    <text x="0" y="228" class="font-sans" font-size="18" fill="rgba(20, 19, 17, 0.8)">Spiking neural networks, real-time &amp; clinical EEG, and applied AI systems.</text>

    <!-- Factual Honor Pill -->
    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="370" height="30" rx="2" fill="rgba(180, 35, 24, 0.08)" stroke="#b42318" stroke-width="1"/>
      <text x="14" y="20" class="font-mono" font-size="11.5" font-weight="600" fill="#b42318" letter-spacing="0.04em">1st Place · AIC Hack for Humanity (Headcount)</text>
    </g>
  </g>

  <!-- Center: Wide Spacious Biological LIF Schematic -->
  <g id="ogsq-circuit" transform="translate(180, 580)">
    <!-- Circuit Lines -->
    <g fill="none" stroke="#141311" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter">
      <path d="M 0 0 H 130"/>
      <path d="M 130 0 H 260"/>
      <!-- Capacitor Branch -->
      <path d="M 260 0 V 85"/>
      <path d="M 260 101 V 160"/>
      <!-- Resistor Branch -->
      <path d="M 260 0 V -85"/>
      <!-- Comparator path -->
      <path d="M 260 0 H 420"/>
      <!-- Comparator to Spike -->
      <path d="M 500 0 H 580"/>
      <!-- Spike to Synapses -->
      <path d="M 640 0 H 740"/>
      <path d="M 700 0 L 740 -40"/>
      <path d="M 700 0 L 740 40"/>
    </g>

    <!-- Current Source I(t) -->
    <g transform="translate(60, 0)">
      <circle cx="0" cy="0" r="28" fill="#f3f0e8" stroke="#141311" stroke-width="1.8"/>
      <line x1="-14" y1="0" x2="10" y2="0" stroke="#141311" stroke-width="1.8"/>
      <polygon points="10,-5 18,0 10,5" fill="#141311"/>
      <text x="0" y="44" text-anchor="middle" class="font-mono" font-size="14" font-weight="500" fill="#141311">I(t)</text>
    </g>

    <!-- Membrane Voltage Node V -->
    <circle cx="260" cy="0" r="5" fill="#141311"/>
    <text x="276" y="-8" class="font-sans" font-size="22" font-weight="600" fill="#141311">V</text>

    <!-- Capacitor C = 200 pF -->
    <g transform="translate(260, 93)">
      <line x1="-28" y1="-8" x2="28" y2="-8" stroke="#141311" stroke-width="2.2"/>
      <line x1="-28" y1="8" x2="28" y2="8" stroke="#141311" stroke-width="2.2"/>
      <!-- Ground -->
      <line x1="-20" y1="67" x2="20" y2="67" stroke="#141311" stroke-width="1.8"/>
      <line x1="-14" y1="73" x2="14" y2="73" stroke="#141311" stroke-width="1.8"/>
      <line x1="-8" y1="79" x2="8" y2="79" stroke="#141311" stroke-width="1.8"/>
      <text x="-36" y="4" text-anchor="end" class="font-mono" font-size="13" font-weight="500" fill="#141311">C = 200 pF</text>
    </g>

    <!-- Resistor R = 100 MΩ & Resting Potential V_rest -->
    <g transform="translate(260, -118)">
      <path d="M 0 33 L 14 25 L -14 17 L 14 9 L -14 1 L 14 -7 L -14 -15 L 0 -23" fill="none" stroke="#141311" stroke-width="1.8"/>
      <!-- Connecting wire from top of zigzag to bottom battery plate -->
      <line x1="0" y1="-23" x2="0" y2="-62" stroke="#141311" stroke-width="1.8"/>
      <!-- Battery plates: Long plate (-62) and Short plate (-76) matching index.html -->
      <line x1="-24" y1="-62" x2="24" y2="-62" stroke="#141311" stroke-width="2.2"/>
      <line x1="-14" y1="-76" x2="14" y2="-76" stroke="#141311" stroke-width="2.2"/>
      <text x="32" y="4" class="font-mono" font-size="13" font-weight="500" fill="#141311">R = 100 MΩ</text>
      <text x="32" y="-65" class="font-mono" font-size="12" font-weight="500" fill="#141311">V_rest = -65 mV</text>
    </g>

    <!-- Comparator -->
    <g transform="translate(460, 0)">
      <polygon points="-40,-35 -40,35 40,0" fill="#f3f0e8" stroke="#141311" stroke-width="1.8"/>
      <text x="-28" y="-12" class="font-mono" font-size="13" fill="#141311">+</text>
      <text x="-28" y="22" class="font-mono" font-size="13" fill="#141311">−</text>
      <text x="0" y="-45" text-anchor="middle" class="font-mono" font-size="12" font-weight="500" fill="#141311">V_th = -50 mV</text>
    </g>

    <!-- Spike Waveform -->
    <g transform="translate(610, 0)">
      <path d="M -30 0 L -10 -55 L 10 50 L 30 0" fill="none" stroke="#b42318" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="-10" cy="-55" r="5.5" fill="#b42318"/>
      <text x="-10" y="-68" text-anchor="middle" class="font-mono" font-size="12" font-weight="600" fill="#b42318">+30 mV</text>
    </g>

    <!-- Synapses -->
    <g transform="translate(740, 0)">
      <circle cx="0" cy="-40" r="5" fill="#141311"/>
      <circle cx="0" cy="0" r="5" fill="#141311"/>
      <circle cx="0" cy="40" r="5" fill="#141311"/>
    </g>
  </g>

  <!-- Bottom: Oscilloscope Dynamics Trace & Formula -->
  <g transform="translate(80, 830)">
    <line x1="0" y1="0" x2="1040" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>

    <!-- Math Equation -->
    <text x="0" y="36" class="font-mono" font-size="14" font-weight="500" fill="#141311">τ_m · (dV/dt) = -(V - V_rest) + R · I(t)   [τ_m = R · C = 20 ms]</text>

    <!-- Oscilloscope waveform -->
    <g transform="translate(0, 105)">
      <!-- Reference lines -->
      <line x1="0" y1="20" x2="1040" y2="20" stroke="rgba(180, 35, 24, 0.25)" stroke-dasharray="4 4"/>
      <circle cx="456" cy="20" r="5" fill="#b42318"/>
      <text x="456" y="8" text-anchor="middle" class="font-mono" font-size="12" font-weight="600" fill="#b42318">+30 mV (Spike Peak)</text>

      <line x1="0" y1="80" x2="1040" y2="80" stroke="rgba(180, 35, 24, 0.3)" stroke-dasharray="4 4"/>
      <text x="10" y="74" class="font-mono" font-size="11" fill="#b42318">-50 mV (Threshold)</text>

      <line x1="0" y1="120" x2="1040" y2="120" stroke="rgba(20, 19, 17, 0.2)" stroke-dasharray="4 4"/>
      <text x="10" y="114" class="font-mono" font-size="11" fill="rgba(20, 19, 17, 0.6)">-65 mV (Resting)</text>

      <line x1="0" y1="146" x2="1040" y2="146" stroke="rgba(20, 19, 17, 0.15)" stroke-dasharray="4 4"/>
      <text x="10" y="142" class="font-mono" font-size="11" fill="rgba(20, 19, 17, 0.5)">-70 mV (Reset)</text>

      <!-- Waveform trace -->
      <path d="M 0 120 
               C 120 120, 240 112, 340 98 
               C 380 92, 410 84, 440 80 
               L 456 20 
               L 472 146 
               C 490 140, 520 124, 570 120 
               L 1040 120"
            fill="none" stroke="#b42318" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Footer URL -->
    <text x="0" y="295" class="font-mono" font-size="12" fill="rgba(20, 19, 17, 0.5)">ALEXANDER WOODS · HTTPS://ALEXWOODS1.GITHUB.IO/</text>
  </g>
</svg>`;
}

// ==============================================================================
// 4. [BRAND] Apple Touch Icon - 180x180
// Iconic purity matching favicon.svg. Clean framed tile, dashed threshold, crisp spike. ZERO TEXT.
// ==============================================================================
function generateAppleTouchIconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180" id="[BRAND] Apple Touch Icon - 180x180">
  <rect x="6" y="6" width="168" height="168" rx="28" fill="#f3f0e8" stroke="#141311" stroke-width="10"/>
  <line x1="22" y1="84" x2="158" y2="84" stroke="#141311" stroke-width="4.5" stroke-dasharray="8 8" opacity="0.35"/>
  <path d="M22 118 H53 L65 101" fill="none" stroke="#141311" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M115 107 H158" fill="none" stroke="#141311" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M65 101 L82 34 L101 143 L115 107" fill="none" stroke="#b42318" stroke-width="12.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="82" cy="34" r="12" fill="#b42318"/>
</svg>`;
}

// ==============================================================================
// 5. [BRAND] PWA Launcher Icon - 512x512
// Iconic purity matching favicon.svg. Clean framed tile, dashed threshold, crisp spike. ZERO TEXT.
// ==============================================================================
function generatePWALauncherSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" id="[BRAND] PWA Launcher Icon - 512x512">
  <rect x="16" y="16" width="480" height="480" rx="80" fill="#f3f0e8" stroke="#141311" stroke-width="28"/>
  <line x1="64" y1="240" x2="448" y2="240" stroke="#141311" stroke-width="13" stroke-dasharray="24 24" opacity="0.35"/>
  <path d="M64 336 H152 L184 288" fill="none" stroke="#141311" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M328 304 H448" fill="none" stroke="#141311" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M184 288 L232 96 L288 408 L328 304" fill="none" stroke="#b42318" stroke-width="35" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="232" cy="96" r="35" fill="#b42318"/>
</svg>`;
}

// ==============================================================================
// 6. [BRAND] Favicon - 32x32
// Minimal, crisp vector spike trace matching favicon.svg. ZERO TEXT.
// ==============================================================================
function generateFaviconSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" id="[BRAND] Favicon - 32x32">
  <rect x="1" y="1" width="30" height="30" rx="5" fill="#f3f0e8" stroke="#141311" stroke-width="2"/>
  <line x1="4" y1="15" x2="28" y2="15" stroke="#141311" stroke-width="1" stroke-dasharray="2 2" opacity="0.35"/>
  <path d="M4 21 H9.5 L11.5 18" fill="none" stroke="#141311" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20.5 19 H28" fill="none" stroke="#141311" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M11.5 18 L14.5 6 L18 25.5 L20.5 19" fill="none" stroke="#b42318" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="14.5" cy="6" r="2.2" fill="#b42318"/>
</svg>`;
}

// ==============================================================================
// 7. [HERO] Architectural Schematic Banner - 1200x500
// Spacious 3-zone architecture: Left text/specs, Center circuit, Right oscilloscope.
// ==============================================================================
function generateHeroBannerSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500" id="[HERO] Architectural Schematic Banner - 1200x500">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="hb-grid-minor" width="24" height="24" patternUnits="userSpaceOnUse">
      <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(20, 19, 17, 0.032)" stroke-width="1"/>
    </pattern>
    <pattern id="hb-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="url(#hb-grid-minor)"/>
      <path d="M 120 0 L 0 0 0 120" fill="none" stroke="rgba(20, 19, 17, 0.068)" stroke-width="1.25"/>
    </pattern>
  </defs>

  <!-- Canvas Background & Grid -->
  <rect width="1200" height="500" fill="#f3f0e8"/>
  <rect width="1200" height="500" fill="url(#hb-grid-major)"/>

  <!-- Outer Hairline Structural Border -->
  <rect x="20" y="20" width="1160" height="460" fill="none" stroke="#141311" stroke-width="1.5"/>

  <!-- ========================================================================= -->
  <!-- ZONE 1: LEFT TYPOGRAPHIC & SPECS COLUMN (X: 56..336)                      -->
  <!-- ========================================================================= -->
  <g transform="translate(56, 60)">
    <text x="0" y="16" class="font-mono" font-size="11" font-weight="600" fill="#b42318" letter-spacing="0.14em">01 // ARCHITECTURAL SCHEMATIC</text>
    <text x="0" y="52" class="font-brand" font-size="30" font-weight="600" fill="#141311" letter-spacing="-0.03em">Leaky Integrate-and-Fire</text>
    <text x="0" y="78" class="font-sans" font-size="14" fill="rgba(20, 19, 17, 0.75)">Biological Neural Circuit Model</text>

    <!-- Formula Box -->
    <g transform="translate(0, 110)">
      <rect x="0" y="0" width="280" height="42" fill="#ffffff" stroke="#141311" stroke-width="1"/>
      <text x="14" y="26" class="font-mono" font-size="11" font-weight="500" fill="#141311">τ_m · (dV/dt) = -(V - V_rest) + R · I(t)</text>
    </g>

    <!-- Parameter Specifications Card -->
    <g transform="translate(0, 168)">
      <rect x="0" y="0" width="280" height="150" fill="#ffffff" stroke="#141311" stroke-width="1"/>
      <text x="16" y="26" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">MODEL PARAMETERS</text>
      <line x1="16" y1="36" x2="264" y2="36" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8"/>
      <text x="16" y="58" class="font-mono" font-size="10.5" fill="#141311">τ_m = R · C = 20 ms</text>
      <text x="16" y="80" class="font-mono" font-size="10.5" fill="#141311">C = 200 pF (Capacitance)</text>
      <text x="16" y="102" class="font-mono" font-size="10.5" fill="#141311">R = 100 MΩ (Leak Resistance)</text>
      <text x="16" y="124" class="font-mono" font-size="10.5" fill="#b42318">V_rest = -65 mV · V_th = -50 mV</text>
      <text x="16" y="142" class="font-mono" font-size="9.5" fill="rgba(20, 19, 17, 0.6)">Spike = +30 mV · Reset = -70 mV</text>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- ZONE 2: CENTER CIRCUIT SCHEMATIC (X: 370..760, Y: 220)                   -->
  <!-- ========================================================================= -->
  <g id="hb-schematic" transform="translate(370, 220)">
    <!-- Main Wiring Lines -->
    <g fill="none" stroke="#141311" stroke-width="1.8" stroke-linecap="butt" stroke-linejoin="miter">
      <path d="M 0 0 H 60"/>
      <path d="M 60 0 H 140"/>
      <!-- Down to Capacitor -->
      <path d="M 140 0 V 55"/>
      <path d="M 140 69 V 105"/>
      <!-- Up to Resistor -->
      <path d="M 140 0 V -45"/>
      <!-- Through to Comparator -->
      <path d="M 140 0 H 260"/>
      <!-- Comparator output to Right Zone -->
      <path d="M 320 0 H 380"/>
    </g>

    <!-- 01 · Current Source I(t) -->
    <g transform="translate(30, 0)">
      <circle cx="0" cy="0" r="22" fill="#f3f0e8" stroke="#141311" stroke-width="1.8"/>
      <line x1="-12" y1="0" x2="6" y2="0" stroke="#141311" stroke-width="1.8"/>
      <polygon points="6,-4 12,0 6,4" fill="#141311"/>
      <text x="0" y="34" text-anchor="middle" class="font-mono" font-size="11" font-weight="500" fill="#141311">I(t)</text>
    </g>

    <!-- Node V -->
    <circle cx="140" cy="0" r="4.5" fill="#141311"/>
    <text x="152" y="-8" class="font-sans" font-size="18" font-weight="600" fill="#141311">V</text>

    <!-- 02 · Capacitor C = 200 pF & Ground -->
    <g transform="translate(140, 62)">
      <line x1="-22" y1="-7" x2="22" y2="-7" stroke="#141311" stroke-width="2.2"/>
      <line x1="-22" y1="7" x2="22" y2="7" stroke="#141311" stroke-width="2.2"/>
      <!-- Ground -->
      <line x1="-16" y1="43" x2="16" y2="43" stroke="#141311" stroke-width="1.8"/>
      <line x1="-10" y1="49" x2="10" y2="49" stroke="#141311" stroke-width="1.8"/>
      <line x1="-5" y1="55" x2="5" y2="55" stroke="#141311" stroke-width="1.8"/>
      <text x="-28" y="4" text-anchor="end" class="font-mono" font-size="11" font-weight="500" fill="#141311">C = 200 pF</text>
    </g>

    <!-- 03 · Resistor R = 100 MΩ & Battery V_rest (matching index.html) -->
    <g transform="translate(140, -80)">
      <path d="M 0 35 L 10 27 L -10 19 L 10 11 L -10 3 L 10 -5 L -10 -13 L 0 -22" fill="none" stroke="#141311" stroke-width="1.8"/>
      <!-- Wire from zigzag to bottom battery plate -->
      <line x1="0" y1="-22" x2="0" y2="-45" stroke="#141311" stroke-width="1.8"/>
      <!-- Battery plates: Long plate (-45) and Short plate (-57) matching index.html -->
      <line x1="-20" y1="-45" x2="20" y2="-45" stroke="#141311" stroke-width="2.2"/>
      <line x1="-12" y1="-57" x2="12" y2="-57" stroke="#141311" stroke-width="2.2"/>
      <text x="24" y="4" class="font-mono" font-size="11" font-weight="500" fill="#141311">R = 100 MΩ</text>
      <text x="24" y="-48" class="font-mono" font-size="11" font-weight="500" fill="#141311">V_rest = -65 mV</text>
    </g>

    <!-- 04 · Comparator V_th -->
    <g transform="translate(290, 0)">
      <polygon points="-30,-28 -30,28 30,0" fill="#f3f0e8" stroke="#141311" stroke-width="1.8"/>
      <text x="-20" y="-8" class="font-mono" font-size="11" fill="#141311">+</text>
      <text x="-20" y="16" class="font-mono" font-size="11" fill="#141311">−</text>
      <text x="0" y="-34" text-anchor="middle" class="font-mono" font-size="10.5" font-weight="500" fill="#141311">V_th = -50 mV</text>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- ZONE 3: RIGHT OSCILLOSCOPE DYNAMICS & WAVEFORM TRACE (X: 775..1145)       -->
  <!-- ========================================================================= -->
  <g transform="translate(775, 60)">
    <rect x="0" y="0" width="370" height="340" fill="#ffffff" stroke="#141311" stroke-width="1.25"/>
    <text x="18" y="28" class="font-mono" font-size="10" font-weight="600" fill="#b42318" letter-spacing="0.1em">ACTION POTENTIAL DYNAMICS</text>
    <text x="18" y="48" class="font-sans" font-size="13" font-weight="500" fill="#141311">Membrane Voltage Oscilloscope</text>

    <!-- Oscilloscope Grid & Reference Lines -->
    <g transform="translate(18, 70)">
      <!-- Spike Peak (+30 mV) -->
      <line x1="0" y1="30" x2="334" y2="30" stroke="rgba(180, 35, 24, 0.25)" stroke-width="1" stroke-dasharray="3 3"/>
      <circle cx="180" cy="30" r="4.5" fill="#b42318"/>
      <text x="330" y="25" text-anchor="end" class="font-mono" font-size="9" font-weight="600" fill="#b42318">+30 mV (Spike Peak)</text>

      <!-- Threshold (-50 mV) -->
      <line x1="0" y1="90" x2="334" y2="90" stroke="rgba(180, 35, 24, 0.25)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="330" y="85" text-anchor="end" class="font-mono" font-size="9" fill="#b42318">-50 mV (Threshold)</text>

      <!-- Resting (-65 mV) -->
      <line x1="0" y1="130" x2="334" y2="130" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="330" y="125" text-anchor="end" class="font-mono" font-size="9" fill="rgba(20, 19, 17, 0.6)">-65 mV (Resting)</text>

      <!-- Reset (-70 mV) -->
      <line x1="0" y1="154" x2="334" y2="154" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1" stroke-dasharray="3 3"/>
      <text x="330" y="150" text-anchor="end" class="font-mono" font-size="9" fill="rgba(20, 19, 17, 0.5)">-70 mV (Reset)</text>

      <!-- Oscilloscope Waveform Trace -->
      <path d="M 0 130 
               C 50 130, 100 125, 135 110 
               C 155 100, 168 94, 174 90 
               L 180 30 
               L 188 154 
               C 200 148, 225 134, 260 130 
               L 334 130" 
            fill="none" stroke="#b42318" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Synapses / Output Terminal -->
    <g transform="translate(18, 280)">
      <line x1="0" y1="0" x2="334" y2="0" stroke="rgba(20, 19, 17, 0.12)" stroke-width="0.8"/>
      <text x="0" y="24" class="font-mono" font-size="9.5" fill="rgba(20, 19, 17, 0.7)">Axonal Transmission: Postsynaptic Terminals</text>
      <circle cx="280" cy="22" r="3.5" fill="#141311"/>
      <circle cx="300" cy="12" r="3.5" fill="#141311"/>
      <circle cx="300" cy="32" r="3.5" fill="#141311"/>
    </g>
  </g>

  <!-- ========================================================================= -->
  <!-- ZONE 4: BOTTOM TECHNICAL BAR (Y: 440)                                     -->
  <!-- ========================================================================= -->
  <g transform="translate(56, 440)">
    <line x1="0" y1="0" x2="1088" y2="0" stroke="rgba(20, 19, 17, 0.15)" stroke-width="1"/>
    <text x="0" y="20" class="font-mono" font-size="10" fill="rgba(20, 19, 17, 0.6)">PARAMETERS: C=200pF · R=100MΩ · τ_m=20ms · V_rest=-65mV · V_th=-50mV · V_spike=+30mV · V_reset=-70mV</text>
    <text x="1088" y="20" text-anchor="end" class="font-mono" font-size="10" fill="#b42318" font-weight="500">ALEXANDER WOODS · UC SAN DIEGO</text>
  </g>
</svg>`;
}

// ==============================================================================
// 8. [HERO] Technical Circuit Seal - 400x400 (renamed from Monogram)
// Precision circular instrument seal with clean calibration ticks and LIF circuit symbols. NO INITIALS.
// ==============================================================================
function generateCircuitSealSvg() {
  // Generate 24 tick lines every 15 degrees between r=174 and r=186
  let ticks = '';
  for (let angle = 0; angle < 360; angle += 15) {
    const rad = (angle * Math.PI) / 180;
    const x1 = (200 + 174 * Math.cos(rad)).toFixed(2);
    const y1 = (200 + 174 * Math.sin(rad)).toFixed(2);
    const x2 = (200 + 186 * Math.cos(rad)).toFixed(2);
    const y2 = (200 + 186 * Math.sin(rad)).toFixed(2);
    const isMajor = angle % 45 === 0;
    ticks += `\n    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#141311" stroke-width="${isMajor ? 2 : 1.25}"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" id="[HERO] Technical Circuit Seal - 400x400">
  <defs>
    <style>
      ${COMMON_STYLE}
    </style>
    <pattern id="seal-grid" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(20, 19, 17, 0.035)" stroke-width="1"/>
    </pattern>
    <!-- Circular Path for Text Alignment -->
    <path id="seal-text-path-top" d="M 45 200 A 155 155 0 0 1 355 200" fill="none"/>
    <path id="seal-text-path-bottom" d="M 355 200 A 155 155 0 0 1 45 200" fill="none"/>
  </defs>

  <!-- Background Base Canvas & Grid -->
  <rect width="400" height="400" fill="#f3f0e8"/>
  <rect width="400" height="400" fill="url(#seal-grid)"/>

  <!-- Outer Concentric Calibration Rings -->
  <circle cx="200" cy="200" r="186" fill="none" stroke="#141311" stroke-width="2.5"/>
  <circle cx="200" cy="200" r="174" fill="none" stroke="#141311" stroke-width="1"/>
  <circle cx="200" cy="200" r="142" fill="none" stroke="rgba(20, 19, 17, 0.25)" stroke-width="1" stroke-dasharray="3 3"/>

  <!-- Radial Angular Calibration Ticks -->
  <g>
    ${ticks}
  </g>

  <!-- Circular Text Inscriptions (Strictly NO INITIALS) -->
  <text class="font-mono" font-size="10" font-weight="600" fill="#141311" letter-spacing="0.12em">
    <textPath href="#seal-text-path-top" startOffset="50%" text-anchor="middle">
      COMPUTATIONAL NEUROSCIENCE &amp; AI SYSTEMS
    </textPath>
  </text>
  <text class="font-mono" font-size="10" font-weight="600" fill="#141311" letter-spacing="0.12em">
    <textPath href="#seal-text-path-bottom" startOffset="50%" text-anchor="middle">
      UC SAN DIEGO · LEAKY INTEGRATE-AND-FIRE
    </textPath>
  </text>

  <!-- Center Motif: Clean Biological LIF Circuit Symbols & Spike Waveform -->
  <g transform="translate(200, 200)">
    <!-- Baseline resting trace -->
    <line x1="-105" y1="36" x2="105" y2="36" stroke="rgba(20, 19, 17, 0.2)" stroke-width="1.25" stroke-dasharray="3 3"/>
    <text x="-102" y="51" class="font-mono" font-size="8.5" fill="rgba(20, 19, 17, 0.6)">V_rest = -65 mV</text>

    <!-- Threshold trace -->
    <line x1="-105" y1="-10" x2="105" y2="-10" stroke="rgba(180, 35, 24, 0.3)" stroke-width="1.25" stroke-dasharray="3 3"/>
    <text x="-95" y="-16" class="font-mono" font-size="8.5" fill="#b42318">V_th = -50 mV</text>

    <!-- Prominent Crimson Spike Waveform -->
    <path d="M -105 36 
             C -60 36, -30 28, -12 6 
             L 0 -68 
             L 14 65 
             C 35 52, 65 38, 105 36" 
          fill="none" stroke="#b42318" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>

    <!-- Apex Spike Node Marker -->
    <circle cx="0" cy="-68" r="6" fill="#b42318" stroke="#141311" stroke-width="1.5"/>
    <text x="0" y="-80" text-anchor="middle" class="font-mono" font-size="9.5" font-weight="600" fill="#b42318">+30 mV</text>

    <!-- Central Soma Capacitor & Comparator Glyph -->
    <g transform="translate(0, 72)">
      <line x1="-20" y1="-4" x2="20" y2="-4" stroke="#141311" stroke-width="2"/>
      <line x1="-20" y1="4" x2="20" y2="4" stroke="#141311" stroke-width="2"/>
      <text x="0" y="20" text-anchor="middle" class="font-mono" font-size="8.5" font-weight="500" fill="#141311">C = 200 pF · τ_m = 20 ms</text>
    </g>
  </g>
</svg>`;
}

// ==============================================================================
// ASSET DISPATCH REGISTRY
// ==============================================================================
const ASSETS = [
  {
    filename: '[BRAND] Open Graph Master - 1200x630.svg',
    generate: generateOGMasterSvg
  },
  {
    filename: '[BRAND] Open Graph Retina 2x - 2400x1260.svg',
    generate: generateOGRetinaSvg
  },
  {
    filename: '[BRAND] Open Graph Square - 1200x1200.svg',
    generate: generateOGSquareSvg
  },
  {
    filename: '[BRAND] Apple Touch Icon - 180x180.svg',
    generate: generateAppleTouchIconSvg
  },
  {
    filename: '[BRAND] PWA Launcher Icon - 512x512.svg',
    generate: generatePWALauncherSvg
  },
  {
    filename: '[BRAND] Favicon - 32x32.svg',
    generate: generateFaviconSvg
  },
  {
    filename: '[HERO] Architectural Schematic Banner - 1200x500.svg',
    generate: generateHeroBannerSvg
  },
  {
    filename: '[HERO] Technical Circuit Seal - 400x400.svg',
    generate: generateCircuitSealSvg
  }
];

console.log('Generating Category A (Brand & Social) and Category B (Hero & Identity) SVG assets...');

for (const asset of ASSETS) {
  const filePath = path.join(mediaDir, asset.filename);
  const svgContent = asset.generate();
  fs.writeFileSync(filePath, svgContent, 'utf8');
  const stats = fs.statSync(filePath);
  console.log(`Generated: ${asset.filename} (${stats.size} bytes)`);
}

// Remove legacy monogram asset if it exists
const legacyMonogram = path.join(mediaDir, '[HERO] Technical Monogram & Seal - 400x400.svg');
if (fs.existsSync(legacyMonogram)) {
  fs.unlinkSync(legacyMonogram);
  console.log('Removed legacy monogram asset: [HERO] Technical Monogram & Seal - 400x400.svg');
}

console.log('All 8 Category A & B vector assets successfully generated in docs/media/');
