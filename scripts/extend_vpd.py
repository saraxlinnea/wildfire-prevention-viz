#!/usr/bin/env python3
"""Extend western fire-season VPD annual averages via gridMET OPeNDAP."""

import argparse
from pathlib import Path

import xarray as xr

YEARS_DEFAULT = list(range(1979, 2026))
LON_MIN, LON_MAX = -125, -100
LAT_MIN, LAT_MAX = 25, 50
BASE_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/vpd_{year}.nc"
VPD_VAR = "mean_vapor_pressure_deficit"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "vpd-annual.csv"


def fetch_seasonal_vpd(year: int) -> float:
    url = BASE_URL.format(year=year)
    ds = xr.open_dataset(url, decode_times=True)
    subset = ds[VPD_VAR].sel(
        lon=slice(LON_MIN, LON_MAX),
        lat=slice(LAT_MAX, LAT_MIN),
        day=slice(f"{year}-05-01", f"{year}-09-30"),
    )
    value = round(float(subset.mean(skipna=True).values), 3)
    ds.close()
    if not (1.0 <= value <= 2.5):
        raise ValueError(f"{year}: VPD {value} kPa outside expected range 1.0-2.5 (possible bad OPeNDAP read)")
    return value


def load_existing(path: Path) -> dict[int, float]:
    if not path.exists():
        return {}
    rows = {}
    for line in path.read_text().strip().splitlines()[1:]:
        year, value = line.split(",")
        rows[int(year)] = float(value)
    return rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=1979)
    parser.add_argument("--end", type=int, default=2025)
    args = parser.parse_args()

    existing = load_existing(OUTPUT)
    years = [y for y in range(args.start, args.end + 1) if y not in existing]

    for year in years:
        print(f"Fetching {year}...", flush=True)
        existing[year] = fetch_seasonal_vpd(year)
        print(f"  {year}: {existing[year]}", flush=True)

    lines = ["year,vpd_kpa"] + [f"{y},{existing[y]:.3f}" for y in sorted(existing)]
    OUTPUT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT} ({min(existing)}-{max(existing)})")


if __name__ == "__main__":
    main()
