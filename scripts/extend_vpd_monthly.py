#!/usr/bin/env python3
"""Western May and spring (Mar-May) mean VPD from gridMET OPeNDAP.

Output: data/vpd-monthly-annual.csv (year, vpd_kpa_may, vpd_kpa_mar_may)

Fire-season May-Sep mean is in vpd-annual.csv; do not duplicate here.
"""

import argparse
from pathlib import Path

import xarray as xr

LON_MIN, LON_MAX = -125, -100
LAT_MIN, LAT_MAX = 25, 50
BASE_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/vpd_{year}.nc"
VPD_VAR = "mean_vapor_pressure_deficit"
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "vpd-monthly-annual.csv"


def fetch_means(year: int) -> tuple[float, float]:
    url = BASE_URL.format(year=year)
    ds = xr.open_dataset(url, decode_times=True)
    base = ds[VPD_VAR].sel(
        lon=slice(LON_MIN, LON_MAX),
        lat=slice(LAT_MAX, LAT_MIN),
    )
    may = base.sel(day=slice(f"{year}-05-01", f"{year}-05-31"))
    spring = base.sel(day=slice(f"{year}-03-01", f"{year}-05-31"))
    may_val = round(float(may.mean(skipna=True).values), 4)
    spring_val = round(float(spring.mean(skipna=True).values), 4)
    ds.close()
    for label, val in (("May", may_val), ("Mar-May", spring_val)):
        if not (0.5 <= val <= 3.0):
            raise ValueError(f"{year} {label}: VPD {val} kPa outside sanity range 0.5-3.0")
    return may_val, spring_val


def load_existing(path: Path) -> dict[int, tuple[float, float]]:
    if not path.exists():
        return {}
    rows: dict[int, tuple[float, float]] = {}
    for line in path.read_text().strip().splitlines()[1:]:
        parts = line.split(",")
        if len(parts) < 3:
            continue
        year = int(parts[0])
        rows[year] = (float(parts[1]), float(parts[2]))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=2010)
    parser.add_argument("--end", type=int, default=2025)
    args = parser.parse_args()

    existing = load_existing(OUTPUT)
    years = [y for y in range(args.start, args.end + 1) if y not in existing]

    for year in years:
        print(f"Fetching {year}...", flush=True)
        existing[year] = fetch_means(year)
        print(f"  May={existing[year][0]:.4f}  Mar-May={existing[year][1]:.4f}", flush=True)

    lines = ["year,vpd_kpa_may,vpd_kpa_mar_may"]
    for y in sorted(existing):
        may, spring = existing[y]
        lines.append(f"{y},{may:.4f},{spring:.4f}")
    OUTPUT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT} ({min(existing)}-{max(existing)}, {len(existing)} years)")


if __name__ == "__main__":
    main()
