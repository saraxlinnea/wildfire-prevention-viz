#!/usr/bin/env python3
"""Fetch NWS regional DSCI annual averages from USDM API.

Outputs per-region CSVs (eastern, southern, alaska) and a merged
`regional-dsci-annual.csv` that includes western DSCI from
`dsci-western-annual.csv` (aoi=WR).
"""

from __future__ import annotations

import argparse
import csv
import io
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SOURCE_DIR = DATA / "dsci-source"
WEST_PATH = DATA / "dsci-western-annual.csv"

FULL_YEARS = list(range(2000, 2026))
PARTIAL_YEAR = 2026
PARTIAL_END = "8/4/2026"

REGIONS = {
    "eastern": {"aoi": "ER", "out": DATA / "dsci-eastern-annual.csv"},
    "southern": {"aoi": "SR", "out": DATA / "dsci-southern-annual.csv"},
    "alaska": {"aoi": "AR", "out": DATA / "dsci-alaska-annual.csv"},
}

API = (
    "https://usdmdataservices.unl.edu/api/NWSRegionStatistics/GetDSCI"
    "?aoi={aoi}&startdate=1/1/{year}&enddate=12/31/{year}"
)
PARTIAL_API = (
    "https://usdmdataservices.unl.edu/api/NWSRegionStatistics/GetDSCI"
    f"?aoi={{aoi}}&startdate=1/1/{PARTIAL_YEAR}&enddate={PARTIAL_END}"
)


def download_csv(url: str) -> str:
    result = subprocess.run(
        ["curl", "-fsS", url],
        capture_output=True,
        text=True,
        check=True,
        timeout=90,
    )
    return result.stdout


def annual_avg_from_csv(text: str, year: int) -> tuple[float | None, int]:
    rows = list(csv.DictReader(io.StringIO(text)))
    vals = [int(r["DSCI"]) for r in rows if r["MapDate"].startswith(str(year))]
    if not vals:
        return None, 0
    return round(sum(vals) / len(vals), 1), len(vals)


def fetch_region(name: str, aoi: str, out_path: Path) -> list[dict]:
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    records: list[dict] = []
    source_label = f"USDM API NWSRegionStatistics GetDSCI aoi={aoi}"

    for year in FULL_YEARS:
        url = API.format(aoi=aoi, year=year)
        try:
            text = download_csv(url)
            (SOURCE_DIR / f"dsci-{name}-{year}.csv").write_text(text)
            avg, weeks = annual_avg_from_csv(text, year)
            records.append(
                {
                    "year": year,
                    "weeks": weeks,
                    "dsci_avg": avg,
                    "partial": False,
                    "source": source_label,
                }
            )
            print(f"  {name} {year}: {avg} ({weeks} weeks)")
        except Exception as exc:
            print(f"  {name} {year}: FAILED: {exc}", file=sys.stderr)
            records.append(
                {
                    "year": year,
                    "weeks": 0,
                    "dsci_avg": None,
                    "partial": False,
                    "source": "FAILED",
                }
            )

    try:
        url = PARTIAL_API.format(aoi=aoi)
        text = download_csv(url)
        (SOURCE_DIR / f"dsci-{name}-{PARTIAL_YEAR}-partial.csv").write_text(text)
        avg, weeks = annual_avg_from_csv(text, PARTIAL_YEAR)
        records.append(
            {
                "year": PARTIAL_YEAR,
                "weeks": weeks,
                "dsci_avg": avg,
                "partial": True,
                "source": f"USDM API partial through {PARTIAL_END}",
            }
        )
        print(f"  {name} {PARTIAL_YEAR} partial: {avg} ({weeks} weeks)")
    except Exception as exc:
        print(f"  {name} {PARTIAL_YEAR} partial: FAILED: {exc}", file=sys.stderr)

    fieldnames = ["year", "weeks", "dsci_avg", "partial", "source"]
    with out_path.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)

    print(f"Wrote {out_path}")
    return records


def load_western() -> dict[int, dict]:
    if not WEST_PATH.exists():
        raise FileNotFoundError(f"Missing {WEST_PATH}; run verify-dsci notebook first")
    west: dict[int, dict] = {}
    with WEST_PATH.open() as fh:
        for row in csv.DictReader(fh):
            year = int(row["year"])
            west[year] = {
                "dsci_avg": float(row["dsci_avg"]) if row["dsci_avg"] else None,
                "partial": str(row["partial"]).lower() == "true",
                "weeks": int(row["weeks"]) if row["weeks"] else 0,
            }
    return west


def build_merged() -> None:
    west = load_western()
    east_rows = {int(r["year"]): r for r in csv.DictReader(REGIONS["eastern"]["out"].open())}
    south_rows = {int(r["year"]): r for r in csv.DictReader(REGIONS["southern"]["out"].open())}
    alaska_rows = {int(r["year"]): r for r in csv.DictReader(REGIONS["alaska"]["out"].open())}

    years = sorted(set(west) | set(east_rows) | set(south_rows) | set(alaska_rows))
    out_path = DATA / "regional-dsci-annual.csv"
    fieldnames = [
        "year",
        "west_dsci",
        "east_dsci",
        "south_dsci",
        "alaska_dsci",
        "west_partial",
        "east_partial",
        "south_partial",
        "alaska_partial",
        "source",
    ]

    with out_path.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for year in years:
            w = west.get(year, {})
            e = east_rows.get(year, {})
            s = south_rows.get(year, {})
            a = alaska_rows.get(year, {})
            writer.writerow(
                {
                    "year": year,
                    "west_dsci": w.get("dsci_avg", ""),
                    "east_dsci": e.get("dsci_avg", ""),
                    "south_dsci": s.get("dsci_avg", ""),
                    "alaska_dsci": a.get("dsci_avg", ""),
                    "west_partial": w.get("partial", False),
                    "east_partial": str(e.get("partial", "")).lower() == "true",
                    "south_partial": str(s.get("partial", "")).lower() == "true",
                    "alaska_partial": str(a.get("partial", "")).lower() == "true",
                    "source": "USDM NWSRegionStatistics GetDSCI WR/ER/SR/AR",
                }
            )

    print(f"Wrote {out_path}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--merge-only",
        action="store_true",
        help="Rebuild regional-dsci-annual.csv from existing per-region files",
    )
    args = parser.parse_args()

    if args.merge_only:
        build_merged()
        return 0

    for name, spec in REGIONS.items():
        print(f"Fetching {name} (aoi={spec['aoi']})...")
        fetch_region(name, spec["aoi"], spec["out"])

    build_merged()
    return 0


if __name__ == "__main__":
    sys.exit(main())
