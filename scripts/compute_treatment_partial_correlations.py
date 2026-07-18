#!/usr/bin/env python3
"""Partial correlations: HFR treatment vs national acres with stacked controls.

Exploratory only. Fiscal treatment year labeled to calendar burn year.
Not causal. Writes data/correlation-treatment-partial.csv + notes.
"""

from __future__ import annotations

import csv
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "correlation-treatment-partial.csv"
NOTES = ROOT / "data" / "correlation-treatment-partial-notes.md"


def residual(y: np.ndarray, controls: list[np.ndarray]) -> np.ndarray:
    x = np.column_stack([np.ones(len(y)), *controls])
    beta, _, _, _ = np.linalg.lstsq(x, y, rcond=None)
    return y - x @ beta


def partial(x: np.ndarray, y: np.ndarray, *controls: np.ndarray) -> float:
    return float(np.corrcoef(residual(x, list(controls)), residual(y, list(controls)))[0, 1])


def r_squared(y: np.ndarray, *xs: np.ndarray) -> float:
    x = np.column_stack([np.ones(len(y)), *xs])
    beta, _, _, _ = np.linalg.lstsq(x, y, rcond=None)
    pred = x @ beta
    ss_res = float(((y - pred) ** 2).sum())
    ss_tot = float(((y - y.mean()) ** 2).sum())
    return 1.0 - ss_res / ss_tot if ss_tot else float("nan")


def main() -> None:
    hfr = pd.read_csv(ROOT / "data" / "hfr-prevention-annual.csv")
    wui = pd.read_csv(ROOT / "data" / "hfr-wui-annual.csv")[
        ["fiscal_year", "wui_share_of_designation"]
    ]
    wf = pd.read_csv(ROOT / "data" / "wildfire-data.csv")
    wf = wf[wf["year"].astype(str).str.match(r"^\d{4}$")].copy()
    wf["year"] = wf["year"].astype(int)
    burn = wf[
        (wf["year"].between(2003, 2025))
        & (wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true")
    ][["year", "acres_burned_millions"]].copy()
    burn["acres_burned_millions"] = pd.to_numeric(burn["acres_burned_millions"])

    erc = pd.read_csv(ROOT / "data" / "erc-annual.csv")
    vpd = pd.read_csv(ROOT / "data" / "vpd-annual.csv")
    reg = pd.read_csv(ROOT / "data" / "regional-acres-annual.csv")[
        ["year", "western_share_of_gacc"]
    ]

    d = (
        hfr.merge(burn, left_on="fiscal_year", right_on="year", how="inner")
        .merge(wui, on="fiscal_year", how="inner")
        .merge(erc, on="year", how="inner")
        .merge(vpd, on="year", how="inner")
        .merge(reg, on="year", how="inner")
        .dropna()
        .copy()
    )
    n = len(d)
    treat = (d["combined_treatment_acres"] / 1_000_000).to_numpy(float)
    acres = d["acres_burned_millions"].to_numpy(float)
    e = d["erc"].to_numpy(float)
    v = d["vpd_kpa"].to_numpy(float)
    y = d["year"].to_numpy(float)
    w = d["wui_share_of_designation"].to_numpy(float)
    ws = d["western_share_of_gacc"].to_numpy(float)

    rows = [
        {
            "test": "Treatment vs national acres (raw)",
            "control": "none",
            "pearson_r": round(float(np.corrcoef(treat, acres)[0, 1]), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "Treatment vs national acres | ERC",
            "control": "western fire-season ERC",
            "pearson_r": round(partial(treat, acres, e), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "Treatment vs national acres | ERC + year",
            "control": "western ERC + linear year",
            "pearson_r": round(partial(treat, acres, e, y), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "Treatment vs national acres | ERC + year + WUI share",
            "control": "western ERC + year + WUI designation share",
            "pearson_r": round(partial(treat, acres, e, y, w), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "Treatment vs national acres | ERC + year + WUI + west share",
            "control": "western ERC + year + WUI share + western GACC share",
            "pearson_r": round(partial(treat, acres, e, y, w, ws), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "Treatment vs national acres | ERC + VPD + year + WUI + west share",
            "control": "western ERC + VPD + year + WUI share + western GACC share",
            "pearson_r": round(partial(treat, acres, e, v, y, w, ws), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "National acres ~ ERC alone (R²)",
            "control": "OLS R²",
            "pearson_r": round(r_squared(acres, e), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "National acres ~ treatment + ERC + year + WUI + west share (R²)",
            "control": "joint OLS R²",
            "pearson_r": round(r_squared(acres, treat, e, y, w, ws), 3),
            "n": n,
            "window": "2003-2021",
        },
        {
            "test": "National acres ~ ERC + year + WUI + west share, no treatment (R²)",
            "control": "joint OLS R² without treatment",
            "pearson_r": round(r_squared(acres, e, y, w, ws), 3),
            "n": n,
            "window": "2003-2021",
        },
    ]

    with OUT.open("w", newline="", encoding="utf-8") as f:
        wtr = csv.DictWriter(
            f, fieldnames=["test", "control", "pearson_r", "n", "window"]
        )
        wtr.writeheader()
        wtr.writerows(rows)

    raw = rows[0]["pearson_r"]
    full = rows[5]["pearson_r"]
    r2_full = rows[7]["pearson_r"]
    r2_no = rows[8]["pearson_r"]

    NOTES.write_text(
        f"""# Treatment vs acres — partial correlations (exploratory)

Drivers tab research under the dual-axis chart. **Not causal.**

## Window

HFR combined federal treatment (FY 2003-2021) vs NIFC national acres burned
(calendar year label = fiscal year). n = {n}.

Controls available in this repository:

- western fire-season ERC (gridMET)
- western fire-season VPD (gridMET; collinear with ERC)
- linear calendar year
- HFR WUI share of designation
- western share of NICC GACC acres

Still missing: El Niño, ignitions, suppression effort, housing growth, vegetation recovery.

## Headline

- Raw treatment–acres r ≈ **{raw}**
- After ERC + VPD + year + WUI share + western share: partial r ≈ **{full}**
- Joint R² with treatment ≈ **{r2_full}**; without treatment ≈ **{r2_no}**

Treatment adds little once dryness and composition controls are in the model.
Weak negative co-movement is not evidence that cutting treatment caused larger burn years.

## Reproduce

```bash
python scripts/compute_treatment_partial_correlations.py
```
""",
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")
    for r in rows:
        print(f"  {r['test']}: {r['pearson_r']}")


if __name__ == "__main__":
    main()
