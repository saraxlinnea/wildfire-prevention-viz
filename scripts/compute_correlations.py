#!/usr/bin/env python3
"""Compute exploratory Pearson/Spearman correlations between chart variables."""

import csv
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
WILDFIRE = ROOT / "data" / "wildfire-data.csv"
VPD = ROOT / "data" / "vpd-annual.csv"
ERC = ROOT / "data" / "erc-annual.csv"
OUT_MATRIX = ROOT / "data" / "correlation-matrix.csv"
OUT_WINDOWS = ROOT / "data" / "correlation-by-window.csv"
OUT_NOTES = ROOT / "data" / "correlation-notes.md"


def load_wildfire() -> pd.DataFrame:
    df = pd.read_csv(WILDFIRE, skiprows=[1])
    df["year"] = df["year"].astype(int)
    numeric_cols = [
        "acres_burned_millions", "western_acres_burned_millions",
        "fs_treatment_millions", "interior_treatment_millions",
        "dsci_avg", "dsci_west_avg", "forecast_low", "forecast_high",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    df = df[df["acres_burned_partial"].fillna("").astype(str).str.lower() != "true"]
    df = df[df["dsci_partial"].fillna("").astype(str).str.lower() != "true"]
    df = df[df["dsci_west_partial"].fillna("").astype(str).str.lower() != "true"]
    return df


def load_vpd() -> pd.DataFrame:
    return pd.read_csv(VPD).rename(columns={"vpd_kpa": "vpd_kpa"})


def load_erc() -> pd.DataFrame:
    return pd.read_csv(ERC)


def correlation_table(df: pd.DataFrame, cols: list[str], label: str) -> list[dict]:
    sub = df[["year", *cols]].dropna(subset=cols, how="any")
    rows = []
    for i, a in enumerate(cols):
        for b in cols[i + 1:]:
            if len(sub) < 3:
                continue
            pearson = sub[a].corr(sub[b], method="pearson")
            spearman = sub[a].rank().corr(sub[b].rank())
            rows.append({
                "window": label,
                "years": f"{int(sub['year'].min())}-{int(sub['year'].max())}",
                "n": len(sub),
                "variable_a": a,
                "variable_b": b,
                "pearson_r": round(pearson, 3),
                "spearman_rho": round(spearman, 3),
            })
    return rows


def main():
    wf = load_wildfire()
    vpd = load_vpd()
    erc = load_erc()
    merged = wf.merge(vpd, on="year", how="left").merge(erc, on="year", how="left")

    var_map = {
        "acres_burned_millions": "acres_burned_m",
        "western_acres_burned_millions": "western_acres_burned_m",
        "fs_treatment_millions": "fs_treatment_m",
        "interior_treatment_millions": "interior_treatment_m",
        "dsci_avg": "dsci_national",
        "dsci_west_avg": "dsci_west_nws",
        "vpd_kpa": "vpd_west_fireseason",
        "erc": "erc_west_fireseason",
    }

    windows = [
        ("2000-2025 climate+burn", merged, ["acres_burned_millions", "dsci_avg", "dsci_west_avg"], 2000, 2025),
        ("2010-2025 w/ VPD+ERC", merged, [
            "acres_burned_millions", "western_acres_burned_millions",
            "dsci_avg", "dsci_west_avg", "vpd_kpa", "erc",
        ], 2010, 2025),
        ("2010-2025 western acres+VPD", merged, ["western_acres_burned_millions", "vpd_kpa"], 2010, 2025),
        ("2010-2025 western acres+ERC", merged, ["western_acres_burned_millions", "erc"], 2010, 2025),
        ("2018-2024 prevention overlap", merged, ["acres_burned_millions", "interior_treatment_millions", "dsci_avg", "dsci_west_avg", "vpd_kpa", "erc"], 2018, 2024),
        ("2023-2025 FS overlap", merged, ["acres_burned_millions", "fs_treatment_millions", "dsci_avg", "dsci_west_avg", "vpd_kpa", "erc"], 2023, 2025),
    ]

    all_rows = []
    for label, frame, cols, y0, y1 in windows:
        slice_df = frame[(frame["year"] >= y0) & (frame["year"] <= y1)].copy()
        all_rows.extend(correlation_table(slice_df, cols, label))

    out = pd.DataFrame(all_rows)
    out["variable_a"] = out["variable_a"].map(var_map).fillna(out["variable_a"])
    out["variable_b"] = out["variable_b"].map(var_map).fillna(out["variable_b"])
    out.to_csv(OUT_WINDOWS, index=False)

    # Full pairwise matrix for 2010-2025 overlap (most complete climate window)
    matrix_cols = [
        "acres_burned_millions", "western_acres_burned_millions",
        "dsci_avg", "dsci_west_avg", "vpd_kpa", "erc",
    ]
    mdf = merged[(merged["year"] >= 2010) & (merged["year"] <= 2025)][matrix_cols].dropna()
    matrix = mdf.corr(method="pearson").round(3)
    matrix.index = [var_map.get(c, c) for c in matrix.index]
    matrix.columns = [var_map.get(c, c) for c in matrix.columns]
    matrix.to_csv(OUT_MATRIX)

    notes = """# Correlation analysis notes

Exploratory only. Not shown on the public visualization.

## Caveats

- Correlation is not causation. These series use different geographies, calendars, and definitions.
- Interior treatment is fiscal year (Oct 1). Acres burned and DSCI are calendar year.
- Forest Service treatment is comparable only from 2023 onward (three years).
- National acres burned include the entire country. Western acres sum seven western GACCs (NICC); VPD, ERC, and western DSCI cover western or regional areas.
- ERC and VPD are highly collinear in this window (r ≈ 0.94); treat as related fire-weather signals, not independent predictors.
- Short windows (especially 2023-2025) have very few observations. Treat those correlations as illustrative, not conclusive.
- 2026 partial-year values are excluded from all calculations.

## Files

- `correlation-by-window.csv`: pairwise Pearson and Spearman correlations by analysis window
- `correlation-matrix.csv`: Pearson matrix for 2010-2025 overlap (national and western acres, DSCI, VPD, ERC)

## Reproduce

```bash
python scripts/compute_correlations.py
```

Or run `notebooks/correlation-analysis.ipynb`.
"""
    OUT_NOTES.write_text(notes)
    print(f"Wrote {OUT_WINDOWS} ({len(out)} pairs)")
    print(f"Wrote {OUT_MATRIX}")
    print(f"Wrote {OUT_NOTES}")
    print(out.to_string(index=False))


if __name__ == "__main__":
    main()
