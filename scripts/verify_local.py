#!/usr/bin/env python3
"""Quick local preview checks before opening the viz in a browser."""

from __future__ import annotations

import csv
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "http://localhost:8000"

STATIC_PATHS = [
    "index.html",
    "explore.html",
    "js/datasets.js",
    "js/charts.js",
    "js/app.js",
    "js/home.js",
    "js/wfigs-map.js",
    "js/guide.js",
]

# Boot CSVs loaded by js/app.js Promise.all (min data rows after parse)
BOOT_CSVS: list[tuple[str, str, int, bool]] = [
    ("data/wildfire-data.csv", "year", 40, True),  # skip metadata row 2
    ("data/vpd-annual.csv", "year", 40, False),
    ("data/erc-annual.csv", "year", 40, False),
    ("data/regional-acres-annual.csv", "year", 18, False),
    ("data/hfr-prevention-annual.csv", "fiscal_year", 19, False),
    ("data/vpd-monthly-annual.csv", "year", 14, False),
    ("data/smoke-pm25-annual.csv", "year", 18, False),
    ("data/smoke-pm25-v1-annual.csv", "year", 15, False),
    ("data/smoke-pm25-v2-beta-annual.csv", "year", 18, False),
]

# Non-year table CSVs required by js/app.js boot
BOOT_TABLE_CSVS: list[tuple[str, int]] = [
    ("data/correlation-sensitivity.csv", 5),
    ("data/correlation-partial.csv", 6),
    ("data/westerling-snowmelt-tercile.csv", 3),
    ("data/correlation-treatment-partial.csv", 7),
]

# Soft-fail optional at page boot (panels hide if missing)
OPTIONAL_CSVS: list[tuple[str, int]] = [
    ("data/ignition-cause-annual.csv", 4),
    ("data/suppression-cost-annual.csv", 30),
    ("data/structures-destroyed-annual.csv", 10),
]


def count_csv_rows(path: Path, year_col: str, skip_metadata: bool) -> int:
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        n = 0
        for i, row in enumerate(reader, start=2):
            if skip_metadata and i == 2:
                continue
            val = (row.get(year_col) or "").strip()
            if re.fullmatch(r"\d{4}", val):
                n += 1
    return n


def check_files() -> list[str]:
    errors: list[str] = []
    for rel in STATIC_PATHS:
        if not (ROOT / rel).is_file():
            errors.append(f"Missing file: {rel}")
    for rel, year_col, min_rows, skip_meta in BOOT_CSVS:
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"Missing boot CSV: {rel}")
            continue
        n = count_csv_rows(path, year_col, skip_meta)
        if n < min_rows:
            errors.append(f"{rel}: expected >={min_rows} {year_col} rows, got {n}")
    for rel, min_rows in BOOT_TABLE_CSVS:
        path = ROOT / rel
        if not path.is_file():
            errors.append(f"Missing boot CSV: {rel}")
            continue
        with path.open(newline="", encoding="utf-8") as f:
            n = sum(1 for _ in csv.DictReader(f))
        if n < min_rows:
            errors.append(f"{rel}: expected >={min_rows} data rows, got {n}")
    return errors


def check_server() -> list[str]:
    errors: list[str] = []
    paths = STATIC_PATHS + [rel for rel, _, _, _ in BOOT_CSVS]
    for rel in paths:
        url = f"{BASE}/{rel}"
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status != 200:
                    errors.append(f"{url} returned HTTP {resp.status}")
        except urllib.error.URLError as e:
            errors.append(f"Cannot reach {url} ({e.reason}). Start server: python3 -m http.server 8000")
            break
    return errors


def main() -> int:
    print(f"Project root: {ROOT}\n")

    file_errors = check_files()
    if file_errors:
        print("FILE CHECK: FAIL")
        for e in file_errors:
            print(f"  - {e}")
        return 1
    print("FILE CHECK: OK (static assets + boot CSV row counts)")
    for rel, year_col, min_rows, _ in BOOT_CSVS:
        n = count_csv_rows(ROOT / rel, year_col, rel.endswith("wildfire-data.csv"))
        print(f"  - {rel}: {n} rows ({year_col})")
    for rel, min_rows in BOOT_TABLE_CSVS:
        with (ROOT / rel).open(newline="", encoding="utf-8") as f:
            n = sum(1 for _ in csv.DictReader(f))
        print(f"  - {rel}: {n} data rows [OK]")
    for rel, min_rows in OPTIONAL_CSVS:
        path = ROOT / rel
        if path.is_file():
            with path.open(newline="", encoding="utf-8") as f:
                n = sum(1 for _ in csv.DictReader(f))
            status = "OK" if n >= min_rows else f"WARN (expected >={min_rows}, got {n})"
            print(f"  - {rel}: {n} data rows [{status}, optional]")
        else:
            print(f"  - {rel}: missing [optional]")

    server_errors = check_server()
    if server_errors:
        print("\nSERVER CHECK: not running")
        for e in server_errors:
            print(f"  - {e}")
        print("\nRun from project root:")
        print('  cd "' + str(ROOT) + '"')
        print("  python3 -m http.server 8000")
        print("Then open http://localhost:8000/ (not file://)")
        return 0

    print(f"\nSERVER CHECK: OK ({BASE})")
    print("Open http://localhost:8000/ in your browser.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
