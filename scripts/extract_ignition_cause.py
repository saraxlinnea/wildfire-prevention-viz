#!/usr/bin/env python3
"""Extract national lightning vs human caused acres from NICC annual report PDFs.

Parses text blocks "Number of Lightning/Human Caused Acres Burned" totals.
Outputs data/ignition-cause-annual.csv (2003-2012 where tables exist).
"""

from __future__ import annotations

import csv
import re
import statistics
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "nicc-source"
OUT = ROOT / "data" / "ignition-cause-annual.csv"
NOTES = ROOT / "data" / "ignition-cause-notes.md"

REPORTS = [
    (2003, SRC_DIR / "annual_report_2003_508.pdf"),
    (2004, SRC_DIR / "annual_report_2004_508.pdf"),
    (2005, SRC_DIR / "annual_report_2005_508.pdf"),
    (2006, SRC_DIR / "Annual_Report_2006.pdf"),
    (2007, SRC_DIR / "annual_report_2007_508.pdf"),
    (2008, SRC_DIR / "annual_report_2008_508.pdf"),
    (2009, SRC_DIR / "annual_report_2009_508.pdf"),
    (2010, SRC_DIR / "annual_report_2010_508.pdf"),
    (2011, SRC_DIR / "annual_report_2011_508.pdf"),
    (2012, SRC_DIR / "annual_report_2012_508.pdf"),
]

SECTIONS = {
    "lightning": [
        "Number of Lightning Caused Acres Burned",
        "Lightning Caused Acres Burned",
        "Lightning Caused Acres",
    ],
    "human": [
        "Number of Human Caused Acres Burned",
        "Human Caused Acres Burned",
        "Human Caused Acres",
    ],
}


def parse_total_acres_after_section(text: str, phrases: list[str]) -> int | None:
    for section in phrases:
        idx = text.find(section)
        if idx < 0:
            continue
        tail = text[idx + len(section) :]
        lines = [ln.strip() for ln in tail.split("\n") if ln.strip()]
        for i, line in enumerate(lines[:4]):
            if re.search(r"\bAK\b", line) and "Total" in line:
                if i + 1 < len(lines):
                    nums = [int(x.replace(",", "")) for x in re.findall(r"[\d,]+", lines[i + 1]) if x.replace(",", "").isdigit()]
                    if nums:
                        return nums[-1]
        for line in lines[:5]:
            nums = [int(x.replace(",", "")) for x in re.findall(r"[\d,]+", line) if x.replace(",", "").isdigit()]
            if len(nums) >= 8:
                return nums[-1]
    return None


def pdf_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    return "\n".join((p.extract_text() or "") for p in reader.pages)


def skip_reason(text: str, year: int) -> str | None:
    """Explain why a year cannot be extracted (documented gaps)."""
    if year == 2007:
        if "Lightning Caused Acres Burned by Geographic Area - 2007" in text:
            if "GACC AK NW" not in text and "TOTAL" not in text.split("Number of Lightning Caused Acres Burned")[1][:400]:
                return "percent-only cause tables (no GACC Total row in PDF text)"
    if year in (2008, 2009):
        if "Number of Lightning Caused Acres Burned" in text:
            tail = text.split("Number of Lightning Caused Acres Burned", 1)[1][:200]
            if not re.search(r"[\d,]{5,}", tail):
                return "cause acres table image-only (no numeric row in PDF text)"
    return None


def main() -> int:
    rows: list[dict] = []
    skipped: list[tuple[int, str]] = []
    for year, pdf in REPORTS:
        if not pdf.exists():
            print(f"Skip {year}: missing {pdf.name}")
            skipped.append((year, "missing PDF"))
            continue
        text = pdf_text(pdf)
        reason = skip_reason(text, year)
        lightning = parse_total_acres_after_section(text, SECTIONS["lightning"])
        human = parse_total_acres_after_section(text, SECTIONS["human"])
        if not lightning or not human:
            if not reason:
                reason = f"lightning={lightning} human={human}"
            print(f"Skip {year}: {reason}")
            skipped.append((year, reason))
            continue
        total = lightning + human
        rows.append({
            "year": year,
            "lightning_acres": lightning,
            "human_acres": human,
            "total_acres": total,
            "lightning_share": round(lightning / total, 4),
            "human_share": round(human / total, 4),
            "source_report": f"{pdf.name} (GACC total column)",
        })
        print(f"{year}: L={lightning:,} H={human:,} ({lightning/total:.1%} lightning)")

    if not rows:
        print("FAIL: no ignition cause rows extracted")
        return 1

    with OUT.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    med_l = statistics.median(r["lightning_share"] for r in rows)
    skip_lines = "\n".join(f"- **{y}:** {reason}" for y, reason in skipped) or "- None"
    NOTES.write_text(
        f"""# Ignition cause acres (exploratory)

National GACC **Total** column from NICC lightning vs human caused acres burned tables.

## Window

{rows[0]['year']}-{rows[-1]['year']}, n = {len(rows)} calendar years (non-contiguous)

## Median lightning share

{med_l:.1%}

## Skipped years

{skip_lines}

## Limitations

- **2007:** PDF text has percent-of-national cause tables only; no absolute GACC Total row (unlike 2003-2006).
- **2008-2009:** Cause acres tables are image-only in NICC PDFs (same class of gap as regional GACC extract).
- 2013+ reports in this repo lack the same text blocks; not included.
- GACC totals may differ from NIFC national acres series.
- Initial cause classification only.
- Not causal.

## Reproduce

```bash
python scripts/extract_ignition_cause.py
```
"""
    )
    print(f"Wrote {OUT} ({len(rows)} years)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
