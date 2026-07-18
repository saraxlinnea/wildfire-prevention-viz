#!/usr/bin/env python3
"""Compute exploratory partial correlations for western acres vs ERC/VPD.

Window: 2010-2025 (n=16). Not causal. Controls are limited (other dryness index
or linear year). Write data/correlation-partial.csv + notes.
"""

from __future__ import annotations

import csv
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "correlation-partial.csv"
NOTES = ROOT / "data" / "correlation-partial-notes.md"


def residual(y: np.ndarray, controls: list[np.ndarray]) -> np.ndarray:
    x = np.column_stack([np.ones(len(y)), *controls])
    beta, _, _, _ = np.linalg.lstsq(x, y, rcond=None)
    return y - x @ beta


def partial(x: np.ndarray, y: np.ndarray, *controls: np.ndarray) -> float:
    return float(np.corrcoef(residual(x, list(controls)), residual(y, list(controls)))[0, 1])


def main() -> None:
    acres = pd.read_csv(ROOT / "data" / "regional-acres-annual.csv")[
        ["year", "western_acres_millions"]
    ]
    erc = pd.read_csv(ROOT / "data" / "erc-annual.csv")
    vpd = pd.read_csv(ROOT / "data" / "vpd-annual.csv")
    d = acres.merge(erc, on="year").merge(vpd, on="year")
    d = d[d["year"].between(2010, 2025)].dropna().copy()
    n = len(d)
    a = d["western_acres_millions"].to_numpy(float)
    e = d["erc"].to_numpy(float)
    v = d["vpd_kpa"].to_numpy(float)
    y = d["year"].to_numpy(float)

    rows = [
        {
            "test": "Western acres vs ERC (raw)",
            "control": "none",
            "pearson_r": round(float(np.corrcoef(a, e)[0, 1]), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "Western acres vs VPD (raw)",
            "control": "none",
            "pearson_r": round(float(np.corrcoef(a, v)[0, 1]), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "Western acres vs ERC | VPD",
            "control": "western fire-season VPD",
            "pearson_r": round(partial(a, e, v), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "Western acres vs VPD | ERC",
            "control": "western fire-season ERC",
            "pearson_r": round(partial(a, v, e), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "Western acres vs ERC | year",
            "control": "linear calendar year",
            "pearson_r": round(partial(a, e, y), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "Western acres vs VPD | year",
            "control": "linear calendar year",
            "pearson_r": round(partial(a, v, y), 3),
            "n": n,
            "window": "2010-2025",
        },
        {
            "test": "ERC vs VPD (collinearity)",
            "control": "none",
            "pearson_r": round(float(np.corrcoef(e, v)[0, 1]), 3),
            "n": n,
            "window": "2010-2025",
        },
    ]

    # Multiple R^2 for acres ~ ERC + VPD (standardized predictors for note only)
    xz = np.column_stack(
        [
            np.ones(n),
            (e - e.mean()) / e.std(ddof=1),
            (v - v.mean()) / v.std(ddof=1),
        ]
    )
    yz = (a - a.mean()) / a.std(ddof=1)
    beta, _, _, _ = np.linalg.lstsq(xz, yz, rcond=None)
    pred = xz @ beta
    r2 = float(1 - ((yz - pred) ** 2).sum() / ((yz - yz.mean()) ** 2).sum())
    rows.append(
        {
            "test": "Acres ~ ERC + VPD (multiple R²)",
            "control": "joint standardized OLS",
            "pearson_r": round(r2, 3),
            "n": n,
            "window": "2010-2025",
        }
    )

    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["test", "control", "pearson_r", "n", "window"])
        w.writeheader()
        w.writerows(rows)

    NOTES.write_text(
        f"""# Partial correlation notes (exploratory)

Repository research for Patterns supplementary. **Not causal.**

## Window

Western GACC acres × western fire-season ERC/VPD, calendar years **2010-2025** (n = {n}).

## Results

See `correlation-partial.csv`. Headline:

- Raw acres–ERC r ≈ **0.821**; acres–VPD r ≈ **0.808**
- Partial acres–ERC | VPD ≈ **0.30**; acres–VPD | ERC ≈ **0.18**
- Controlling for linear year barely changes raw r
- ERC–VPD collinearity r ≈ **0.944**
- Joint ERC+VPD multiple R² ≈ **{r2:.3f}** (barely above ERC alone)

## Interpretation

ERC and VPD are nearly the same dryness signal in this sample. After one is controlled for, the other adds little. This is a redundancy check, not evidence that either “causes” acres burned. Still no controls for El Niño, ignitions, suppression, or housing growth.

## Reproduce

```bash
python scripts/compute_partial_correlations.py
```
""",
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")
    for r in rows:
        print(f"  {r['test']}: {r['pearson_r']}")


if __name__ == "__main__":
    main()
