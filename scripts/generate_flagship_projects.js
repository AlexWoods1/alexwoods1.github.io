// scripts/generate_flagship_projects.js
// Milestone 4: Minimalist, authentic Category C Flagship Projects (800x450 px, 16:9)
// Strictly follows the user's redirect:
// - NO initials or monograms
// - NO dense multi-panel text frames or invented metrics
// - Spacious, elegant, minimalist engineering schematics with ample warm paper whitespace

import { COMMON_STYLE, makeMinimalGrid, makeMinimalFrame, makeMinimalHeader } from './lib/svg_helpers.js';

// ==============================================================================
// 1. [PROJECTS] SNN Biological Simulation - 800x450
// ==============================================================================
export function generateSNNSvg() {
  const w = 800;
  const h = 450;
  const id = "[PROJECTS] SNN Biological Simulation - 800x450";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('snn')}
    <marker id="snn-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#snn-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 24)}

  <!-- Minimal Header -->
  ${makeMinimalHeader(48, 52, '04 · PROJECTS // COMPARATOR · V ≥ Vth', 'Spiking Neural Network', 'Custom biologically inspired LIF network trained via derived surrogate gradient descent in NumPy and JAX.')}

  <!-- ===================================================================== -->
  <!-- LEFT: LIF RC CIRCUIT SCHEMATIC (X: 48, Y: 130, W: 330, H: 255)        -->
  <!-- ===================================================================== -->
  <g transform="translate(48, 130)">
    <rect x="0" y="0" width="330" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">LIF EQUIVALENT CIRCUIT MODEL</text>

    <!-- Circuit Wires -->
    <g fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="miter">
      <!-- Injected Current I(t) -->
      <path d="M 30 110 H 90" marker-end="url(#snn-arr)" />
      <!-- Main Rail -->
      <path d="M 90 110 H 220" />
      <circle cx="150" cy="110" r="3" fill="#141311" />
      
      <!-- Parallel Capacitor C = 200 pF -->
      <path d="M 125 110 V 145" />
      <path d="M 110 145 H 140" />
      <path d="M 110 152 H 140" />
      <path d="M 125 152 V 185" />
      <!-- Ground -->
      <path d="M 115 185 H 135 M 119 190 H 131 M 123 195 H 127" />

      <!-- Parallel Resistor R = 100 MΩ to Vrest -->
      <path d="M 180 110 V 135" />
      <path d="M 180 135 L 188 141 L 172 147 L 188 153 L 172 159 L 188 165 L 180 171" />
      <path d="M 180 171 V 185" />
      <path d="M 170 185 H 190" />

      <!-- Comparator Op-Amp (Threshold Vth) -->
      <path d="M 220 85 V 135 L 260 110 Z" />
      <!-- Output line to spike -->
      <path d="M 260 110 H 305" />
    </g>

    <!-- Circuit Labels (zero overlap with plates) -->
    <text x="24" y="102" class="font-mono" font-size="9" fill="#141311">I(t)</text>
    <text x="150" y="102" class="font-mono" font-size="10" font-weight="600" fill="#141311">V</text>
    <text x="103" y="151" text-anchor="end" class="font-mono" font-size="8.5" fill="rgba(20, 19, 17, 0.7)">C = 200 pF</text>
    <text x="195" y="152" class="font-mono" font-size="8.5" fill="rgba(20, 19, 17, 0.7)">R = 100 MΩ</text>
    <text x="180" y="202" text-anchor="middle" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.7)">V_rest = -65 mV</text>
    <text x="228" y="113" class="font-mono" font-size="8" fill="#141311">V_th</text>
    <circle cx="305" cy="110" r="3.5" fill="#b42318" />
    <text x="282" y="100" class="font-mono" font-size="8.5" font-weight="600" fill="#b42318">spike</text>

    <!-- Differential Equation in box -->
    <rect x="16" y="214" width="298" height="28" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="26" y="232" class="font-mono" font-size="9" fill="#141311">τ_m · dV/dt = -(V - V_rest) + R · I(t)   [τ_m = 20 ms]</text>
  </g>

  <!-- ===================================================================== -->
  <!-- RIGHT: MEMBRANE OSCILLOSCOPE TRACE (X: 410, Y: 130, W: 342, H: 255)   -->
  <!-- ===================================================================== -->
  <g transform="translate(410, 130)">
    <rect x="0" y="0" width="342" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">MEMBRANE POTENTIAL &amp; SURROGATE GD</text>

    <!-- Scope Display Screen -->
    <g transform="translate(16, 38)">
      <rect x="0" y="0" width="310" height="150" fill="#ffffff" stroke="#141311" stroke-width="1" />
      
      <!-- Grid lines -->
      <line x1="0" y1="35" x2="310" y2="35" stroke="rgba(180, 35, 24, 0.25)" stroke-width="1" stroke-dasharray="3 3" />
      <text x="8" y="29" class="font-mono" font-size="8" font-weight="600" fill="#b42318">V_th = -50 mV</text>

      <line x1="0" y1="90" x2="310" y2="90" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8" stroke-dasharray="2 2" />
      <text x="8" y="102" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.55)">V_rest = -65 mV</text>

      <line x1="0" y1="125" x2="310" y2="125" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8" stroke-dasharray="2 2" />
      <text x="8" y="121" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.5)">V_reset = -70 mV</text>

      <!-- Action Potential Firing Waveform -->
      <path d="M 15 90 Q 60 88 100 65 T 145 35 L 148 14 L 152 135 L 175 135 Q 210 130 240 70 T 275 35 L 278 14 L 282 135 L 305 135" fill="none" stroke="#141311" stroke-width="1.6" />

      <!-- Spike Peaks with crimson accents -->
      <circle cx="148" cy="14" r="3.5" fill="#b42318" />
      <text x="148" y="9" text-anchor="middle" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">+30 mV</text>

      <circle cx="278" cy="14" r="3.5" fill="#b42318" />
      <text x="278" y="9" text-anchor="middle" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">+30 mV</text>
    </g>

    <!-- Surrogate Gradient Formula & Explanation -->
    <rect x="16" y="198" width="310" height="44" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="24" y="215" class="font-mono" font-size="8.5" font-weight="600" fill="#b42318">Surrogate Gradient Backprop (NumPy &amp; JAX):</text>
    <text x="24" y="231" class="font-mono" font-size="7.5" fill="#141311">σ'(V) = 1 / (1 + α·|V − V_th|)²  ·  Derived continuous pass</text>
  </g>
</svg>`;
}

// ==============================================================================
// 2. [PROJECTS] Headcount Evacuation Pipeline - 800x450
// Strictly verbatim facts from HEAD:index.html — zero unverified vendor guesses.
// ==============================================================================
export function generateHeadcountSvg() {
  const w = 800;
  const h = 450;
  const id = "[PROJECTS] Headcount Evacuation Pipeline - 800x450";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('headcount')}
    <marker id="hc-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#headcount-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 24)}

  <!-- Minimal Header -->
  ${makeMinimalHeader(48, 52, '04 · PROJECTS // 1ST PLACE · AIC HACK FOR HUMANITY (NOV 2026)', 'Headcount Evacuation Pipeline', 'Calls every older adult in an evacuation zone, in their language, until everyone is accounted for.')}

  <!-- ===================================================================== -->
  <!-- HORIZONTAL DATAFLOW PIPELINE (SPACIOUS, OPEN, STRICTLY FACTUAL)        -->
  <!-- ===================================================================== -->
  <g transform="translate(48, 140)">
    <!-- Stage 1: Evacuation Zone Roster -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="155" height="150" fill="#ffffff" stroke="#141311" stroke-width="1.25" />
      <text x="14" y="24" class="font-mono" font-size="8" font-weight="600" fill="#141311">01 · EVACUATION ZONE</text>
      <text x="14" y="44" class="font-brand" font-size="13.5" font-weight="600" fill="#141311">Resident Outreach</text>
      <text x="14" y="66" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Older adults in active zone</text>
      <line x1="14" y1="85" x2="141" y2="85" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8" />
      <text x="14" y="105" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Automated outbound call</text>
      <text x="14" y="125" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Persistent retry loop</text>
    </g>

    <!-- Connector 1 -->
    <path d="M 155 75 H 183" stroke="#141311" stroke-width="1.5" marker-end="url(#hc-arr)" />

    <!-- Stage 2: Multilingual Voice Agent -->
    <g transform="translate(183, 0)">
      <rect x="0" y="0" width="155" height="150" fill="#ffffff" stroke="#141311" stroke-width="1.25" />
      <text x="14" y="24" class="font-mono" font-size="8" font-weight="600" fill="#141311">02 · VOICE AGENT</text>
      <text x="14" y="44" class="font-brand" font-size="13.5" font-weight="600" fill="#141311">Multilingual Call</text>
      <text x="14" y="66" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Speaks resident language</text>
      <line x1="14" y1="85" x2="141" y2="85" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8" />
      <text x="14" y="105" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Live voice dialogue</text>
      <text x="14" y="125" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Accessible phone reach</text>
    </g>

    <!-- Connector 2 -->
    <path d="M 338 75 H 366" stroke="#141311" stroke-width="1.5" marker-end="url(#hc-arr)" />

    <!-- Stage 3: Safety Check-In -->
    <g transform="translate(366, 0)">
      <rect x="0" y="0" width="155" height="150" fill="#ffffff" stroke="#141311" stroke-width="1.25" />
      <text x="14" y="24" class="font-mono" font-size="8" font-weight="600" fill="#141311">03 · STATUS CHECK</text>
      <text x="14" y="44" class="font-brand" font-size="13.5" font-weight="600" fill="#141311">Safety Verification</text>
      <text x="14" y="66" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Confirms resident status</text>
      <line x1="14" y1="85" x2="141" y2="85" stroke="rgba(20, 19, 17, 0.15)" stroke-width="0.8" />
      <text x="14" y="105" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Evacuation readiness</text>
      <text x="14" y="125" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.65)">Assistance escalation</text>
    </g>

    <!-- Connector 3 -->
    <path d="M 521 75 H 549" stroke="#141311" stroke-width="1.5" marker-end="url(#hc-arr)" />

    <!-- Stage 4: Full Accountability (Crimson Accent) -->
    <g transform="translate(549, 0)">
      <rect x="0" y="0" width="155" height="150" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="1.5" />
      <text x="14" y="24" class="font-mono" font-size="8" font-weight="600" fill="#b42318">04 · ACCOUNTABILITY</text>
      <text x="14" y="44" class="font-brand" font-size="13.5" font-weight="600" fill="#b42318">Zone Accounted</text>
      <text x="14" y="66" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Zero residents left behind</text>
      <line x1="14" y1="85" x2="141" y2="85" stroke="rgba(180, 35, 24, 0.2)" stroke-width="0.8" />
      <text x="14" y="105" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Confirmed Evacuated</text>
      <text x="14" y="125" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Needs Immediate Help</text>
    </g>
  </g>

  <!-- Bottom Details Bar -->
  <g transform="translate(48, 320)">
    <rect x="0" y="0" width="704" height="65" fill="#f3f0e8" stroke="#141311" stroke-width="1" />
    <text x="20" y="26" class="font-mono" font-size="9" font-weight="600" fill="#141311">RECOGNITION &amp; VERIFIED OVERVIEW:</text>
    <text x="20" y="48" class="font-mono" font-size="8.5" fill="rgba(20, 19, 17, 0.75)">1st Place · AIC Hack for Humanity (Nov 2026 · UC San Diego) · Multilingual Evacuation Voice Agent</text>
  </g>
</svg>`;
}

// ==============================================================================
// 3. [PROJECTS] SuperSmallModel Transformer - 800x450
// ==============================================================================
export function generateSSMSvg() {
  const w = 800;
  const h = 450;
  const id = "[PROJECTS] SuperSmallModel Transformer - 800x450";

  // Generate 6x6 Causal Attention Mask fitting cleanly inside 290x150 box
  let maskGrid = '';
  const n = 6;
  const size = 19;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cx = 36 + c * size;
      const cy = 26 + r * size;
      if (c <= r) {
        const intensity = ((r - c + 1) / (r + 1)) * 0.7 + 0.15;
        maskGrid += `<rect x="${cx}" y="${cy}" width="${size - 3}" height="${size - 3}" fill="rgba(180, 35, 24, ${intensity.toFixed(2)})" stroke="#141311" stroke-width="0.8" />`;
      } else {
        maskGrid += `<rect x="${cx}" y="${cy}" width="${size - 3}" height="${size - 3}" fill="#141311" stroke="#141311" stroke-width="0.8" />`;
        maskGrid += `<line x1="${cx}" y1="${cy}" x2="${cx + size - 3}" y2="${cy + size - 3}" stroke="rgba(243, 240, 232, 0.25)" stroke-width="0.6" />`;
      }
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('ssm')}
    <marker id="ssm-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#ssm-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 24)}

  <!-- Minimal Header -->
  ${makeMinimalHeader(48, 52, '04 · PROJECTS // CAUSAL GPT FROM SCRATCH', 'SuperSmallModel Transformer', 'A ~1M-parameter causal GPT built from scratch in PyTorch — multi-head self-attention, tokenization, and training loop.')}

  <!-- ===================================================================== -->
  <!-- LEFT: TRANSFORMER BLOCK DIAGRAM (X: 48, Y: 130, W: 360, H: 255)        -->
  <!-- ===================================================================== -->
  <g transform="translate(48, 130)">
    <rect x="0" y="0" width="360" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">AUTOREGRESSIVE TRANSFORMER TOPOLOGY</text>

    <!-- Vertical Dataflow -->
    <g transform="translate(20, 36)">
      <!-- Input Tokens -->
      <g transform="translate(0, 0)">
        <rect x="0" y="0" width="320" height="26" fill="#ffffff" stroke="#141311" stroke-width="1" />
        <text x="12" y="17" class="font-mono" font-size="8.5" fill="#141311">Tokenization  +  Positional Embeddings</text>
      </g>
      
      <path d="M 160 26 V 38" stroke="#141311" stroke-width="1.2" marker-end="url(#ssm-arr)" />

      <!-- Multi-Head Attention -->
      <g transform="translate(0, 38)">
        <rect x="0" y="0" width="320" height="42" fill="#ffffff" stroke="#141311" stroke-width="1" />
        <text x="12" y="18" class="font-mono" font-size="8.5" font-weight="600" fill="#141311">Multi-Head Causal Self-Attention</text>
        <text x="12" y="32" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.65)">Q, K, V Projections  ·  Causal Autoregressive Mask</text>
        <path d="M 310 0 C 326 0 326 54 310 54" fill="none" stroke="#b42318" stroke-width="1" stroke-dasharray="2 2" />
      </g>

      <path d="M 160 80 V 92" stroke="#141311" stroke-width="1.2" marker-end="url(#ssm-arr)" />

      <!-- FeedForward MLP -->
      <g transform="translate(0, 92)">
        <rect x="0" y="0" width="320" height="42" fill="#ffffff" stroke="#141311" stroke-width="1" />
        <text x="12" y="18" class="font-mono" font-size="8.5" font-weight="600" fill="#141311">Feed-Forward Network (MLP)</text>
        <text x="12" y="32" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.65)">Residual Connections  ·  Layer Normalization</text>
        <path d="M 310 0 C 326 0 326 54 310 54" fill="none" stroke="#b42318" stroke-width="1" stroke-dasharray="2 2" />
      </g>

      <path d="M 160 134 V 146" stroke="#141311" stroke-width="1.2" marker-end="url(#ssm-arr)" />

      <!-- Output Linear Head -->
      <g transform="translate(0, 146)">
        <rect x="0" y="0" width="320" height="26" fill="#ffffff" stroke="#141311" stroke-width="1" />
        <text x="12" y="17" class="font-mono" font-size="8.5" fill="#141311">Linear Language Modeling Head  →  Next-Token Logits</text>
      </g>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- RIGHT: CAUSAL ATTENTION MATRIX (X: 430, Y: 130, W: 322, H: 255)        -->
  <!-- ===================================================================== -->
  <g transform="translate(430, 130)">
    <rect x="0" y="0" width="322" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">CAUSAL ATTENTION MASK MATRIX</text>

    <!-- Matrix Visualization Box -->
    <g transform="translate(16, 38)">
      <rect x="0" y="0" width="290" height="150" fill="#ffffff" stroke="#141311" stroke-width="1" />
      
      <!-- Axis Labels -->
      <text x="38" y="17" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₁  t₂  t₃  t₄  t₅  t₆ (Keys)</text>
      <text x="14" y="38" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₁</text>
      <text x="14" y="57" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₂</text>
      <text x="14" y="76" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₃</text>
      <text x="14" y="95" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₄</text>
      <text x="14" y="114" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₅</text>
      <text x="14" y="133" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.55)">t₆</text>

      ${maskGrid}

      <text x="166" y="72" class="font-mono" font-size="7.5" fill="#b42318">■ Active Attention</text>
      <text x="166" y="92" class="font-mono" font-size="7.5" fill="#141311">■ Causal Mask (-∞)</text>
    </g>

    <!-- Formula Detail -->
    <rect x="16" y="198" width="290" height="44" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="24" y="215" class="font-mono" font-size="8.5" font-weight="600" fill="#141311">Attn(Q, K, V) = softmax(Q·Kᵀ / √d_k + M)·V</text>
    <text x="24" y="231" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">PyTorch ~1M-param GPT  ·  Custom training loop</text>
  </g>
</svg>`;
}

// ==============================================================================
// 4. [PROJECTS] EEG Lie Detection Architecture - 800x450
// ==============================================================================
export function generateEEGLieDetectionSvg() {
  const w = 800;
  const h = 450;
  const id = "[PROJECTS] EEG Lie Detection Architecture - 800x450";

  // Clean 8-channel EEG waveforms fitting inside 302x205 scope
  const channelNames = ['Fp1', 'Fp2', 'C3', 'C4', 'T3', 'T4', 'P3', 'P4'];
  let channelLines = '';
  for (let i = 0; i < 8; i++) {
    const yPos = 30 + i * 22;
    const isParietal = i >= 6;
    channelLines += `<text x="10" y="${yPos + 3}" class="font-mono" font-size="8" font-weight="600" fill="${isParietal ? '#b42318' : '#141311'}">${channelNames[i]}</text>`;
    channelLines += `<line x1="36" y1="${yPos}" x2="292" y2="${yPos}" stroke="rgba(20, 19, 17, 0.08)" stroke-width="0.8" />`;
    
    let d = `M 38 ${yPos}`;
    for (let x = 38; x <= 286; x += 15) {
      let dy = ((x * (i + 5) * 3) % 7) - 3;
      if (isParietal && x >= 150 && x <= 210) {
        dy -= 6;
      }
      d += ` Q ${x + 7} ${yPos + dy} ${x + 15} ${yPos + (dy % 2)}`;
    }
    channelLines += `<path d="${d}" fill="none" stroke="${isParietal ? '#b42318' : '#141311'}" stroke-width="${isParietal ? '1.5' : '0.9'}" />`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('eeg')}
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#eeg-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 24)}

  <!-- Minimal Header -->
  ${makeMinimalHeader(48, 52, '04 · PROJECTS // REAL-TIME 8-CHANNEL BCI', 'EEG Lie Detection Architecture', 'Group project. Real-time 8-channel EEG classification pipeline with under 100ms end-to-end latency and 75% accuracy.')}

  <!-- ===================================================================== -->
  <!-- LEFT: 8-CHANNEL EEG MONTAGE (X: 48, Y: 130, W: 330, H: 255)           -->
  <!-- ===================================================================== -->
  <g transform="translate(48, 130)">
    <rect x="0" y="0" width="330" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="14" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">8-CHANNEL SCALP MONTAGE (10-20)</text>

    <!-- Scope Frame -->
    <g transform="translate(14, 36)">
      <rect x="0" y="0" width="302" height="205" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
      ${channelLines}
      <!-- Stimulus Onset Line -->
      <line x1="145" y1="10" x2="145" y2="196" stroke="rgba(180, 35, 24, 0.4)" stroke-width="1" stroke-dasharray="3 3" />
      <text x="149" y="18" class="font-mono" font-size="7" font-weight="600" fill="#b42318">STIMULUS ONSET (t = 0)</text>
    </g>
  </g>

  <!-- ===================================================================== -->
  <!-- RIGHT: P300 ERP DEFLECTION & METRICS (X: 400, Y: 130, W: 352, H: 255)  -->
  <!-- ===================================================================== -->
  <g transform="translate(400, 130)">
    <rect x="0" y="0" width="352" height="255" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">EVENT-RELATED POTENTIAL CLASSIFICATION</text>

    <!-- ERP Graph -->
    <g transform="translate(16, 38)">
      <rect x="0" y="0" width="320" height="145" fill="#ffffff" stroke="#141311" stroke-width="1" />
      
      <!-- Axes (time axis separated cleanly below waveform trough) -->
      <line x1="52" y1="16" x2="52" y2="112" stroke="#141311" stroke-width="1" />
      <line x1="52" y1="82" x2="302" y2="82" stroke="rgba(20, 19, 17, 0.2)" stroke-width="0.8" stroke-dasharray="2 2" />
      <line x1="52" y1="112" x2="302" y2="112" stroke="#141311" stroke-width="1" />

      <!-- Y-Axis Ticks (left of x=52, zero intersection) -->
      <text x="46" y="36" text-anchor="end" class="font-mono" font-size="7" fill="rgba(20, 19, 17, 0.55)">+μV</text>
      <text x="46" y="85" text-anchor="end" class="font-mono" font-size="7" fill="rgba(20, 19, 17, 0.55)">0 μV</text>

      <!-- X-Axis Ticks (below y=112, zero intersection) -->
      <text x="52" y="126" text-anchor="middle" class="font-mono" font-size="7" fill="#141311">0 ms</text>
      <text x="120" y="126" text-anchor="middle" class="font-mono" font-size="7" fill="#141311">150 ms</text>
      <text x="192" y="126" text-anchor="middle" class="font-mono" font-size="7" font-weight="600" fill="#b42318">300 ms</text>
      <text x="275" y="126" text-anchor="middle" class="font-mono" font-size="7" fill="#141311">500 ms</text>

      <!-- Baseline & Deflection Traces (strictly x >= 52, y <= 96) -->
      <path d="M 52 82 Q 82 79 115 85 T 175 81 T 245 83 L 300 82" fill="none" stroke="rgba(20, 19, 17, 0.45)" stroke-width="1.2" stroke-dasharray="3 3" />
      <path d="M 52 82 Q 82 74 122 92 Q 160 82 185 34 Q 200 29 215 44 Q 242 86 272 91 L 300 82" fill="none" stroke="#b42318" stroke-width="2" />
      <circle cx="192" cy="32" r="3.5" fill="#b42318" />
      <text x="202" y="30" class="font-mono" font-size="8" font-weight="600" fill="#b42318">ERP Peak</text>
    </g>

    <!-- Real Verified Metrics Readout -->
    <rect x="16" y="196" width="320" height="46" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="24" y="214" class="font-mono" font-size="8.5" font-weight="600" fill="#141311">VERIFIED PIPELINE PERFORMANCE:</text>
    <text x="24" y="230" class="font-mono" font-size="8" fill="#141311">End-to-End Latency: <tspan font-weight="600" fill="#b42318">&lt; 100 ms</tspan>   ·   Classification Accuracy: <tspan font-weight="600" fill="#b42318">75%</tspan></text>
  </g>
</svg>`;
}
