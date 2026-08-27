#!/usr/bin/env python3
"""Compare Childs v1 vs ECHO v2 beta annual smoke series; write bake-off markdown table.

Usage:
  python scripts/compare_smoke_v2_bakeoff.py
"""

from __future__ import annotations

import csv
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
V1 = ROOT / "data" / "smoke-pm25-v1-annual.csv"
V2 = ROOT / "data" / "smoke-pm25-v2-beta-annual.csv"
OUT = ROOT / "data" / "smoke-pm25-v2-bakeoff.md"


def load(path: Path) -> dict[int, float]:
    with path.open(newline="", encoding="utf-8") as f:
        return {
            int(r["year"]): float(r["smoke_pm25_ug_m3"])
            for r in csv.DictReader(f)
            if r.get("smoke_pm25_ug_m3")
        }


def main() -> None:
    if not V2.exists():
        raise SystemExit(f"Missing {V2}; run build_smoke_v2_beta_annual.py first")
    v1 = load(V1)
    v2 = load(V2)
    overlap = sorted(set(v1) & set(v2) & set(range(2006, 2021)))
    rows = []
    diffs = []
    for y in overlap:
        a, b = v1[y], v2[y]
        ratio = b / a if a else float("nan")
        diff = b - a
        diffs.append(diff)
        rows.append((y, a, b, ratio, diff))

    n = len(diffs)
    mean_bias = sum(diffs) / n if n else float("nan")
    rmse = math.sqrt(sum(d * d for d in diffs) / n) if n else float("nan")
    v2_years = sorted(v2)
    post = [y for y in v2_years if y >= 2021]

    lines = [
        "# ECHO smoke v2 bake-off (vs Childs v1)",
        "",
        "Live chart uses ECHO v2 when locked; this file compares archived Childs v1 to v2 beta.",
        "",
        f"- **v1 file:** `{V1.name}`",
        f"- **v2 beta file:** `{V2.name}`",
        f"- **Overlap years compared:** {overlap[0]}-{overlap[-1]} (n={n})" if overlap else "- **Overlap:** none",
        f"- **v2 year span:** {v2_years[0]}-{v2_years[-1]}" if v2_years else "- **v2 year span:** empty",
        f"- **Mean bias (v2 − v1):** {mean_bias:.4f} µg/m³",
        f"- **RMSE:** {rmse:.4f} µg/m³",
        "",
        "## Year table (2006-2020 overlap)",
        "",
        "| Year | v1 µg/m³ | v2 µg/m³ | ratio (v2/v1) | abs diff |",
        "|---:|---:|---:|---:|---:|",
    ]
    for y, a, b, ratio, diff in rows:
        lines.append(f"| {y} | {a:.4f} | {b:.4f} | {ratio:.3f} | {diff:+.4f} |")

    lines += [
        "",
        "## Post-2020 v2 years (no v1)",
        "",
    ]
    if post:
        lines.append("| Year | v2 µg/m³ |")
        lines.append("|---:|---:|")
        for y in post:
            lines.append(f"| {y} | {v2[y]:.4f} |")
        lines.append("")
        lines.append(
            "Qualitative check: compare 2021-2023 levels to known western megafire / "
            "eastern Canadian smoke years without inventing external totals."
        )
    else:
        lines.append("No post-2020 years in v2 file.")

    lines += [
        "",
        "## Go / no-go (auto-filled metrics; narrative recommendation in notes)",
        "",
        "Wiring criteria (from plan): complete years through ≥2023; method parity with v1 aggregate; "
        "no unexplained wild level break vs v1 in overlap.",
        "",
        f"- Complete through ≥2023: {'YES' if v2_years and v2_years[-1] >= 2023 else 'NO'}",
        f"- Overlap n (2006-2020): {n}",
        f"- RMSE: {rmse:.4f}",
        "",
        "Update the **Recommendation** section in this file after human review.",
        "",
        "## Recommendation",
        "",
        "_Fill after reviewing the table._ Default until reviewed: **NO-GO for live wiring** "
        "(beta data; bake-off incomplete or not yet approved).",
        "",
    ]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"n={n} mean_bias={mean_bias:.4f} RMSE={rmse:.4f}")


if __name__ == "__main__":
    main()
