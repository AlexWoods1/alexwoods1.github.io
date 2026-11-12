#!/usr/bin/env python3
"""Ensure js/constants.js LIF block matches data/lif-circuit.json."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "lif-circuit.json"
CONSTANTS = ROOT / "js" / "constants.js"

MAP = [
    ("C_pF", ("membrane", "C_pF")),
    ("R_Mohm", ("membrane", "R_Mohm")),
    ("tau_ms", ("membrane", "tau_ms")),
    ("V_rest_mV", ("voltages_mV", "V_rest")),
    ("V_th_mV", ("voltages_mV", "V_th")),
    ("V_reset_mV", ("voltages_mV", "V_reset")),
    ("V_spike_peak_mV", ("voltages_mV", "V_spike_peak")),
]


def lif_from_js(text: str) -> dict:
    block = re.search(r"LIF:\s*\{([^}]+)\}", text, re.S)
    if not block:
        raise ValueError("LIF block not found in constants.js")
    out = {}
    for key, _ in MAP:
        m = re.search(rf"{key}:\s*(-?\d+(?:\.\d+)?)", block.group(1))
        if not m:
            raise ValueError(f"Missing {key} in constants.js")
        out[key] = float(m.group(1))
        if out[key].is_integer():
            out[key] = int(out[key])
    return out


def lif_from_json(doc: dict) -> dict:
    out = {}
    for js_key, path in MAP:
        cur = doc
        for p in path:
            cur = cur[p]
        out[js_key] = cur
    return out


def main() -> int:
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    js = lif_from_js(CONSTANTS.read_text(encoding="utf-8"))
    ref = lif_from_json(doc)
    bad = [key for key, _ in MAP if js[key] != ref[key]]
    if bad:
        print("LIF mismatch:", ", ".join(bad), file=sys.stderr)
        for key in bad:
            print(f"  {key}: js={js[key]} json={ref[key]}", file=sys.stderr)
        return 1
    print("LIF constants match data/lif-circuit.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
