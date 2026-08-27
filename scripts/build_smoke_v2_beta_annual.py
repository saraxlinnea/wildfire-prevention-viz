#!/usr/bin/env python3
"""Build annual CONUS wildfire smoke PM2.5 from ECHO Lab v2.0 beta county daily data.

Writes data/smoke-pm25-v2-beta-annual.csv. Live chart uses data/smoke-pm25-annual.csv
(copy/sync from this file when locking). Childs v1 archive: smoke-pm25-v1-annual.csv.

Mirrors scripts/build_smoke_annual.py:
  Annual county mean = sum(smokePM) / days_in_year (non-smoke days = 0).
  National series = unweighted mean across counties.

Usage:
  python scripts/build_smoke_v2_beta_annual.py --local
  python scripts/build_smoke_v2_beta_annual.py --county path/to/county_daily.csv
  python scripts/build_smoke_v2_beta_annual.py --download   # Dropbox folder zip (large; often fails)

See data/smoke-pm25-v2-bakeoff.md and data/smoke-pm25-notes.md.
"""

from __future__ import annotations

import argparse
import csv
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "smoke-source"
OUT = ROOT / "data" / "smoke-pm25-v2-beta-annual.csv"
DROPBOX_FOLDER_ZIP = (
    "https://www.dropbox.com/scl/fo/91k0aq80vp57qixkm508q/"
    "AKQSIJ5C1kDMQLz8oh02UAA?rlkey=nutebc9pn2vsupr0p9ks4k73u&dl=1"
)
ZIP_PATH = SRC_DIR / "echo_v2_folder.zip"

# Candidate county daily filenames after unzip / manual place
COUNTY_CANDIDATES = [
    SRC_DIR / "smokePM2pt5_predictions_daily_county_20060101-20231231.csv",
    SRC_DIR / "smokePM2pt5_predictions_daily_county_2006-2023.csv",
    SRC_DIR / "county" / "smokePM2pt5_predictions_daily_county_20060101-20231231.csv",
]


def find_county_csv(explicit: Path | None) -> Path:
    if explicit is not None:
        if not explicit.exists():
            raise FileNotFoundError(explicit)
        return explicit
    for path in COUNTY_CANDIDATES:
        if path.exists() and path.stat().st_size > 1_000_000:
            return path
    # Any large county-named csv under smoke-source
    if SRC_DIR.exists():
        hits = sorted(
            p
            for p in SRC_DIR.rglob("*.csv")
            if "county" in p.name.lower() and p.stat().st_size > 1_000_000
        )
        if hits:
            return hits[0]
    raise FileNotFoundError(
        "No ECHO v2 county daily CSV found under data/smoke-source/. "
        "Place the county file there or pass --county. See smoke-pm25-v2-bakeoff.md."
    )


def detect_columns(fieldnames: list[str]) -> tuple[str, str, str]:
    lower = {f.lower(): f for f in fieldnames}
    geoid = lower.get("geoid") or lower.get("fips") or lower.get("county")
    date = lower.get("date") or lower.get("day")
    pm = (
        lower.get("smokepm_pred")
        or lower.get("smokepm")
        or lower.get("smoke_pm25")
        or lower.get("smoke_pm2.5")
        or lower.get("pm25")
    )
    if not geoid or not date or not pm:
        raise ValueError(f"Could not detect GEOID/date/smoke columns in {fieldnames}")
    return geoid, date, pm


def detect_delimiter(path: Path) -> str:
    with path.open(newline="", encoding="utf-8", errors="replace") as f:
        sample = f.read(4096)
    if sample.count("\t") > sample.count(","):
        return "\t"
    return ","


def aggregate(county_csv: Path) -> list[dict]:
    delim = detect_delimiter(county_csv)
    county_year_sum: dict[tuple[str, int], float] = defaultdict(float)
    with county_csv.open(newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f, delimiter=delim)
        if not reader.fieldnames:
            raise ValueError(f"Empty header in {county_csv}")
        geoid_c, date_c, pm_c = detect_columns(list(reader.fieldnames))
        for row in reader:
            date = (row.get(date_c) or "").strip()
            if len(date) < 4:
                continue
            year = int(date[:4])
            county_year_sum[(row[geoid_c], year)] += float(row[pm_c] or 0)

    years = sorted({y for _, y in county_year_sum})
    rows = []
    for year in years:
        days = 366 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 365
        county_means = [s / days for (geoid, y), s in county_year_sum.items() if y == year]
        if not county_means:
            continue
        national = sum(county_means) / len(county_means)
        rows.append(
            {
                "year": year,
                "smoke_pm25_ug_m3": round(national, 4),
                "county_count": len(county_means),
                "geography": "CONUS",
                "method": "county_mean_daily_smoke_pm25",
                "source": "ECHO Lab v2.0 beta (Childs et al. in review; preliminary)",
            }
        )
    return rows


def try_download_folder_zip() -> None:
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    print(
        f"Downloading ECHO v2 Dropbox folder zip (~9 GB) to {ZIP_PATH} ...\n"
        "No stable county-only URL is published; folder zip is the documented path."
    )
    # Note: Dropbox shared-folder zip often does not support Range resume.
    urllib.request.urlretrieve(DROPBOX_FOLDER_ZIP, ZIP_PATH)
    print(f"Download complete: {ZIP_PATH} ({ZIP_PATH.stat().st_size} bytes)")


def write_rows(rows: list[dict]) -> None:
    if not rows:
        raise SystemExit("No annual rows produced")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fields = ["year", "smoke_pm25_ug_m3", "county_count", "geography", "method", "source"]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)
    print(f"Wrote {OUT} ({len(rows)} years, {rows[0]['year']}-{rows[-1]['year']})")
    for r in rows:
        if r["year"] in (2008, 2015, 2017, 2020, 2021, 2023):
            print(f"  {r['year']}: {r['smoke_pm25_ug_m3']} µg/m³ (n={r['county_count']})")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--local", action="store_true", help="Aggregate from cached county CSV only")
    parser.add_argument("--county", type=Path, help="Path to county daily CSV")
    parser.add_argument(
        "--download",
        action="store_true",
        help="Attempt full Dropbox folder zip download (large; may timeout)",
    )
    args = parser.parse_args()
    if args.download and not args.local:
        try_download_folder_zip()
        print(
            "Zip downloaded; unzip and place the county daily CSV under data/smoke-source/, "
            "then re-run with --local.",
            file=sys.stderr,
        )
        return
    county = find_county_csv(args.county)
    print(f"Using {county} ({county.stat().st_size} bytes)")
    write_rows(aggregate(county))


if __name__ == "__main__":
    main()
