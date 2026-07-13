#!/usr/bin/env python3
"""HFR WUI vs non-WUI designation acres (FY 2003-2021).

WUI columns in the HFR report are designation acres from the same tables as
treatment totals; they are not a separate outcome measure.
"""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
HFR = ROOT / "data" / "hfr-prevention-annual.csv"
WILDFIRE = ROOT / "data" / "wildfire-data.csv"
OUT_CSV = ROOT / "data" / "hfr-wui-annual.csv"
OUT_NOTES = ROOT / "data" / "hfr-wui-notes.md"


def pearson(a: pd.Series, b: pd.Series) -> tuple[float | None, int]:
    df = pd.DataFrame({"a": a, "b": b}).dropna()
    n = len(df)
    if n < 3:
        return None, n
    return round(df["a"].corr(df["b"], method="pearson"), 3), n


def main() -> None:
    hfr = pd.read_csv(HFR)
    hfr["fiscal_year"] = hfr["fiscal_year"].astype(int)

    for col in [
        "fs_wui_acres", "fs_non_wui_acres", "doi_wui_acres", "doi_non_wui_acres",
        "combined_treatment_acres",
    ]:
        hfr[col] = pd.to_numeric(hfr[col], errors="coerce")

    hfr["combined_wui_acres"] = hfr["fs_wui_acres"] + hfr["doi_wui_acres"]
    hfr["combined_non_wui_acres"] = hfr["fs_non_wui_acres"] + hfr["doi_non_wui_acres"]
    denom = hfr["combined_wui_acres"] + hfr["combined_non_wui_acres"]
    hfr["wui_share_of_designation"] = (hfr["combined_wui_acres"] / denom).round(4)
    hfr["wui_share_of_treatment"] = (
        hfr["combined_wui_acres"] / hfr["combined_treatment_acres"]
    ).round(4)

    out = hfr[
        [
            "fiscal_year",
            "combined_treatment_acres",
            "combined_wui_acres",
            "combined_non_wui_acres",
            "wui_share_of_designation",
            "wui_share_of_treatment",
            "fs_wui_acres",
            "fs_non_wui_acres",
            "doi_wui_acres",
            "doi_non_wui_acres",
        ]
    ].copy()
    out.to_csv(OUT_CSV, index=False)

    wf = pd.read_csv(WILDFIRE, skiprows=[1])
    wf = wf[wf["year"].astype(str).str.match(r"^\d{4}$")].copy()
    wf["year"] = wf["year"].astype(int)
    burn = wf[
        (wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true")
        & (wf["year"] >= 2003)
        & (wf["year"] <= 2021)
    ][["year", "acres_burned_millions"]].copy()
    burn["acres_burned_millions"] = pd.to_numeric(burn["acres_burned_millions"])

    merged = hfr.merge(burn, left_on="fiscal_year", right_on="year", how="inner")
    r_wui_share, n = pearson(merged["wui_share_of_designation"], merged["acres_burned_millions"])
    r_wui_acres, _ = pearson(merged["combined_wui_acres"] / 1e6, merged["acres_burned_millions"])
    r_treatment, _ = pearson(merged["combined_treatment_acres"] / 1e6, merged["acres_burned_millions"])

    med_share = merged["wui_share_of_designation"].median()
    fy_min = int(merged["fiscal_year"].min())
    fy_max = int(merged["fiscal_year"].max())

    notes = f"""# HFR WUI vs non-WUI designation acres (exploratory)

Repository research only. Not on the main live charts.

## What the HFR columns mean

The HFR-DOI-FS report lists **WUI** and **Non-WUI** designation acres alongside
treatment totals. These are **where work was categorized**, not a separate count of
homes protected or risk reduced. WUI share can rise when agencies prioritize
community-adjacent projects even if total treatment acres fall.

## Output

- `hfr-wui-annual.csv`: combined WUI / non-WUI and shares by fiscal year
- Source: `hfr-prevention-annual.csv` (FY {fy_min}-{fy_max})

## WUI share of designation acres (median)

Median WUI share: **{med_share:.1%}** across FY {fy_min}-{fy_max}

Recent years (WUI share of designation):

| FY | Treatment (M ac) | WUI (M ac) | Non-WUI (M ac) | WUI share |
|---|---|---|---|---|
"""
    for _, row in hfr.tail(6).iterrows():
        notes += (
            f"| {int(row['fiscal_year'])} | "
            f"{row['combined_treatment_acres']/1e6:.2f} | "
            f"{row['combined_wui_acres']/1e6:.2f} | "
            f"{row['combined_non_wui_acres']/1e6:.2f} | "
            f"{row['wui_share_of_designation']:.1%} |\n"
        )

    notes += f"""
## Exploratory correlation vs national acres (same FY label, n = {n})

| Pairing | Pearson r |
|---|---|
| WUI share of designation vs national acres | {r_wui_share} |
| Combined WUI acres vs national acres | {r_wui_acres} |
| Combined treatment vs national acres | {r_treatment} |

## Limitations

- Fiscal year vs calendar year mismatch for acres burned.
- WUI designation ≠ treatment effectiveness or community outcomes.
- Not causal.

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
python scripts/compute_hfr_wui_analysis.py
```
"""
    OUT_NOTES.write_text(notes)
    print(f"Wrote {OUT_CSV}")
    print(f"Wrote {OUT_NOTES}")
    print(f"Median WUI share: {med_share:.1%}")
    print(f"r (WUI share vs acres): {r_wui_share} (n={n})")


if __name__ == "__main__":
    main()
