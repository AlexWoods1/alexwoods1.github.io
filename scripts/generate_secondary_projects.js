// scripts/generate_secondary_projects.js
// Milestone 4: Minimalist, authentic Category C Secondary Project Cards (600x400 px, 3:2)
// Strictly follows the user's redirect:
// - NO initials or monograms
// - NO dense multi-panel text frames or invented metrics
// - Spacious, elegant, minimalist engineering schematics with ample warm paper whitespace

import { COMMON_STYLE, makeMinimalGrid, makeMinimalFrame, makeMinimalHeader } from './lib/svg_helpers.js';

// ==============================================================================
// 5. [PROJECTS] Spoken Multimodal Telephony - 600x400
// ==============================================================================
export function generateSpokenSvg() {
  const w = 600;
  const h = 400;
  const id = "[PROJECTS] Spoken Multimodal Telephony - 600x400";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('spoken')}
    <marker id="sp-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#spoken-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 20)}

  <!-- Header -->
  ${makeMinimalHeader(40, 48, '04 · PROJECTS // REINFORCEMENT LEARNING', 'Spoken: Voice Tutor', 'Voice tutor adapting prompt difficulty via Q-learning over Whisper & Gemini.')}

  <!-- Q-Learning Adaptive Architecture Flow -->
  <g transform="translate(40, 130)">
    <rect x="0" y="0" width="520" height="225" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">REINFORCEMENT LEARNING ADAPTATION LOOP</text>

    <!-- Node 1: Audio Input & Whisper STT -->
    <g transform="translate(20, 45)">
      <rect x="0" y="0" width="130" height="90" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">VOICE INPUT</text>
      <text x="10" y="38" class="font-brand" font-size="12" font-weight="600" fill="#141311">Whisper STT</text>
      <text x="10" y="56" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Speech-to-text audio input</text>
      <text x="10" y="76" class="font-mono" font-size="7.5" fill="#b42318">Grammar analysis</text>
    </g>

    <path d="M 150 90 H 185" stroke="#141311" stroke-width="1.5" marker-end="url(#sp-arr)" />

    <!-- Node 2: Q-Learning Agent (Crimson Highlight) -->
    <g transform="translate(185, 45)">
      <rect x="0" y="0" width="150" height="90" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="1.5" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#b42318">Q-LEARNING POLICY</text>
      <text x="10" y="38" class="font-brand" font-size="12" font-weight="600" fill="#b42318">Q(s, a) Matrix</text>
      <text x="10" y="56" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Reward: Fluency &amp; accuracy</text>
      <text x="10" y="76" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Adaptive difficulty</text>
    </g>

    <path d="M 335 90 H 370" stroke="#141311" stroke-width="1.5" marker-end="url(#sp-arr)" />

    <!-- Node 3: Gemini Prompt Engine -->
    <g transform="translate(370, 45)">
      <rect x="0" y="0" width="130" height="90" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">PROMPT ENGINE</text>
      <text x="10" y="38" class="font-brand" font-size="12" font-weight="600" fill="#141311">Gemini AI</text>
      <text x="10" y="56" class="font-sans" font-size="8" fill="rgba(20, 19, 17, 0.7)">Adaptive language prompts</text>
      <text x="10" y="76" class="font-mono" font-size="7.5" fill="#141311">Audio feedback</text>
    </g>

    <!-- Feedback Loop Return -->
    <path d="M 435 135 V 158 H 85 V 135" fill="none" stroke="#b42318" stroke-width="1.2" stroke-dasharray="3 3" />
    <text x="260" y="172" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318" text-anchor="middle">Reward Feedback Loop: r(t) = Accuracy - Latency Penalty</text>

    <!-- Formula Footer -->
    <rect x="20" y="184" width="480" height="26" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="30" y="201" class="font-mono" font-size="8" fill="#141311">Q(s, a) ← Q(s, a) + α · [r + γ · max Q(s', a') - Q(s, a)]</text>
  </g>
</svg>`;
}

// ==============================================================================
// 6. [PROJECTS] Conceiva Telehealth Platform - 600x400
// ==============================================================================
export function generateConceivaSvg() {
  const w = 600;
  const h = 400;
  const id = "[PROJECTS] Conceiva Telehealth Platform - 600x400";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('conceiva')}
    <marker id="cv-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#conceiva-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 20)}

  <!-- Header -->
  ${makeMinimalHeader(40, 48, '04 · PROJECTS // CLINICAL MACHINE LEARNING', 'Conceiva: Telehealth', '48-hour telehealth platform with a sperm-motility risk model to reduce genetic testing costs.')}

  <!-- Clinical Pipeline Layout -->
  <g transform="translate(40, 130)">
    <rect x="0" y="0" width="520" height="225" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">CLINICAL RISK MODELING &amp; DONOR MATCHING PIPELINE</text>

    <!-- Step 1: Patient Intake -->
    <g transform="translate(20, 45)">
      <rect x="0" y="0" width="140" height="100" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="12" y="22" class="font-mono" font-size="8" font-weight="600" fill="#141311">01 · INTAKE</text>
      <text x="12" y="42" class="font-brand" font-size="12" font-weight="600" fill="#141311">Clinical Profile</text>
      <text x="12" y="60" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">EHR &amp; health records</text>
      <text x="12" y="74" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Family history intake</text>
      <text x="12" y="90" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.6)">FastAPI intake</text>
    </g>

    <path d="M 160 95 H 190" stroke="#141311" stroke-width="1.5" marker-end="url(#cv-arr)" />

    <!-- Step 2: Motility Risk Model (Crimson Highlight) -->
    <g transform="translate(190, 45)">
      <rect x="0" y="0" width="140" height="100" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="1.5" />
      <text x="12" y="22" class="font-mono" font-size="8" font-weight="600" fill="#b42318">02 · MOTILITY</text>
      <text x="12" y="42" class="font-brand" font-size="12" font-weight="600" fill="#b42318">Risk Estimator</text>
      <text x="12" y="60" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Progressive velocity ML</text>
      <text x="12" y="74" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Risk score evaluation</text>
      <text x="12" y="90" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Cost reduction</text>
    </g>

    <path d="M 330 95 H 360" stroke="#141311" stroke-width="1.5" marker-end="url(#cv-arr)" />

    <!-- Step 3: Biometric Donor Matching -->
    <g transform="translate(360, 45)">
      <rect x="0" y="0" width="140" height="100" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="12" y="22" class="font-mono" font-size="8" font-weight="600" fill="#141311">03 · MATCHING</text>
      <text x="12" y="42" class="font-brand" font-size="12" font-weight="600" fill="#141311">Donor Matrix</text>
      <text x="12" y="60" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Multi-criteria match</text>
      <text x="12" y="74" class="font-sans" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Compatible profiles</text>
      <text x="12" y="90" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.6)">Gemini validation</text>
    </g>

    <!-- Footer Bar -->
    <rect x="20" y="165" width="480" height="42" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="32" y="184" class="font-mono" font-size="8" font-weight="600" fill="#141311">INFRASTRUCTURE ARCHITECTURE:</text>
    <text x="32" y="198" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.75)">FastAPI Core  ·  AWS Cloud Compute  ·  Vercel Frontend  ·  Gemini API</text>
  </g>
</svg>`;
}

// ==============================================================================
// 7. [PROJECTS] EMG Flappy Bird Neural Interface - 600x400
// ==============================================================================
export function generateFlappyBirdSvg() {
  const w = 600;
  const h = 400;
  const id = "[PROJECTS] EMG Flappy Bird Neural Interface - 600x400";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('emg')}
    <marker id="emg-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#emg-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 20)}

  <!-- Header -->
  ${makeMinimalHeader(40, 48, '04 · PROJECTS // NEURAL INTERFACE · UCSD BENG 152', 'EMG Flappy Bird', 'Surface-EMG signal processing driving a two-player, muscle-controlled Flappy Bird.')}

  <!-- Bio-Potential Pipeline Layout -->
  <g transform="translate(40, 130)">
    <rect x="0" y="0" width="520" height="225" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">SURFACE-EMG SIGNAL PROCESSING &amp; GAME CONTROL</text>

    <!-- Signal Acquisition Stage -->
    <g transform="translate(20, 40)">
      <rect x="0" y="0" width="145" height="110" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">01 · sEMG INPUT</text>
      <!-- Forearm Electrode Icon -->
      <path d="M 20 55 Q 50 35 80 55 T 130 55" fill="none" stroke="#141311" stroke-width="1.2" />
      <circle cx="50" cy="45" r="3" fill="#b42318" />
      <circle cx="80" cy="55" r="3" fill="#b42318" />
      <text x="10" y="80" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Surface Forearm Electrodes</text>
      <text x="10" y="96" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Differential Bio-Amp</text>
    </g>

    <path d="M 165 95 H 188" stroke="#141311" stroke-width="1.5" marker-end="url(#emg-arr)" />

    <!-- Rectification & Threshold Stage -->
    <g transform="translate(188, 40)">
      <rect x="0" y="0" width="145" height="110" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">02 · ENVELOPE &amp; Vth</text>
      <!-- Full Wave Rectified Trace -->
      <path d="M 15 65 Q 25 35 35 65 Q 45 40 55 65 Q 65 30 75 65 Q 85 45 95 65 Q 105 32 115 65" fill="none" stroke="#141311" stroke-width="1.2" />
      <line x1="15" y1="45" x2="130" y2="45" stroke="#b42318" stroke-width="1" stroke-dasharray="2 2" />
      <text x="10" y="80" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Bandpass 20–450 Hz</text>
      <text x="10" y="96" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Comparator V ≥ V_th</text>
    </g>

    <path d="M 333 95 H 356" stroke="#141311" stroke-width="1.5" marker-end="url(#emg-arr)" />

    <!-- Game Engine Stage -->
    <g transform="translate(356, 40)">
      <rect x="0" y="0" width="145" height="110" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="1.5" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#b42318">03 · GAME TRIGGER</text>
      <!-- Wireframe Bird & Obstacle (clear of text below y=72) -->
      <polygon points="35,47 48,42 42,52" fill="#b42318" stroke="#141311" stroke-width="1" />
      <rect x="78" y="27" width="14" height="14" fill="#141311" />
      <rect x="78" y="51" width="14" height="15" fill="#141311" />
      <text x="10" y="80" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">Two-Player Control</text>
      <text x="10" y="96" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Muscle Impulse Jump</text>
    </g>

    <!-- Footer Note -->
    <rect x="20" y="165" width="481" height="42" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="30" y="184" class="font-mono" font-size="8" font-weight="600" fill="#141311">COURSEWORK &amp; IMPLEMENTATION:</text>
    <text x="30" y="198" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.75)">UCSD BENG 152 BioSystems Engineering Lab  ·  Live Bio-Amplifier Hardware</text>
  </g>
</svg>`;
}

// ==============================================================================
// 8. [PROJECTS] TritonDefense Autonomous Robot Car - 600x400
// ==============================================================================
export function generateTritonDefenseSvg() {
  const w = 600;
  const h = 400;
  const id = "[PROJECTS] TritonDefense Autonomous Robot Car - 600x400";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('triton')}
    <marker id="td-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="#141311" stroke-width="1.5" stroke-linecap="round"/>
    </marker>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#triton-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 20)}

  <!-- Header -->
  ${makeMinimalHeader(40, 48, '04 · PROJECTS // EMBEDDED C++ & COMPUTER VISION', 'TritonDefense', 'Autonomous C++/Python robot car with live camera, YOLO detection & IR control.')}

  <!-- Autonomous System Layout -->
  <g transform="translate(40, 130)">
    <rect x="0" y="0" width="520" height="225" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">AUTONOMOUS VEHICLE PERCEPTION &amp; CONTROL</text>

    <!-- Camera Vision Stage -->
    <g transform="translate(20, 40)">
      <rect x="0" y="0" width="145" height="110" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">01 · PERCEPTION</text>
      <!-- Bounding Box Wireframe -->
      <rect x="35" y="32" width="45" height="42" fill="none" stroke="#b42318" stroke-width="1.2" />
      <circle cx="57" cy="46" r="6" fill="none" stroke="#141311" stroke-width="1" />
      <line x1="57" y1="52" x2="57" y2="70" stroke="#141311" stroke-width="1" />
      <text x="10" y="88" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">YOLO Detection</text>
      <text x="10" y="100" class="font-mono" font-size="7" fill="rgba(20, 19, 17, 0.7)">Live video stream</text>
    </g>

    <path d="M 165 95 H 188" stroke="#141311" stroke-width="1.5" marker-end="url(#td-arr)" />

    <!-- Navigation & Sensor Fusion -->
    <g transform="translate(188, 40)">
      <rect x="0" y="0" width="145" height="110" fill="#ffffff" stroke="#141311" stroke-width="1" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#141311">02 · RANGING &amp; IR</text>
      <!-- Sonar Cone Wireframe -->
      <path d="M 35 55 L 75 35 M 35 55 L 75 75" stroke="#141311" stroke-width="1" stroke-dasharray="2 2" />
      <path d="M 55 45 Q 65 55 55 65" fill="none" stroke="#b42318" stroke-width="1.2" />
      <path d="M 70 38 Q 82 55 70 72" fill="none" stroke="#b42318" stroke-width="1.2" />
      <text x="10" y="88" class="font-mono" font-size="7.5" fill="#141311">Ultrasonic Sonar</text>
      <text x="10" y="100" class="font-mono" font-size="7" fill="rgba(20, 19, 17, 0.7)">IR remote override</text>
    </g>

    <path d="M 333 95 H 356" stroke="#141311" stroke-width="1.5" marker-end="url(#td-arr)" />

    <!-- Motor PID Actuation -->
    <g transform="translate(356, 40)">
      <rect x="0" y="0" width="145" height="110" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="1.5" />
      <text x="10" y="20" class="font-mono" font-size="8" font-weight="600" fill="#b42318">03 · MOTOR CONTROL</text>
      <!-- Chassis Wireframe -->
      <rect x="40" y="38" width="55" height="35" rx="2" fill="none" stroke="#141311" stroke-width="1.2" />
      <rect x="34" y="42" width="6" height="10" fill="#141311" />
      <rect x="95" y="42" width="6" height="10" fill="#141311" />
      <rect x="34" y="58" width="6" height="10" fill="#141311" />
      <rect x="95" y="58" width="6" height="10" fill="#141311" />
      <text x="10" y="88" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">PID Motor Control</text>
      <text x="10" y="100" class="font-mono" font-size="7" fill="rgba(20, 19, 17, 0.7)">Embedded C++ firmware</text>
    </g>

    <!-- Footer Note -->
    <rect x="20" y="165" width="481" height="42" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="30" y="184" class="font-mono" font-size="8" font-weight="600" fill="#141311">STACK &amp; LANGUAGES:</text>
    <text x="30" y="198" class="font-mono" font-size="8" fill="rgba(20, 19, 17, 0.75)">C++ Embedded Firmware  ·  Python OpenCV / YOLO  ·  Hardware PWM Motor Driver</text>
  </g>
</svg>`;
}

// ==============================================================================
// 9. [PROJECTS] Wingman Presentation Coach - 600x400
// ==============================================================================
export function generateWingmanSvg() {
  const w = 600;
  const h = 400;
  const id = "[PROJECTS] Wingman Presentation Coach - 600x400";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" id="${id}">
  <defs>
    <style>${COMMON_STYLE}</style>
    ${makeMinimalGrid('wingman')}
  </defs>

  <!-- Background Base Canvas -->
  <rect width="${w}" height="${h}" fill="#f3f0e8"/>
  <rect width="${w}" height="${h}" fill="url(#wingman-grid)"/>

  <!-- Minimal Outer Frame -->
  ${makeMinimalFrame(w, h, 20)}

  <!-- Header -->
  ${makeMinimalHeader(40, 48, '04 · PROJECTS // WEARABLE HUD · DS3 HACKTOBERFEST', 'Wingman: Presentation Coach', 'Smart-glasses presentation coach delivering live pacing and speaking cues.')}

  <!-- HUD Interface Display -->
  <g transform="translate(40, 130)">
    <rect x="0" y="0" width="520" height="225" fill="#f3f0e8" stroke="#141311" stroke-width="1.25" />
    <text x="16" y="24" class="font-mono" font-size="9" font-weight="600" fill="#141311" letter-spacing="0.08em">SMART-GLASSES HEADS-UP DISPLAY (HUD) WIREFRAME</text>

    <!-- Eyewear Optics Wireframe -->
    <g transform="translate(20, 36)">
      <!-- Left Lens (Inactive) -->
      <rect x="0" y="0" width="225" height="120" rx="10" fill="#ffffff" stroke="#141311" stroke-width="1" stroke-dasharray="3 2" />
      <text x="15" y="24" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.4)">LEFT OPTIC (PASS-THROUGH)</text>
      
      <!-- Right Lens (HUD Display Active) -->
      <rect x="255" y="0" width="225" height="120" rx="10" fill="#ffffff" stroke="#141311" stroke-width="1.5" />
      
      <!-- HUD Elements -->
      <!-- Pacing Gauge -->
      <text x="270" y="25" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">SPEAKING PACE (WPM)</text>
      <!-- Gauge Bar -->
      <rect x="270" y="32" width="140" height="10" fill="rgba(20, 19, 17, 0.1)" />
      <rect x="270" y="32" width="95" height="10" fill="#b42318" />
      <line x1="365" y1="28" x2="365" y2="46" stroke="#141311" stroke-width="1.5" />
      <text x="420" y="41" class="font-mono" font-size="8" font-weight="600" fill="#141311">138 WPM</text>

      <!-- Contextual Slide Cues -->
      <rect x="270" y="52" width="195" height="38" fill="rgba(180, 35, 24, 0.05)" stroke="#b42318" stroke-width="0.8" />
      <text x="278" y="66" class="font-mono" font-size="7.5" font-weight="600" fill="#b42318">NEXT KEY POINT (Slide 04):</text>
      <text x="278" y="80" class="font-mono" font-size="7.5" fill="#141311">Explain surrogate gradient formulation</text>

      <!-- Timing Indicator -->
      <text x="270" y="108" class="font-mono" font-size="7.5" fill="rgba(20, 19, 17, 0.7)">Time elapsed: 04:12 / 10:00</text>
    </g>

    <!-- Footer Note -->
    <rect x="20" y="172" width="480" height="36" fill="#ffffff" stroke="#141311" stroke-width="0.8" />
    <text x="32" y="194" class="font-mono" font-size="8" fill="#141311">DS3 Hacktoberfest Hackathon Project  ·  Real-time Speech Audio Stream &amp; Vision Glance Guidance</text>
  </g>
</svg>`;
}
