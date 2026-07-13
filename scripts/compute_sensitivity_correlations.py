#!/usr/bin/env python3
"""Pearson r sensitivity table: alternate windows and drop-one-year for western acres vs drivers."""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
WILDFIRE = ROOT / "data" / "wildfire-data.csv"
VPD = ROOT / "data" / "vpd-annual.csv"
ERC = ROOT / "data" / "erc-annual.csv"
OUT = ROOT / "data" / "correlation-sensitivity.csv"
NOTES = ROOT / "data" / "correlation-sensitivity-notes.md"


def load_merged() -> pd.DataFrame:
    wf = pd.read_csv(WILDFIRE, skiprows=[1])
    wf["year"] = wf["year"].astype(int)
    for col in ["acres_burned_millions", "western_acres_burned_millions"]:
        wf[col] = pd.to_numeric(wf[col], errors="coerce")
    wf = wf[wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true"]
    vpd = pd.read_csv(VPD)
    erc = pd.read_csv(ERC)
    return wf.merge(vpd, on="year").merge(erc, on="year")


def pearson(df: pd.DataFrame, a: str, b: str) -> tuple[float | None, int]:
    sub = df[[a, b]].dropna()
    if len(sub) < 3:
        return None, len(sub)
    return round(sub[a].corr(sub[b]), 3), len(sub)


def main() -> int:
    m = load_merged()
    rows: list[dict] = []

    scenarios = [
        ("Western acres vs ERC", "western_acres_burned_millions", "erc", 2010, 2025, None),
        ("Western acres vs VPD", "western_acres_burned_millions", "vpd_kpa", 2010, 2025, None),
        ("Western acres vs ERC", "western_acres_burned_millions", "erc", 2013, 2025, None),
        ("Western acres vs VPD", "western_acres_burned_millions", "vpd_kpa", 2013, 2025, None),
        ("Western acres vs ERC (excl. 2020)", "western_acres_burned_millions", "erc", 2010, 2025, 2020),
        ("Western acres vs VPD (excl. 2020)", "western_acres_burned_millions", "vpd_kpa", 2010, 2025, 2020),
        ("National acres vs western VPD", "acres_burned_millions", "vpd_kpa", 2010, 2025, None),
    ]

    for label, a, b, y0, y1, drop in scenarios:
        sl = m[(m["year"] >= y0) & (m["year"] <= y1)]
        if drop is not None:
            sl = sl[sl["year"] != drop]
        r, n = pearson(sl, a, b)
        rows.append({
            "pairing": label,
            "pearson_r": r,
            "n": n,
            "window": f"{y0}-{y1}" + (f" excl {drop}" if drop else ""),
        })

    pd.DataFrame(rows).to_csv(OUT, index=False)
    notes = """# Correlation sensitivity (exploratory)

Alternate windows and drop-one-year checks for bivariate Pearson r. Repository research only.

## Use

Compare to main Coupling tab values (2010-2025, western geography). ERC and VPD are collinear (~0.94); do not treat as independent.

## Reproduce

```bash
python scripts/compute_sensitivity_correlations.py
```
"""
    NOTES.write_text(notes)
    print(f"Wrote {OUT}")
    print(f"Wrote {NOTES}")
    print(pd.DataFrame(rows).to_string(index=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
