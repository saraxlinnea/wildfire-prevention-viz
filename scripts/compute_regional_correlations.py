#!/usr/bin/env python3
"""Exploratory Pearson correlations: regional GACC acres vs regional gridMET drivers."""

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
REGIONAL_ACRES = ROOT / "data" / "regional-acres-annual.csv"
REGIONAL_GRIDMET = ROOT / "data" / "regional-gridmet-annual.csv"
REGIONAL_DSCI = ROOT / "data" / "regional-dsci-annual.csv"
SOUTH_FM100 = ROOT / "data" / "south-fm100-annual.csv"
OUT_RANK = ROOT / "data" / "regional-correlation-rank.csv"
OUT_MATRIX = ROOT / "data" / "regional-correlation-matrix.csv"
OUT_NOTES = ROOT / "data" / "regional-correlation-notes.md"

# 2013-2025: all GACCs present in regional acres CSV
WINDOW_START = 2013
WINDOW_END = 2025

REGION_SPECS = [
    {
        "region": "west",
        "acres_col": "western_acres_millions",
        "vpd_col": "west_vpd_kpa",
        "erc_col": "west_erc",
        "dsci_col": "west_dsci",
        "driver_geo": "gridMET west of 100°W, May-Sep",
        "dsci_geo": "USDM NWS Western Region (WR)",
        "acres_geo": "NICC western GACCs (7)",
    },
    {
        "region": "south",
        "acres_col": "southern_acres_millions",
        "vpd_col": "south_vpd_kpa",
        "erc_col": "south_erc",
        "fm100_col": "south_fm100_pct",
        "dsci_col": "south_dsci",
        "driver_geo": "gridMET SE bbox, Jan-Apr",
        "dsci_geo": "USDM NWS Southern Region (SR)",
        "fm100_geo": "gridMET SE bbox, Jan-Apr 100-hr fuel moisture",
        "acres_geo": "NICC SA GACC",
    },
    {
        "region": "east",
        "acres_col": "eastern_acres_millions",
        "vpd_col": "east_vpd_kpa",
        "erc_col": "east_erc",
        "dsci_col": "east_dsci",
        "driver_geo": "gridMET Mid-Atlantic/NE bbox, Mar-Jun",
        "dsci_geo": "USDM NWS Eastern Region (ER)",
        "acres_geo": "NICC EA GACC",
    },
    {
        "region": "alaska",
        "acres_col": "alaska_acres_millions",
        "vpd_col": None,
        "erc_col": None,
        "dsci_col": "alaska_dsci",
        "driver_geo": "gridMET not available (lat max ~49.4°N)",
        "dsci_geo": "USDM NWS Alaska (AR)",
        "acres_geo": "NICC AK GACC",
    },
]


def main() -> None:
    acres = pd.read_csv(REGIONAL_ACRES)
    grid = pd.read_csv(REGIONAL_GRIDMET)
    dsci = pd.read_csv(REGIONAL_DSCI)
    fm100 = pd.read_csv(SOUTH_FM100) if SOUTH_FM100.exists() else None
    acres["year"] = acres["year"].astype(int)
    grid["year"] = grid["year"].astype(int)
    dsci["year"] = dsci["year"].astype(int)

    df = acres.merge(grid, on="year", how="inner").merge(dsci, on="year", how="inner")
    if fm100 is not None:
        fm100["year"] = fm100["year"].astype(int)
        df = df.merge(fm100.rename(columns={"fm100_pct": "south_fm100_pct"}), on="year", how="left")
    df = df[(df["year"] >= WINDOW_START) & (df["year"] <= WINDOW_END)]
    df = df[df["gacc_coverage"] == "all_gaccs"].copy()

    numeric_cols = [
        "western_acres_millions",
        "southern_acres_millions",
        "eastern_acres_millions",
        "alaska_acres_millions",
        "west_vpd_kpa",
        "west_erc",
        "south_vpd_kpa",
        "south_erc",
        "east_vpd_kpa",
        "east_erc",
        "south_fm100_pct",
        "west_dsci",
        "east_dsci",
        "south_dsci",
        "alaska_dsci",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    rank_rows = []
    for spec in REGION_SPECS:
        acres_col = spec["acres_col"]
        pairs = []
        if spec["vpd_col"]:
            pairs.append(("vpd", spec["vpd_col"], spec["driver_geo"]))
        if spec["erc_col"]:
            pairs.append(("erc", spec["erc_col"], spec["driver_geo"]))
        if spec.get("fm100_col"):
            pairs.append(("fm100", spec["fm100_col"], spec["fm100_geo"]))
        if spec["dsci_col"]:
            pairs.append(("dsci", spec["dsci_col"], spec["dsci_geo"]))

        region_rs = []
        for driver_name, driver_col, driver_geo in pairs:
            sub = df[[acres_col, driver_col]].dropna()
            n = len(sub)
            r = sub[acres_col].corr(sub[driver_col], method="pearson") if n >= 3 else None
            row = {
                "region": spec["region"],
                "acres_series": acres_col,
                "driver": driver_name,
                "driver_col": driver_col,
                "pearson_r": round(r, 3) if r is not None else "",
                "n": n,
                "window": f"{WINDOW_START}-{WINDOW_END}",
                "acres_geo": spec["acres_geo"],
                "driver_geo": driver_geo,
            }
            rank_rows.append(row)
            if r is not None:
                region_rs.append((driver_name, abs(r), r))

        region_rs.sort(key=lambda x: x[1], reverse=True)
        for rank, (driver_name, _, r) in enumerate(region_rs, start=1):
            for row in rank_rows:
                if row["region"] == spec["region"] and row["driver"] == driver_name:
                    row["rank_in_region"] = rank
                    row["best_in_region"] = rank == 1

    rank_df = pd.DataFrame(rank_rows)
    rank_df.to_csv(OUT_RANK, index=False)

    matrix_cols = []
    rename = {}
    for spec in REGION_SPECS:
        matrix_cols.append(spec["acres_col"])
        rename[spec["acres_col"]] = f"{spec['region']}_acres_m"
        if spec["vpd_col"]:
            matrix_cols.append(spec["vpd_col"])
            rename[spec["vpd_col"]] = f"{spec['region']}_vpd"
        if spec["erc_col"]:
            matrix_cols.append(spec["erc_col"])
            rename[spec["erc_col"]] = f"{spec['region']}_erc"
        if spec.get("fm100_col") and spec["fm100_col"] in df.columns:
            matrix_cols.append(spec["fm100_col"])
            rename[spec["fm100_col"]] = f"{spec['region']}_fm100"
        if spec["dsci_col"]:
            matrix_cols.append(spec["dsci_col"])
            rename[spec["dsci_col"]] = f"{spec['region']}_dsci"
    mdf = df[matrix_cols].dropna()
    matrix = mdf.corr(method="pearson").round(3)
    matrix.index = [rename.get(c, c) for c in matrix.index]
    matrix.columns = [rename.get(c, c) for c in matrix.columns]
    matrix.to_csv(OUT_MATRIX)

    notes = f"""# Regional correlation notes (Phase 2–3)

Exploratory only. Notebook/repository analysis; Coupling tab has a summary accordion.

## Window

- **{WINDOW_START}-{WINDOW_END}** calendar years (n = {len(df)}), `gacc_coverage=all_gaccs`
- 2010-2012 excluded (EA/SA/AK absent in legacy NICC extract)

## Geography

- **West:** NICC western GACCs vs gridMET west of 100°W May-Sep + USDM NWS WR DSCI
- **South:** NICC SA GACC vs gridMET SE bbox Jan-Apr (VPD/ERC/fm100) + USDM NWS SR DSCI
- **East:** NICC EA GACC vs gridMET Mid-Atlantic/NE bbox Mar-Jun + USDM NWS ER DSCI
- **Alaska:** NICC AK GACC vs USDM NWS AR DSCI only (gridMET lat max ~49.4°N)

## Files

- `regional-correlation-rank.csv`: acres vs VPD/ERC/DSCI ranked within each region
- `regional-correlation-matrix.csv`: Pearson matrix for regional series
- `regional-gridmet-annual.csv`: regional driver series (`scripts/extend_regional_indices.py`)
- `regional-dsci-annual.csv`: NWS regional DSCI (`scripts/fetch_regional_dsci.py`)
- `south-fm100-annual.csv`: Southeast Jan-Apr 100-hr fuel moisture (`scripts/extend_fm100.py`)

## Reproduce

```bash
python scripts/fetch_regional_dsci.py
python scripts/extend_fm100.py --start 2010 --end 2025
python scripts/extend_regional_indices.py --start 2010 --end 2025
python scripts/compute_regional_correlations.py
```
"""
    OUT_NOTES.write_text(notes)

    print(f"Wrote {OUT_RANK}")
    print(f"Wrote {OUT_MATRIX}")
    print(f"Wrote {OUT_NOTES}")
    print()
    print(rank_df.to_string(index=False))


if __name__ == "__main__":
    main()
