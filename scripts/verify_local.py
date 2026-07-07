#!/usr/bin/env python3
"""Quick local preview checks before opening the viz in a browser."""

from __future__ import annotations

import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "http://localhost:8000"
PATHS = [
    "index.html",
    "js/datasets.js",
    "js/charts.js",
    "js/app.js",
    "data/wildfire-data.csv",
    "data/vpd-annual.csv",
]


def check_files() -> list[str]:
    errors: list[str] = []
    for rel in PATHS:
        p = ROOT / rel
        if not p.is_file():
            errors.append(f"Missing file: {rel}")
    return errors


def check_server() -> list[str]:
    errors: list[str] = []
    for rel in PATHS:
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
    print("FILE CHECK: OK (all required paths present)")

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
