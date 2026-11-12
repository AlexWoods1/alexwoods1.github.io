#!/usr/bin/env python3
"""Build docs/lif-circuit.pdf from data/lif-circuit.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "lif-circuit.json"
OUT = ROOT / "docs" / "lif-circuit.pdf"


def ascii_safe(text: str) -> str:
    return (
        text.replace("\u2014", "-")
        .replace("\u2212", "-")
        .replace("\u2265", ">=")
        .replace("\u2264", "<=")
        .replace("\u00b1", "+/-")
        .replace("\u03c4", "tau")
        .replace("\u03a9", "Ohm")
    )


def main() -> int:
    try:
        from fpdf import FPDF
    except ImportError:
        print("Install fpdf2: pip install fpdf2", file=sys.stderr)
        return 1

    if not DATA.is_file():
        print(f"Missing {DATA}", file=sys.stderr)
        return 1

    doc = json.loads(DATA.read_text(encoding="utf-8"))
    membrane = doc.get("membrane", {})
    volts = doc.get("voltages_mV", {})
    comp = doc.get("comparator", {})
    comp_specs = comp.get("specs", {})
    parts = doc.get("parts", [])

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "LIF equivalent circuit (portfolio)", ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(
        0,
        5,
        ascii_safe(
            doc.get("model", "")
            + "\nSource: data/lif-circuit.json - regenerate with scripts/generate_circuit_pdf.py"
        ),
    )
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Membrane", ln=True)
    pdf.set_font("Helvetica", size=10)
    lines = [
        f"C = {membrane.get('C_pF')} pF",
        f"R = {membrane.get('R_Mohm')} MOhm",
        f"tau_m = {membrane.get('tau_ms')} ms",
        membrane.get("equation", ""),
    ]
    pdf.multi_cell(0, 5, ascii_safe("\n".join(str(x) for x in lines if x)))
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Voltages", ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(
        0,
        5,
        ascii_safe("\n".join(f"{k}: {v} mV" for k, v in volts.items())),
    )
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Comparator", ln=True)
    pdf.set_font("Helvetica", size=10)
    pdf.multi_cell(
        0,
        5,
        ascii_safe(
            f"{comp.get('part', '')} ({comp.get('package', '')})\n"
            f"Role: {comp.get('role', '')}\n"
            + "\n".join(f"{k}: {v}" for k, v in comp_specs.items())
        ),
    )
    pdf.ln(2)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Parts list", ln=True)
    pdf.set_font("Helvetica", size=9)
    for p in parts:
        pdf.multi_cell(
            0,
            4,
            ascii_safe(
                f"{p.get('ref', '?')}\t{p.get('value', '')}\t{p.get('description', '')}\n"
                f"  Example: {p.get('example', '')}"
            ),
        )
        pdf.ln(1)

    spike = doc.get("spike_output", {})
    if spike:
        pdf.ln(2)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, "Spike output", ln=True)
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(
            0,
            5,
            ascii_safe(f"{spike.get('shape', '')}\n{spike.get('note', '')}"),
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
