#!/usr/bin/env python3
"""Compute Southeast Jan-May mean Keetch-Byram Drought Index (KBDI) from gridMET.

gridMET does not publish KBDI. This script builds a regional series from daily
maximum temperature (tmmx) and precipitation (pr) for the same SE bbox used by
south VPD/ERC/fm100 (lon -106..-81, lat 25..36).

KBDI is the classic Southern Area drought / deep-drying index (0 = saturated top
soil, 800 = extremely dry). Daily updates follow the common NFDRS-adjunct form
of Keetch & Byram (1968): net rain after 0.2 inch interception reduces KBDI;
a temperature- and mean-annual-precip-dependent drought factor then increases it.

Season: Jan-May mean of daily regional KBDI (southern-relevant; not western May-Sep).
Output: data/south-kbdi-annual.csv
"""

from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
import xarray as xr

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "data" / "south-kbdi-annual.csv"

LON_MIN, LON_MAX = -106, -81
LAT_MIN, LAT_MAX = 25, 36

TMMX_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/tmmx/tmmx_{year}.nc"
PR_URL = "http://thredds.northwestknowledge.net/thredds/dodsC/MET/pr/pr_{year}.nc"
TMMX_VAR = "air_temperature"
PR_VAR = "precipitation_amount"

# KBDI is 0-800 (hundredths of an inch of moisture deficit in the top ~8 in of soil)
KBDI_MIN, KBDI_MAX = 0.0, 800.0


def _spatial_daily_mean(da: xr.DataArray) -> np.ndarray:
    subset = da.sel(
        lon=slice(LON_MIN, LON_MAX),
        lat=slice(LAT_MAX, LAT_MIN),
    )
    daily = subset.mean(dim=("lat", "lon"), skipna=True)
    return np.asarray(daily.values, dtype=float)


def fetch_year_daily(year: int) -> tuple[np.ndarray, np.ndarray]:
    """Return daily tmax °F and precip inches for the SE bbox."""
    ds_t = xr.open_dataset(TMMX_URL.format(year=year), decode_times=True)
    ds_p = xr.open_dataset(PR_URL.format(year=year), decode_times=True)
    try:
        tmax_k = _spatial_daily_mean(ds_t[TMMX_VAR])
        pr_mm = _spatial_daily_mean(ds_p[PR_VAR])
    finally:
        ds_t.close()
        ds_p.close()
    tmax_f = tmax_k * 9.0 / 5.0 - 459.67  # Kelvin -> Fahrenheit
    precip_in = pr_mm / 25.4
    if len(tmax_f) != len(precip_in):
        raise ValueError(f"{year}: tmax days {len(tmax_f)} != precip days {len(precip_in)}")
    return tmax_f, precip_in


def mean_annual_precip_inches(sample_years: list[int]) -> float:
    """Climatological mean annual precip (inches) for drought-factor denominator."""
    totals = []
    for year in sample_years:
        print(f"  annual precip {year}...", flush=True)
        _, precip_in = fetch_year_daily(year)
        totals.append(float(np.nansum(precip_in)))
    return float(np.mean(totals))


def update_kbdi(kbdi: float, precip_in: float, tmax_f: float, annual_precip_in: float) -> float:
    """One-day KBDI update (0-800)."""
    if not np.isfinite(precip_in):
        precip_in = 0.0
    if not np.isfinite(tmax_f):
        return kbdi
    net = precip_in - 0.2 if precip_in > 0.2 else 0.0
    kbdi = max(KBDI_MIN, kbdi - net * 100.0)
    # Drought factor (NFDRS-adjunct form of Keetch & Byram)
    numerator = (800.0 - kbdi) * (0.968 * math.exp(0.0486 * tmax_f) - 8.30)
    denominator = 1.0 + 10.88 * math.exp(-0.0441 * annual_precip_in)
    d_q = (numerator / denominator) * 0.001
    if d_q < 0:
        d_q = 0.0
    kbdi = min(KBDI_MAX, kbdi + d_q)
    return kbdi


def run_kbdi_series(
    years: list[int],
    annual_precip_in: float,
    spinup_year: int,
) -> dict[int, float]:
    """Continuous daily KBDI; return Jan-May mean by calendar year."""
    # Spin up through spinup_year so Jan of first analysis year is not cold-started at 0
    all_years = [spinup_year] + [y for y in years if y != spinup_year]
    kbdi = 0.0
    jan_may_means: dict[int, float] = {}

    for year in all_years:
        print(f"Fetching {year} south KBDI inputs (tmmx + pr)...", flush=True)
        tmax_f, precip_in = fetch_year_daily(year)
        # day-of-year index: assume calendar order from Jan 1
        jan_may_vals = []
        for i, (t, p) in enumerate(zip(tmax_f, precip_in)):
            kbdi = update_kbdi(kbdi, float(p), float(t), annual_precip_in)
            # Jan-May ≈ first 151 days (non-leap) / 152 (leap); use month via cumulative
            # Safer: use day index with leap awareness via numpy datetime if needed.
            # gridMET day coordinate is calendar; index 0 = Jan 1.
            # May 31 is day 151 (0-based) in non-leap, 152 in leap.
            import calendar
            may31 = 151 if calendar.isleap(year) else 150  # 0-based last day of May
            if i <= may31:
                jan_may_vals.append(kbdi)
        if year in years and jan_may_vals:
            mean_val = float(np.mean(jan_may_vals))
            if not (KBDI_MIN <= mean_val <= KBDI_MAX):
                raise ValueError(f"{year}: KBDI mean {mean_val:.1f} outside 0-800")
            jan_may_means[year] = round(mean_val, 1)
            print(f"  {year}: Jan-May mean KBDI {jan_may_means[year]}", flush=True)
    return jan_may_means


def load_existing(path: Path) -> dict[int, float]:
    if not path.exists():
        return {}
    rows: dict[int, float] = {}
    for line in path.read_text().strip().splitlines()[1:]:
        parts = line.split(",")
        if len(parts) >= 2 and parts[1]:
            rows[int(parts[0])] = float(parts[1])
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", type=int, default=2010)
    parser.add_argument("--end", type=int, default=2025)
    parser.add_argument(
        "--annual-precip-inches",
        type=float,
        default=None,
        help="Override mean annual precip (inches) for drought factor; default = mean of sample years",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Recompute even if CSV years already present",
    )
    args = parser.parse_args()

    existing = {} if args.force else load_existing(OUTPUT)
    needed = [y for y in range(args.start, args.end + 1) if y not in existing]
    if not needed and existing:
        print(f"{OUTPUT} already has {args.start}-{args.end}; use --force to recompute")
        return

    if args.annual_precip_inches is not None:
        r_ann = args.annual_precip_inches
        print(f"Using provided mean annual precip R = {r_ann:.2f} in", flush=True)
    else:
        sample = [2010, 2015, 2020]
        print(
            f"Computing SE bbox mean annual precip from sample years {sample} for KBDI drought factor...",
            flush=True,
        )
        r_ann = mean_annual_precip_inches(sample)
        print(f"  R = {r_ann:.2f} inches", flush=True)

    # Always recompute continuous series for the requested window when any year missing
    years = list(range(args.start, args.end + 1))
    spinup = args.start - 1
    means = run_kbdi_series(years, r_ann, spinup_year=spinup)
    existing.update(means)

    lines = ["year,kbdi"]
    for y in sorted(existing):
        if args.start <= y <= args.end:
            lines.append(f"{y},{existing[y]:.1f}")
    OUTPUT.write_text("\n".join(lines) + "\n")
    print(f"Wrote {OUTPUT} ({args.start}-{args.end}); R={r_ann:.2f} in; Jan-May mean KBDI")
    meta = ROOT / "data" / "south-kbdi-notes.md"
    # notes written separately by caller or keep a short stamp file
    stamp = ROOT / "data" / "south-kbdi-build-stamp.txt"
    stamp.write_text(
        f"R_inches={r_ann:.4f}\nseason=Jan-May\nbbox=lon[{LON_MIN},{LON_MAX}] lat[{LAT_MIN},{LAT_MAX}]\n"
        f"years={args.start}-{args.end}\nsource=gridMET tmmx+pr Keetch-Byram daily\n"
    )


if __name__ == "__main__":
    main()
