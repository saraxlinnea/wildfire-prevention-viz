#!/usr/bin/env python3
"""Fetch Southeast Jan-Apr mean 100-hour fuel moisture (fm100) from gridMET OPeNDAP.

Same bbox and season as south VPD/ERC in extend_regional_indices.py.
Lower fm100 = drier dead fuels. Output: data/south-fm100-annual.csv
"""

from __future__ import annotations

import argparse
from pathlib import Path

import xarray as xr

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "data" / "south-fm100-annual.csv"

FM100_URL = (
    "http://thredds.northwestknowledge.net/thredds/dodsC/"
    "agg_met_fm100_1979_CurrentYear_CONUS.nc"
)
FM100_VAR = "dead_fuel_moisture_100hr"

# Southeast / Gulf bbox (approx. SA GACC), Jan-Apr fire-season lead
LON_MIN, LON_MAX = -106, -81
LAT_MIN, LAT_MAX = 25, 36
FM100_MIN, FM100_MAX = 3.0, 35.0


def fetch_south_fm100(year: int) -> float:
    ds = xr.open_dataset(FM100_URL, decode_times=True)
    subset = ds[FM100_VAR].sel(
        lon=slice(LON_MIN, LON_MAX),
        lat=slice(LAT_MAX, LAT_MIN),
        day=slice(f"{year}-01-01", f"{year}-04-30"),
    )
    value = float(subset.mean(skipna=True).values)
    ds.close()
    if not (FM100_MIN <= value <= FM100_MAX):
        raise ValueError(
            f"{year}: fm100 {value:.2f}% outside expected range {FM100_MIN}-{FM100_MAX}"
        )
    return round(value, 2)


def load_existing(path: Path) -> dict[int, float]:
    if not path.exists():
        return {}
    rows: dict[int, float] = {}
    for line in path.read_text().strip().splitlines()[1:]:
        year, val = line.split(",")
        if val:
            rows[int(year)] = float(val)
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=2010)
    parser.add_argument("--end", type=int, default=2025)
    args = parser.parse_args()

    existing = load_existing(OUTPUT)
    for year in range(args.start, args.end + 1):
        if year in existing:
            continue
        print(f"Fetching {year} south fm100 (Jan-Apr)...", flush=True)
        existing[year] = fetch_south_fm100(year)
        print(f"  {year}: {existing[year]}%", flush=True)

    lines = ["year,fm100_pct"] + [
        f"{y},{existing[y]:.2f}" for y in sorted(existing) if args.start <= y <= args.end
    ]
    OUTPUT.write_text("\n".join(lines) + "\n")
    years = [y for y in sorted(existing) if args.start <= y <= args.end]
    print(f"Wrote {OUTPUT} ({years[0]}-{years[-1]})")


if __name__ == "__main__":
    main()
