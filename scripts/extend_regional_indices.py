#!/usr/bin/env python3
"""Fetch regional fire-season VPD and ERC from gridMET OPeNDAP.

Regions (CONUS only; Alaska is outside gridMET coverage):
- west: May-Sep, west of 100°W (defaults copied from vpd-annual.csv / erc-annual.csv)
- south: Jan-Apr, Southeast/Gulf bbox (approx. SA GACC)
- east: Mar-Jun, Mid-Atlantic/Northeast bbox (approx. EA GACC)

Output: data/regional-gridmet-annual.csv
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

import xarray as xr

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUTPUT = DATA / "regional-gridmet-annual.csv"

VPD_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/vpd_{year}.nc"
ERC_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/erc/erc_{year}.nc"
VPD_VAR = "mean_vapor_pressure_deficit"
ERC_VAR = "energy_release_component-g"

REGIONS = {
    "west": {
        "lon_min": -125,
        "lon_max": -100,
        "lat_min": 25,
        "lat_max": 50,
        "season_start": "05-01",
        "season_end": "09-30",
        "vpd_range": (1.0, 2.5),
        "erc_range": (35.0, 85.0),
        "copy_from": {"vpd": DATA / "vpd-annual.csv", "erc": DATA / "erc-annual.csv"},
    },
    "south": {
        "lon_min": -106,
        "lon_max": -81,
        "lat_min": 25,
        "lat_max": 36,
        "season_start": "01-01",
        "season_end": "04-30",
        "vpd_range": (0.3, 1.5),
        "erc_range": (15.0, 55.0),
    },
    "east": {
        "lon_min": -90,
        "lon_max": -68,
        "lat_min": 37,
        "lat_max": 47,
        "season_start": "03-01",
        "season_end": "06-30",
        "vpd_range": (0.3, 1.2),
        "erc_range": (15.0, 55.0),
    },
}

COLUMNS = [
    "year",
    "west_vpd_kpa",
    "west_erc",
    "south_vpd_kpa",
    "south_erc",
    "east_vpd_kpa",
    "east_erc",
]


def load_copy_file(path: Path, value_col: str) -> dict[int, float]:
    rows: dict[int, float] = {}
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            rows[int(row["year"])] = float(row[value_col])
    return rows


def fetch_mean(year: int, region: str, metric: str) -> float:
    cfg = REGIONS[region]
    url = (VPD_URL if metric == "vpd" else ERC_URL).format(year=year)
    var = VPD_VAR if metric == "vpd" else ERC_VAR
    ds = xr.open_dataset(url, decode_times=True)
    subset = ds[var].sel(
        lon=slice(cfg["lon_min"], cfg["lon_max"]),
        lat=slice(cfg["lat_max"], cfg["lat_min"]),
        day=slice(f"{year}-{cfg['season_start']}", f"{year}-{cfg['season_end']}"),
    )
    value = float(subset.mean(skipna=True).values)
    ds.close()

    lo, hi = cfg[f"{metric}_range"]
    if not (lo <= value <= hi):
        raise ValueError(f"{year} {region} {metric}: {value} outside {lo}-{hi}")
    if metric == "vpd":
        return round(value, 3)
    return round(value, 2)


def load_existing(path: Path) -> dict[int, dict[str, float | str]]:
    if not path.exists():
        return {}
    out: dict[int, dict[str, float | str]] = {}
    with path.open(newline="") as f:
        for row in csv.DictReader(f):
            yr = int(row["year"])
            out[yr] = {k: row[k] for k in COLUMNS if k in row and row[k] != ""}
    return out


def fill_from_existing(data: dict[int, dict[str, float | str]], region: str) -> None:
    cfg = REGIONS[region]
    copies = cfg.get("copy_from")
    if not copies:
        return
    vpd = load_copy_file(copies["vpd"], "vpd_kpa")
    erc = load_copy_file(copies["erc"], "erc")
    for year, val in vpd.items():
        data.setdefault(year, {})[f"{region}_vpd_kpa"] = val
    for year, val in erc.items():
        data.setdefault(year, {})[f"{region}_erc"] = val


def write_output(data: dict[int, dict[str, float | str]]) -> None:
    lines = [",".join(COLUMNS)]
    for year in sorted(data):
        row = data[year]
        values = []
        for col in COLUMNS:
            if col == "year":
                values.append(str(year))
                continue
            val = row.get(col, "")
            if val == "":
                values.append("")
            elif col.endswith("_kpa"):
                values.append(f"{float(val):.3f}")
            elif col.endswith("_erc"):
                values.append(f"{float(val):.2f}")
            else:
                values.append(str(val))
        lines.append(",".join(values))
    OUTPUT.write_text("\n".join(lines) + "\n")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=2010)
    parser.add_argument("--end", type=int, default=2025)
    parser.add_argument(
        "--regions",
        nargs="+",
        choices=list(REGIONS.keys()),
        default=["west", "south", "east"],
    )
    parser.add_argument("--metric", choices=["vpd", "erc", "both"], default="both")
    args = parser.parse_args()

    data = load_existing(OUTPUT)

    if "west" in args.regions:
        fill_from_existing(data, "west")
        print("Copied west VPD/ERC from existing annual CSVs")

    metrics = ["vpd", "erc"] if args.metric == "both" else [args.metric]
    fetch_regions = [r for r in args.regions if "copy_from" not in REGIONS[r]]

    for year in range(args.start, args.end + 1):
        for region in fetch_regions:
            for metric in metrics:
                col = f"{region}_{metric}_kpa" if metric == "vpd" else f"{region}_erc"
                if col in data.get(year, {}):
                    continue
                print(f"Fetching {year} {region} {metric}...", flush=True)
                val = fetch_mean(year, region, metric)
                data.setdefault(year, {})[col] = val
                print(f"  {col}={val}", flush=True)

    # Merge with on-disk rows so partial runs do not wipe other regions.
    merged = load_existing(OUTPUT)
    for year, row in data.items():
        merged.setdefault(year, {}).update(row)
    write_output(merged)
    years = sorted(merged)
    print(f"Wrote {OUTPUT} ({years[0]}-{years[-1]})")


if __name__ == "__main__":
    main()
