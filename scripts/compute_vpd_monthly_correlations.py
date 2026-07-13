#!/usr/bin/env python3
"""Exploratory: monthly western VPD vs calendar-year acres burned.

Tests whether May or Mar-May VPD tracks western/national acres better than
annual-lag proxies at calendar-year resolution. Outcome is still annual acres
(full calendar year), not summer-only burn totals.
"""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
MONTHLY = ROOT / "data" / "vpd-monthly-annual.csv"
VPD_ANNUAL = ROOT / "data" / "vpd-annual.csv"
WILDFIRE = ROOT / "data" / "wildfire-data.csv"
OUT_NOTES = ROOT / "data" / "vpd-monthly-correlation-notes.md"
OUT_CSV = ROOT / "data" / "vpd-monthly-correlation.csv"

WINDOW_START = 2010
WINDOW_END = 2025


def pearson(a: pd.Series, b: pd.Series) -> tuple[float | None, int]:
    df = pd.DataFrame({"a": a, "b": b}).dropna()
    n = len(df)
    if n < 3:
        return None, n
    return round(df["a"].corr(df["b"], method="pearson"), 3), n


def load_burn() -> pd.DataFrame:
    wf = pd.read_csv(WILDFIRE, skiprows=[1])
    wf = wf[wf["year"].astype(str).str.match(r"^\d{4}$")].copy()
    wf["year"] = wf["year"].astype(int)
    wf = wf[
        (wf["year"] >= WINDOW_START)
        & (wf["year"] <= WINDOW_END)
        & (wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true")
    ]
    wf["national_acres_m"] = pd.to_numeric(wf["acres_burned_millions"])
    wf["western_acres_m"] = pd.to_numeric(wf["western_acres_burned_millions"])
    return wf[["year", "national_acres_m", "western_acres_m"]]


def main() -> None:
    monthly = pd.read_csv(MONTHLY)
    annual_vpd = pd.read_csv(VPD_ANNUAL).rename(columns={"vpd_kpa": "vpd_fire_season"})
    burn = load_burn()
    df = monthly.merge(burn, on="year", how="inner").merge(annual_vpd, on="year", how="left")

    rows = []
    pairs = [
        ("May VPD vs western acres (same year)", "vpd_kpa_may", "western_acres_m", "same"),
        ("May VPD vs national acres (same year)", "vpd_kpa_may", "national_acres_m", "same"),
        ("Mar-May VPD vs western acres (same year)", "vpd_kpa_mar_may", "western_acres_m", "same"),
        ("Mar-May VPD vs national acres (same year)", "vpd_kpa_mar_may", "national_acres_m", "same"),
        ("Fire-season VPD vs western acres (same year)", "vpd_fire_season", "western_acres_m", "same"),
        ("May VPD (year t) vs western acres (year t+1)", "vpd_kpa_may", "western_acres_m", "lag1"),
        ("May VPD (year t) vs national acres (year t+1)", "vpd_kpa_may", "national_acres_m", "lag1"),
    ]

    for label, x_col, y_col, mode in pairs:
        if mode == "same":
            sub = df[[x_col, y_col]].dropna()
            r, n = pearson(sub[x_col], sub[y_col])
        else:
            lag = df[["year", x_col, y_col]].dropna(subset=[x_col, y_col]).sort_values("year")
            lag["y_next"] = lag[y_col].shift(-1)
            lag = lag.iloc[:-1]
            r, n = pearson(lag[x_col], lag["y_next"])
        rows.append({"pair": label, "pearson_r": r, "n": n, "window": f"{WINDOW_START}-{WINDOW_END}"})

    out_df = pd.DataFrame(rows)
    out_df.to_csv(OUT_CSV, index=False)

    may_west = out_df.loc[out_df["pair"] == "May VPD vs western acres (same year)", "pearson_r"].iloc[0]
    season_west = out_df.loc[
        out_df["pair"] == "Fire-season VPD vs western acres (same year)", "pearson_r"
    ].iloc[0]
    may_lag = out_df.loc[
        out_df["pair"] == "May VPD (year t) vs western acres (year t+1)", "pearson_r"
    ].iloc[0]

    notes = f"""# Monthly western VPD vs acres burned (exploratory)

Repository research only. Not on the main live charts.

## Question

Does **May** or **March-May** western VPD track annual acres burned more usefully than
the annual lag proxy (western VPD year t vs national acres t+1)?

**Outcome limitation:** Acres burned are still **calendar-year totals** (NIFC / western GACC).
We do not have summer-only burn totals in this repo. "Summer acres" here means
fire-season dryness (May or spring VPD) paired with the same calendar year's burn total.

## Source

- `vpd-monthly-annual.csv` from `scripts/extend_vpd_monthly.py` (gridMET, west of 100°W)
- `vpd-annual.csv` fire-season May-Sep for comparison
- `wildfire-data.csv` national and western acres

## Window

{WINDOW_START}-{WINDOW_END}, n = {len(df)} full years (partial 2026 excluded)

## Results

| Pairing | Pearson r | n |
|---|---|---|
"""
    for _, row in out_df.iterrows():
        notes += f"| {row['pair']} | {row['pearson_r']} | {row['n']} |\n"

    notes += f"""
## Headline comparisons

- May VPD vs western acres (same year): **r = {may_west}**
- Fire-season VPD vs western acres (same year): **r = {season_west}**
- May VPD vs western acres (lag 1 year): **r = {may_lag}**

## Interpretation (not causal)

- May and fire-season VPD are highly correlated with each other; do not treat as independent.
- Same-year May VPD vs western acres should be compared to fire-season VPD (≈0.81 on this page).
- Lag-1 May VPD is a finer **timing** test than annual VPD lagged against national acres,
  but calendar-year acres still blur spring vs summer burns.
- Monthly burn data would be needed for a true "May dryness → summer acres" test.

## Reproduce

```bash
python scripts/extend_vpd_monthly.py --start 2010 --end 2025
python scripts/compute_vpd_monthly_correlations.py
```
"""
    OUT_NOTES.write_text(notes)
    print(f"Wrote {OUT_NOTES}")
    print(f"Wrote {OUT_CSV}")
    print(out_df.to_string(index=False))


if __name__ == "__main__":
    main()
