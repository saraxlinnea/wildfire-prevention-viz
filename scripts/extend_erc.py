#!/usr/bin/env python3
"""Extend western fire-season ERC annual averages via gridMET OPeNDAP.

ERC (Energy Release Component) is a gridMET/NFDRS-style fire danger index (fuel model G).
Higher values indicate greater potential fire intensity. Same geography and season as VPD:
May-Sep, west of 100°W.
"""

import argparse
from pathlib import Path

import xarray as xr

LON_MIN, LON_MAX = -125, -100
LAT_MIN, LAT_MAX = 25, 50
BASE_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/erc/erc_{year}.nc"
ERC_VAR = "energy_release_component-g"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "erc-annual.csv"
ERC_MIN, ERC_MAX = 35.0, 85.0


def fetch_seasonal_erc(year: int) -> float:
    url = BASE_URL.format(year=year)
    ds = xr.open_dataset(url, decode_times=True)
    subset = ds[ERC_VAR].sel(
        lon=slice(LON_MIN, LON_MAX),
        lat=slice(LAT_MAX, LAT_MIN),
        day=slice(f"{year}-05-01", f"{year}-09-30"),
    )
    value = round(float(subset.mean(skipna=True).values), 2)
    ds.close()
    if not (ERC_MIN <= value <= ERC_MAX):
        raise ValueError(
            f"{year}: ERC {value} outside expected range {ERC_MIN}-{ERC_MAX} (possible bad OPeNDAP read)"
        )
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
        existing[year] = fetch_seasonal_erc(year)
        print(f"  {year}: {existing[year]}", flush=True)

    lines = ["year,erc"] + [f"{y},{existing[y]:.2f}" for y in sorted(existing)]
    OUTPUT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT} ({min(existing)}-{max(existing)})")


if __name__ == "__main__":
    main()
