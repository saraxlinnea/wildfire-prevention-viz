#!/usr/bin/env python3
"""Exploratory correlations: HFR federal treatment (fiscal year) vs national acres."""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
HFR = ROOT / "data" / "hfr-prevention-annual.csv"
WILDFIRE = ROOT / "data" / "wildfire-data.csv"
OUT = ROOT / "data" / "hfr-correlation-notes.md"

# Calendar burn years with full national acres (exclude partial 2026)
BURN_START = 2004
BURN_END = 2025


def pearson(a: pd.Series, b: pd.Series) -> tuple[float | None, int]:
    df = pd.DataFrame({"a": a, "b": b}).dropna()
    n = len(df)
    if n < 3:
        return None, n
    return round(df["a"].corr(df["b"], method="pearson"), 3), n


def main() -> None:
    hfr = pd.read_csv(HFR)
    wf = pd.read_csv(WILDFIRE)
    hfr["fiscal_year"] = hfr["fiscal_year"].astype(int)
    wf = wf[wf["year"].astype(str).str.match(r"^\d{4}$")].copy()
    wf["year"] = wf["year"].astype(int)
    burn = wf[
        (wf["year"] >= BURN_START)
        & (wf["year"] <= BURN_END)
        & (wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true")
    ][["year", "acres_burned_millions"]].copy()
    burn["acres_burned_millions"] = pd.to_numeric(burn["acres_burned_millions"])

    # Same fiscal/calendar year (misaligned seasons; exploratory only)
    same = hfr.merge(
        burn,
        left_on="fiscal_year",
        right_on="year",
        how="inner",
    )
    r_combined, n_same = pearson(
        same["combined_treatment_acres"] / 1_000_000,
        same["acres_burned_millions"],
    )
    r_fs, _ = pearson(same["fs_treatment_acres"] / 1_000_000, same["acres_burned_millions"])
    r_doi, _ = pearson(same["doi_treatment_acres"] / 1_000_000, same["acres_burned_millions"])

    # Treatment fiscal year t vs acres calendar year t+1
    burn_next = burn.rename(
        columns={"year": "outcome_year", "acres_burned_millions": "acres_next_m"}
    )
    burn_next["fiscal_year"] = burn_next["outcome_year"] - 1
    lag = hfr.merge(burn_next, on="fiscal_year", how="inner")
    r_lag, n_lag = pearson(lag["combined_treatment_acres"] / 1_000_000, lag["acres_next_m"])

    notes = f"""# HFR prevention correlation notes (exploratory)

Repository research only. Not on the live page.

## Source

- `hfr-prevention-annual.csv` (FY 2003-2021, NFPORS joint FS+DOI report)
- `wildfire-data.csv` national acres burned (NIFC, calendar year)

## Same-year pairings (fiscal FY = calendar year label)

Window: {BURN_START}-{BURN_END} overlap, n = {n_same}

| Pairing | Pearson r |
|---|---|
| Combined HFR treatment vs national acres | {r_combined} |
| FS treatment vs national acres | {r_fs} |
| DOI treatment vs national acres | {r_doi} |

## Lag pairing (FY treatment vs next calendar-year acres)

n = {n_lag}

| Pairing | Pearson r |
|---|---|
| Combined HFR treatment (FY t) vs national acres (year t+1) | {r_lag} |

## Limitations

- Fiscal vs calendar year mismatch; fire season spans months.
- HFR totals include treatment-type columns that changed definition over time (see report footnotes).
- Not causal. Overlaps conceptually with Interior (2018-2024) and FS NPR (2023-2025) page series but different methods.

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
python scripts/compute_hfr_correlations.py
```
"""
    OUT.write_text(notes)
    print(f"Wrote {OUT}")
    print(f"Same-year r (combined): {r_combined} (n={n_same})")
    print(f"Lag r (combined): {r_lag} (n={n_lag})")


if __name__ == "__main__":
    main()
