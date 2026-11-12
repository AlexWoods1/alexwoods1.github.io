/* Navigation geometry and LIF parameters (see data/lif-circuit.json). */
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
  MORPH_MS: 720
};
