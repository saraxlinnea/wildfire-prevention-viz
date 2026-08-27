#!/usr/bin/env python3
"""Extract national structures-destroyed totals from NICC annual report PDFs."""

from __future__ import annotations

import argparse
import csv
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "nicc-structures-source"
OUT = ROOT / "data" / "structures-destroyed-annual.csv"

BASE = "https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports"

URLS = {
    2005: f"{BASE}/2005/annual_report_2005_508.pdf",
    2006: f"{BASE}/2006/Annual_Report_2006.pdf",
    2007: f"{BASE}/2007/annual_report_2007_508.pdf",
    2008: f"{BASE}/2008/annual_report_2008_508.pdf",
    2009: f"{BASE}/2009/annual_report_2009_508.pdf",
    2010: f"{BASE}/2010/annual_report_2010_508.pdf",
    2011: f"{BASE}/2011/annual_report_2011_508.pdf",
    2012: f"{BASE}/2012/annual_report_2012_508.pdf",
    2013: f"{BASE}/2013/Annual_Report_2013_508.pdf",
    2014: f"{BASE}/2014/Annual_Report_2014_508.pdf",
    2015: f"{BASE}/2015/annual_report_2015_508.pdf",
    2016: f"{BASE}/2016/annual_report_2016_508.pdf",
    2017: f"{BASE}/2017/annual_report_2017_508_0.pdf",
    2018: f"{BASE}/2018/annual_report_%202018_508.pdf",
    2019: f"{BASE}/2019/annual_report_2019_508.pdf",
    2020: f"{BASE}/2020/annual_report_0.pdf",
    2021: f"{BASE}/2021/annual_report_0.pdf",
    2022: f"{BASE}/2022/annual_report.2.pdf",
    2023: f"{BASE}/2023/annual_report_2023_0.pdf",
    2024: f"{BASE}/2024/annual_report_2024.pdf",
    2025: f"{BASE}/2025/annual_report_2025_0.pdf",
}

# Hand-verified totals shipped on Impacts (PDF text often inserts spaces: "18, 385")
VERIFIED = {
    2014: (1953, 1038),
    2015: (4636, 2638),
    2016: (4312, 3192),
    2017: (12306, 8065),
    2018: (25790, 18137),
    2019: (963, 444),
    2020: (17904, 9630),
    2021: (5972, 3577),
    2022: (2717, 1261),
    2023: (4318, 3060),
    2024: (4552, 2406),
    2025: (18385, 12773),
}

# Extracted 2010-2013 with same "total of N structures were … destroyed" wording.
# Not shipped: bake-off acceptance required continuous series back to ≥2006; 2005-2009 PDFs
# lack extractable national structures totals in text (no TOC structures section).
EXTRACTED_PRE2014 = {
    2010: (788, 338),
    2011: (5246, 3459),
    2012: (4244, 2216),
    2013: (2135, 1093),
}


def download_pdfs() -> None:
    SRC.mkdir(parents=True, exist_ok=True)
    for year, url in URLS.items():
        path = SRC / f"annual_{year}.pdf"
        if path.exists() and path.stat().st_size > 1000:
            print(f"skip {path.name}")
            continue
        print(f"fetch {year} …")
        with urllib.request.urlopen(url, timeout=120) as resp:
            path.write_bytes(resp.read())
        print(f"  wrote {path} ({path.stat().st_size} bytes)")


def extract_total_from_pdf(year: int) -> int | None:
    try:
        from pypdf import PdfReader
    except ImportError:
        return None
    path = SRC / f"annual_{year}.pdf"
    if not path.exists():
        return None
    text = "\n".join((p.extract_text() or "") for p in PdfReader(str(path)).pages)
    m = re.search(
        r"total of\s+([\d,\s]+)\s+structures\s+wer",
        text,
        re.I,
    )
    if not m:
        return None
    return int(re.sub(r"[^\d]", "", m.group(1)))


def write_csv(*, include_pre2014: bool = False) -> None:
    series = dict(VERIFIED)
    if include_pre2014:
        series.update(EXTRACTED_PRE2014)
    rows = []
    for year in sorted(series):
        total, residences = series[year]
        extracted = extract_total_from_pdf(year)
        if extracted is not None and extracted != total:
            raise SystemExit(
                f"PDF extract {year}={extracted} != verified {total}; update VERIFIED after review"
            )
        note = "Undercount vs many county/state assessments; see structures-destroyed-notes.md"
        if year in EXTRACTED_PRE2014 and year not in VERIFIED:
            note = "Pre-2014 extract; shipped only with --include-pre2014. " + note
        rows.append(
            {
                "year": year,
                "structures_destroyed": total,
                "residences_destroyed": residences,
                "geography": "national",
                "definition": "NICC SIT/ICS-209 structures destroyed (all types)",
                "source_url": URLS[year],
                "notes": note,
            }
        )
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "year",
                "structures_destroyed",
                "residences_destroyed",
                "geography",
                "definition",
                "source_url",
                "notes",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {OUT} ({len(rows)} years)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--download", action="store_true", help="Fetch NICC annual PDFs")
    parser.add_argument(
        "--include-pre2014",
        action="store_true",
        help="Also write EXTRACTED_PRE2014 (2010-2013); default ship window stays 2014-2025",
    )
    parser.add_argument(
        "--probe-pre2014",
        action="store_true",
        help="Print PDF extract totals for 2005-2013 without rewriting CSV",
    )
    args = parser.parse_args()
    if args.download:
        download_pdfs()
    if args.probe_pre2014:
        for year in range(2005, 2014):
            got = extract_total_from_pdf(year)
            known = EXTRACTED_PRE2014.get(year)
            print(f"{year}: extract={got} known={known}")
        return
    write_csv(include_pre2014=args.include_pre2014)


if __name__ == "__main__":
    main()
