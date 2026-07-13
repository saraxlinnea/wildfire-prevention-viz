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
    "js/datasets.js",
    "js/charts.js",
    "js/app.js",
]

# Boot CSVs loaded by js/app.js Promise.all (min data rows after parse)
BOOT_CSVS: list[tuple[str, str, int, bool]] = [
    ("data/wildfire-data.csv", "year", 40, True),  # skip metadata row 2
    ("data/vpd-annual.csv", "year", 40, False),
    ("data/erc-annual.csv", "year", 40, False),
    ("data/regional-acres-annual.csv", "year", 18, False),
    ("data/hfr-prevention-annual.csv", "fiscal_year", 19, False),
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
