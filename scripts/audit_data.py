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

    vpd = pd.read_csv(ROOT / "vpd-annual.csv")
    bad_vpd = vpd[(vpd["vpd_kpa"] < VPD_MIN) | (vpd["vpd_kpa"] > VPD_MAX)]
    if len(bad_vpd):
        fail(f"VPD out of range ({VPD_MIN}-{VPD_MAX} kPa): years {bad_vpd['year'].tolist()}")
        errors += 1
    else:
        ok(f"VPD {int(vpd.year.min())}-{int(vpd.year.max())} all in range")

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
        "wildfire-data.csv", "vpd-annual.csv", "dsci-annual-averages.csv",
        "dsci-western-annual.csv", "correlation-matrix.csv",
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
