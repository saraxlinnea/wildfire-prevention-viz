#!/usr/bin/env python3
"""Extract federal hazardous fuels treatment acres from HFR-DOI-FS joint report.

Source: USDA Forest Service & DOI, Hazardous Fuels Reduction and Landscape
Restoration Accomplishments Fiscal Years (FY) 2003-2021 (NFPORS-based totals).

Output: data/hfr-prevention-annual.csv
"""

from __future__ import annotations

import argparse
import csv
import re
import subprocess
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "data" / "hfr-source" / "HFR-DOI-FS-Accomplishments2003-2021.pdf"
PDF_URL = (
    "https://www.forestsandrangelands.gov/documents/resources/reports/2021/"
    "HFR-DOI-FS-Accomplishments2003-2021.pdf"
)
OUT_CSV = ROOT / "data" / "hfr-prevention-annual.csv"
OUT_NOTES = ROOT / "data" / "hfr-prevention-notes.md"

FIELDNAMES = [
    "fiscal_year",
    "fs_treatment_acres",
    "doi_treatment_acres",
    "combined_treatment_acres",
    "fs_wui_acres",
    "fs_non_wui_acres",
    "doi_wui_acres",
    "doi_non_wui_acres",
    "source",
]


def download_pdf(dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["curl", "-fsSL", "-o", str(dest), PDF_URL],
        check=True,
        timeout=120,
    )


def parse_int(value: str | None) -> int | None:
    if not value:
        return None
    cleaned = str(value).replace(",", "").strip()
    if not cleaned or not cleaned.isdigit():
        return None
    return int(cleaned)


def extract_from_pdf(pdf_path: Path) -> list[dict]:
    records: list[dict] = []
    current_year: int | None = None
    pending_fs: dict[str, int | None] | None = None
    pending_year: int | None = None

    with pdfplumber.open(pdf_path) as doc:
        for page in doc.pages:
            for table in page.extract_tables() or []:
                for row in table:
                    cells = [str(c or "").strip() for c in row]
                    if not any(cells):
                        continue

                    year_match = re.fullmatch(r"20\d{2}", cells[0])
                    if year_match:
                        current_year = int(year_match.group(0))

                    agency = cells[1] if len(cells) > 1 else ""
                    if agency == "FS" and current_year is None:
                        # First FY block: FS row precedes year label on DOI row (2003).
                        pending_fs = {
                            "fs_wui_acres": parse_int(cells[2]) if len(cells) > 2 else None,
                            "fs_non_wui_acres": parse_int(cells[3]) if len(cells) > 3 else None,
                            "fs_treatment_acres": parse_int(cells[-1]),
                        }
                        pending_year = 2003
                        continue

                    if current_year is None and not pending_fs:
                        continue

                    year = current_year if current_year is not None else pending_year

                    if agency == "FS":
                        pending_fs = {
                            "fs_wui_acres": parse_int(cells[2]) if len(cells) > 2 else None,
                            "fs_non_wui_acres": parse_int(cells[3]) if len(cells) > 3 else None,
                            "fs_treatment_acres": parse_int(cells[-1]),
                        }
                    elif agency == "DOI" and pending_fs is not None and year is not None:
                        record = {
                            "fiscal_year": year,
                            "fs_treatment_acres": pending_fs["fs_treatment_acres"],
                            "doi_treatment_acres": parse_int(cells[-1]),
                            "combined_treatment_acres": None,
                            "fs_wui_acres": pending_fs["fs_wui_acres"],
                            "fs_non_wui_acres": pending_fs["fs_non_wui_acres"],
                            "doi_wui_acres": parse_int(cells[2]) if len(cells) > 2 else None,
                            "doi_non_wui_acres": parse_int(cells[3]) if len(cells) > 3 else None,
                            "source": "HFR-DOI-FS Accomplishments FY 2003-2021 (NFPORS)",
                        }
                        if record["fs_treatment_acres"] is not None and record["doi_treatment_acres"] is not None:
                            record["combined_treatment_acres"] = (
                                record["fs_treatment_acres"] + record["doi_treatment_acres"]
                            )
                        records.append(record)
                        pending_fs = None
                        pending_year = None
                        current_year = None
                    elif agency == "Total" and records and records[-1]["fiscal_year"] == year:
                        total_treatment = parse_int(cells[-1])
                        if total_treatment is not None:
                            records[-1]["combined_treatment_acres"] = total_treatment

    # De-duplicate by fiscal year (keep last; table spans two pages)
    by_year: dict[int, dict] = {}
    for row in records:
        by_year[int(row["fiscal_year"])] = row
    return [by_year[y] for y in sorted(by_year)]


def write_notes(rows: list[dict]) -> None:
    notes = f"""# HFR prevention notes (FY 2003-2021)

Repository research artifact. **Not on the live page** (methodology differs from NPR FS 2023-2025 and DOI 2018-2024 series).

## Source

- PDF: `data/hfr-source/HFR-DOI-FS-Accomplishments2003-2021.pdf`
- USDA Forest Service & Department of the Interior joint report (NFPORS)
- `scripts/extract_hfr_prevention.py`

## Fields

- `fs_treatment_acres`, `doi_treatment_acres`: agency rows, **Total - Treatment Types** column
- `combined_treatment_acres`: FS + DOI treatment totals (report Total row when present)
- WUI / Non-WUI columns: designation acres from the same table (not the same as treatment-type totals)

## Limitations

- **Fiscal year** (Oct 1 start), not calendar year. Do not align directly with NIFC burn acres without lag notes.
- Definitions changed across years (see report footnotes for FY2006-2009 vs FY2013+).
- Overlaps conceptually with `interior_treatment_millions` (DOI, 2018-2024) and `fs_treatment_millions` (FS, 2023-2025) in `wildfire-data.csv` but those page series use different publishers/methods.
- Exploratory / policy context only. Not causal evidence for fire outcomes.

## Window

- **{rows[0]['fiscal_year']}-{rows[-1]['fiscal_year']}** (n = {len(rows)} fiscal years)

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
```
"""
    OUT_NOTES.write_text(notes)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="Fetch PDF before extract")
    args = parser.parse_args()

    if args.download or not PDF_PATH.exists():
        print(f"Downloading {PDF_URL}...")
        download_pdf(PDF_PATH)

    rows = extract_from_pdf(PDF_PATH)
    if not rows:
        raise SystemExit(f"No rows extracted from {PDF_PATH}")

    with OUT_CSV.open("w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    write_notes(rows)
    print(f"Wrote {OUT_CSV} ({rows[0]['fiscal_year']}-{rows[-1]['fiscal_year']}, n={len(rows)})")
    print(f"Wrote {OUT_NOTES}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
