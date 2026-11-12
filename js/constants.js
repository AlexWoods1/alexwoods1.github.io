/* Navigation geometry, LIF parameters, and centralized system constants. */
window.PortfolioCircuit = {
  WAY: [
    [150, 390], [380, 390], [380, 500], [380, 390], [380, 330], [380, 390],
    [530, 390], [640, 390], [770, 390], [798, 300], [826, 470], [854, 390], [1020, 390]
  ],
  MAP: [0, 2, 4, 7, 9, 12],
  CAM: [
    [150, 390], [380, 520], [390, 235], [585, 390], [812, 385], [1070, 390]
  ],
  NAMES: ["About", "Experience", "Skills", "Projects", "Honors", "Contact"],
  HASH: ["about", "experience", "skills", "projects", "honors", "contact"],
  LEGACY_HASH: ["current", "charge", "leak", "threshold", "spike", "synapse", "highlights"],
  LIF: {
    C_pF: 200,
    R_Mohm: 100,
    tau_ms: 20,
    V_rest_mV: -65,
    V_th_mV: -50,
    V_reset_mV: -70,
    V_spike_peak_mV: 30
  },
  MORPH_MS: 720,

  /* Centralized Timing Constants (ms) */
  TIMING: {
    MORPH_MS: 720,
    CHROME_TIMEOUT_MS: 530,
    PANEL_MS: 540,
    SETTLE_BUFFER_MS: 120,
    PANEL_SETTLE_BUFFER_MS: 80,
    RESET_SWITCH_MS: 650,
    WHEEL_COOLDOWN_MS: 680,
    TAP_COOLDOWN_MS: 350,
    SCOPE_ANIM_MS: 760,
    TRAVEL_BASE_MS: 440,
    TRAVEL_STEP_MS: 180,
    TRAVEL_MIN_MS: 580,
    TRAVEL_MAX_MS: 1150
  },

  /* Centralized Viewport Breakpoints (px) */
  BREAKPOINTS: {
    MOBILE_WIDTH: 860,
    SHORT_MOBILE_VH: 560,
    ULTRA_SHORT_MOBILE_VH: 440,
    SHORT_DESKTOP_VH: 640,
    WIDE_DESKTOP_VW: 1100
  },

  /* Centralized Schematic Coordinate Space Dimensions */
  SCHEMATIC: {
    WIDTH: 1200,
    HEIGHT: 740,
    BOUNDS_W: 1032,
    BOUNDS_H: 494,
    CENTER_X: 630,
    CENTER_Y: 367,
    RESET_SWITCH: {
      X: 462,
      Y: 512,
      RADIUS: 95
    }
  },

  /* Centralized Inset Minimap Metrics */
  INSET: {
    GAP_MOBILE: 10,
    GAP_DESKTOP: 24,
    HEADER_DEFAULT: 32,
    HEADER_SHORT_MOBILE: 28,
    HEADER_ULTRA_SHORT: 26,
    FOOTER_MOBILE: 44,
    FOOTER_SHORT_MOBILE: 40,
    FOOTER_ULTRA_SHORT: 36,
    FOOTER_DESKTOP: 0,
    PAD_X_DESKTOP: 18,
    PAD_X_MOBILE: 12,
    PAD_X_MOBILE_NARROW: 8,
    PAD_Y_DESKTOP: 16,
    PAD_Y_MOBILE: 10,
    PAD_Y_MOBILE_SHORT: 8
  },

  /* Centralized Scope Graph Metrics & Tokens */
  SCOPE: {
    V_TOP: 42,
    V_BOT: -80,
    PAD_X: 7,
    PAD_Y: 7,
    GRID_STROKE: "rgba(20,19,17,0.18)",
    TRACE_STROKE: "#141311",
    SPIKE_STROKE: "#b42318",
    TRACE_WIDTH: 1.65,
    SPIKE_WIDTH: 2.1,
    DOT_RADIUS: 2.8
  }
};
