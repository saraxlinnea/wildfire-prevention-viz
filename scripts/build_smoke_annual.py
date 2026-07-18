#!/usr/bin/env python3
"""Build annual CONUS wildfire smoke PM2.5 series from Childs et al. county daily data.

Source: Harvard Dataverse doi:10.7910/DVN/DJVMTV (Childs et al. 2022, ES&T).
County file lists smoke-day predictions only; non-smoke days are 0 by construction.

Annual county mean = sum(smokePM_pred) / days_in_year.
National series = unweighted mean across counties (see data/smoke-pm25-notes.md).

Usage:
  python scripts/build_smoke_annual.py          # download + aggregate
  python scripts/build_smoke_annual.py --local    # use cached county CSV only
"""

from __future__ import annotations

import csv
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "smoke-source"
COUNTY_CSV = SRC_DIR / "smokePM2pt5_predictions_daily_county_20060101-20201231.csv"
OUT = ROOT / "data" / "smoke-pm25-annual.csv"
DOWNLOAD_URL = "https://dataverse.harvard.edu/api/access/datafile/8550336"


def download_county() -> None:
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    if COUNTY_CSV.exists() and COUNTY_CSV.stat().st_size > 1_000_000:
        print(f"Using cached {COUNTY_CSV.name}")
        return
    print(f"Downloading county smoke PM2.5 (~75 MB) to {COUNTY_CSV} ...")
    urllib.request.urlretrieve(DOWNLOAD_URL, COUNTY_CSV)
    print("Download complete.")


def aggregate() -> list[dict]:
    if not COUNTY_CSV.exists():
        raise FileNotFoundError(f"Missing {COUNTY_CSV}; run without --local first.")

    county_year_sum: dict[tuple[str, int], float] = defaultdict(float)
    with COUNTY_CSV.open(newline="") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            year = int(row["date"][:4])
            county_year_sum[(row["GEOID"], year)] += float(row["smokePM_pred"])

    years = sorted({y for _, y in county_year_sum})
    rows = []
    for year in years:
        days = 366 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 365
        county_means = [
            s / days for (geoid, y), s in county_year_sum.items() if y == year
        ]
        if not county_means:
            continue
        national = sum(county_means) / len(county_means)
        rows.append({
            "year": year,
            "smoke_pm25_ug_m3": round(national, 4),
            "county_count": len(county_means),
            "geography": "CONUS",
            "method": "county_mean_daily_smoke_pm25",
            "source": "Childs et al. 2022 via doi:10.7910/DVN/DJVMTV",
        })
    return rows


def main() -> None:
    local_only = "--local" in sys.argv
    if not local_only:
        download_county()
    rows = aggregate()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = ["year", "smoke_pm25_ug_m3", "county_count", "geography", "method", "source"]
    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {OUT} ({len(rows)} years, {rows[0]['year']}-{rows[-1]['year']})")
    for r in rows:
        if r["year"] in (2008, 2015, 2017, 2020):
            print(f"  {r['year']}: {r['smoke_pm25_ug_m3']} µg/m³ (n counties={r['county_count']})")


if __name__ == "__main__":
    main()
