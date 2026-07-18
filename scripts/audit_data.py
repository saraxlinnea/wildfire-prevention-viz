#!/usr/bin/env python3
"""Pre-publish data integrity audit. Exit 1 if any check fails."""

import sys
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parent.parent / "data"
TOLERANCE = 0.15
VPD_MIN, VPD_MAX = 1.0, 2.5


def fail(msg: str) -> None:
    print(f"FAIL: {msg}")


def ok(msg: str) -> None:
    print(f"OK: {msg}")


def main() -> int:
    errors = 0

    wf = pd.read_csv(ROOT / "wildfire-data.csv", skiprows=[1])
    wf["year"] = wf["year"].astype(int)

    dsci = pd.read_csv(ROOT / "dsci-annual-averages.csv")
    merged = wf.merge(dsci, on="year", how="inner", suffixes=("_chart", "_audit"))
    merged["dsci_avg_chart"] = pd.to_numeric(merged["dsci_avg_chart"], errors="coerce")
    bad = merged[(merged["dsci_avg_chart"] - merged["dsci_avg_audit"]).abs() > TOLERANCE]
    if len(bad):
        fail(f"National DSCI mismatch in {len(bad)} year(s)")
        errors += 1
    else:
        ok("National DSCI matches audit CSV")

    west = pd.read_csv(ROOT / "dsci-western-annual.csv")
    merged_w = wf.merge(west, on="year", how="inner", suffixes=("_chart", "_audit"))
    merged_w["dsci_west_avg"] = pd.to_numeric(merged_w["dsci_west_avg"], errors="coerce")
    bad_w = merged_w[(merged_w["dsci_west_avg"] - merged_w["dsci_avg_audit"]).abs() > TOLERANCE]
    if len(bad_w):
        fail(f"Western DSCI mismatch in {len(bad_w)} year(s)")
        errors += 1
    else:
        ok("Western DSCI matches audit CSV")

    west_acres = pd.read_csv(ROOT / "western-acres-annual.csv")
    merged_a = wf.merge(west_acres, on="year", how="inner")
    merged_a["western_acres_burned_millions"] = pd.to_numeric(
        merged_a["western_acres_burned_millions"], errors="coerce"
    )
    merged_a["western_acres_millions"] = pd.to_numeric(
        merged_a["western_acres_millions"], errors="coerce"
    )
    bad_a = merged_a[
        (merged_a["western_acres_burned_millions"] - merged_a["western_acres_millions"]).abs() > TOLERANCE
    ]
    if len(bad_a):
        fail(f"Western acres mismatch in {len(bad_a)} year(s)")
        errors += 1
    else:
        ok("Western acres match western-acres-annual.csv (2010-2025)")

    regional = pd.read_csv(ROOT / "regional-acres-annual.csv")
    regional["year"] = regional["year"].astype(int)
    west_reg = regional.merge(
        west_acres[["year", "western_acres_millions"]].rename(
            columns={"western_acres_millions": "western_millions_ref"}
        ),
        on="year",
    )
    west_reg["western_millions_reg"] = pd.to_numeric(
        west_reg["western_acres_millions"], errors="coerce"
    )
    west_reg["western_millions_ref"] = pd.to_numeric(
        west_reg["western_millions_ref"], errors="coerce"
    )
    bad_reg = west_reg[
        (west_reg["western_millions_reg"] - west_reg["western_millions_ref"]).abs() > TOLERANCE
    ]
    if len(bad_reg):
        fail(f"Regional CSV western mismatch in {len(bad_reg)} year(s)")
        errors += 1
    else:
        ok("Regional CSV western totals match western-acres-annual.csv")

    legacy = regional[regional["year"].between(2010, 2012)]
    if not (legacy["gacc_coverage"] == "all_gaccs").all():
        fail("Expected 2010-2012 all_gaccs in regional-acres-annual.csv")
        errors += 1
    else:
        ok("Regional CSV 2010-2012 have all_gaccs (EA/SA/AK in legacy extract)")

    if (set(regional["year"]) & {2008, 2009}) != {2008, 2009}:
        fail("Expected 2008-2009 hand-OCR GACC acres in regional-acres-annual.csv")
        errors += 1
    else:
        ok("Regional CSV includes 2008-2009 (hand-OCR lightning+human)")

    if regional["year"].min() > 2003:
        fail(f"Expected regional acres from 2003, got min year {regional.year.min()}")
        errors += 1
    else:
        ok("Regional acres span includes 2003+")

    vpd = pd.read_csv(ROOT / "vpd-annual.csv")
    bad_vpd = vpd[(vpd["vpd_kpa"] < VPD_MIN) | (vpd["vpd_kpa"] > VPD_MAX)]
    if len(bad_vpd):
        fail(f"VPD out of range ({VPD_MIN}-{VPD_MAX} kPa): years {bad_vpd['year'].tolist()}")
        errors += 1
    else:
        ok(f"VPD {int(vpd.year.min())}-{int(vpd.year.max())} all in range")

    erc = pd.read_csv(ROOT / "erc-annual.csv")
    ERC_MIN, ERC_MAX = 35.0, 85.0
    bad_erc = erc[(erc["erc"] < ERC_MIN) | (erc["erc"] > ERC_MAX)]
    if len(bad_erc):
        fail(f"ERC out of range ({ERC_MIN}-{ERC_MAX}): years {bad_erc['year'].tolist()}")
        errors += 1
    else:
        ok(f"ERC {int(erc.year.min())}-{int(erc.year.max())} all in range")

    reg_grid = pd.read_csv(ROOT / "regional-gridmet-annual.csv")
    reg_grid["year"] = reg_grid["year"].astype(int)
    west_check = reg_grid.merge(vpd, on="year", how="inner").merge(erc, on="year", how="inner")
    west_check["west_vpd_kpa"] = pd.to_numeric(west_check["west_vpd_kpa"], errors="coerce")
    west_check["west_erc"] = pd.to_numeric(west_check["west_erc"], errors="coerce")
    if (
        (west_check["west_vpd_kpa"] - west_check["vpd_kpa"]).abs() > TOLERANCE
    ).any() or (
        (west_check["west_erc"] - west_check["erc"]).abs() > TOLERANCE
    ).any():
        fail("regional-gridmet west columns disagree with vpd/erc annual CSVs")
        errors += 1
    else:
        ok("Regional gridMET west columns match vpd-annual.csv and erc-annual.csv")

    subset = reg_grid[(reg_grid["year"] >= 2010) & (reg_grid["year"] <= 2025)]
    for col in ["south_vpd_kpa", "south_erc", "east_vpd_kpa", "east_erc"]:
        if subset[col].isna().any():
            fail(f"regional-gridmet-annual.csv has nulls in {col} for 2010-2025")
            errors += 1
            break
    else:
        ok("Regional gridMET south/east columns complete (2010-2025)")

    y2026 = wf.loc[wf["year"] == 2026].iloc[0]
    if str(y2026["acres_burned_partial"]).lower() != "true":
        fail("2026 acres_burned_partial not set")
        errors += 1
    if str(y2026["dsci_partial"]).lower() != "true":
        fail("2026 dsci_partial not set")
        errors += 1
    if not errors:
        ok("2026 partial-year flags")

    burn = wf[wf["acres_burned_partial"].fillna("").astype(str).str.lower() != "true"]
    burn_years = burn["year"].astype(int)
    if burn_years.min() != 1983:
        fail(f"Expected burn data from 1983, got {burn_years.min()}")
        errors += 1
    else:
        ok(f"Acres burned span {burn_years.min()}-{burn_years.max()}")

    required_files = [
        "wildfire-data.csv", "vpd-annual.csv", "erc-annual.csv",
        "dsci-annual-averages.csv", "dsci-western-annual.csv",
        "western-acres-annual.csv", "regional-acres-annual.csv",
        "regional-gridmet-annual.csv", "regional-correlation-rank.csv",
        "regional-dsci-annual.csv", "south-fm100-annual.csv",
        "hfr-prevention-annual.csv", "hfr-wui-annual.csv",
        "vpd-monthly-annual.csv", "vpd-monthly-correlation.csv",
        "correlation-matrix.csv",
        "smoke-pm25-annual.csv",
    ]
    for name in required_files:
        path = ROOT / name
        if not path.exists():
            fail(f"Missing {name}")
            errors += 1
    ok("Required data files present")

    print(f"\nAudit complete: {errors} error(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
