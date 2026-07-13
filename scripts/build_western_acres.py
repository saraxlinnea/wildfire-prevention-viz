#!/usr/bin/env python3
"""Build regional and western U.S. acres burned from NICC annual report GACC tables.

Regional GACCs:
- Western (exclude AK, EA, SA): NW, NR, GB, RM, SW, NO, SO (EB+WB pre-2015 merge)
- Eastern: EA
- Southern: SA
- Alaska: AK
- National (GACC sum): all GACCs above when present in source table

Sources:
- 2003-2012: lightning + human caused acres by GACC (pdfplumber); all GACCs when present (EB/WB pre-GB merge)
- 2013-2025: text tables in NICC annual reports (prefer latest report per year)

Outputs:
- data/nicc-gacc-acres-source.csv
- data/western-acres-annual.csv
- data/regional-acres-annual.csv
"""

from __future__ import annotations

import csv
import re
from pathlib import Path

import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "nicc-source"
OUT_GACC = ROOT / "data" / "nicc-gacc-acres-source.csv"
OUT_WESTERN = ROOT / "data" / "western-acres-annual.csv"
OUT_REGIONAL = ROOT / "data" / "regional-acres-annual.csv"

WESTERN_MODERN = ["NW", "NR", "GB", "RM", "SW", "NO", "SO"]
WESTERN_LEGACY = ["NW", "NR", "EB", "WB", "RM", "SW", "NO", "SO"]
EASTERN_GACCS = ["EA"]
SOUTHERN_GACCS = ["SA"]
ALASKA_GACCS = ["AK"]
NATIONAL_GACCS = WESTERN_MODERN + EASTERN_GACCS + SOUTHERN_GACCS + ALASKA_GACCS
ALL_GACCS = NATIONAL_GACCS

# Report PDFs to parse (newer reports override overlapping years).
TEXT_REPORTS = [
    SRC_DIR / "annual_report_2023.pdf",
    SRC_DIR / "annual_report_2024.pdf",
    SRC_DIR / "annual_report_2025.pdf",
]

LEGACY_LIGHTNING_HUMAN = [
    (2003, SRC_DIR / "annual_report_2003_508.pdf", True),
    (2004, SRC_DIR / "annual_report_2004_508.pdf", True),
    (2005, SRC_DIR / "annual_report_2005_508.pdf", True),
    (2006, SRC_DIR / "Annual_Report_2006.pdf", True),
    (2007, SRC_DIR / "annual_report_2007_508.pdf", True),
    (2008, SRC_DIR / "annual_report_2008_508.pdf", True),
    (2009, SRC_DIR / "annual_report_2009_508.pdf", True),
    (2010, SRC_DIR / "annual_report_2010_508.pdf", True),
    (2011, SRC_DIR / "annual_report_2011_508.pdf", True),
    (2012, SRC_DIR / "annual_report_2012_508.pdf", True),
]


def _sum_gaccs(row: list[str], header: list[str], gaccs: list[str]) -> int:
    total = 0
    for h, v in zip(header, row):
        if h in gaccs and v:
            total += int(str(v).replace(",", ""))
    return total


def extract_text_table(pdf_path: Path) -> tuple[list[int], dict[str, dict[int, int]]]:
    reader = PdfReader(str(pdf_path))
    text = ""
    for page in reader.pages:
        t = page.extract_text() or ""
        if "AK Acres" in t:
            text += "\n" + t
    if not text:
        return [], {}

    ym = re.search(r"Fires/Acres\s+((?:20\d{2}\s+)+)", text)
    years = []
    seen = set()
    for y in re.findall(r"20\d{2}", ym.group(0) if ym else ""):
        if y not in seen:
            seen.add(y)
            years.append(int(y))

    data: dict[str, dict[int, int]] = {}
    for gacc in ALL_GACCS:
        m = re.search(rf"{gacc}\s+Acres\s+([\d,\s]+)", text)
        if not m:
            continue
        nums = [int(x.replace(",", "")) for x in re.findall(r"[\d,]+", m.group(1))]
        nums = nums[: len(years)]
        data[gacc] = dict(zip(years, nums))
    return years, data


def parse_acres_cell(value: str) -> int:
    """Parse NICC table cells; some legacy PDFs merge digits (e.g. '75,450 7')."""
    nums = [int(x.replace(",", "")) for x in re.findall(r"\d[\d,]*", str(value or ""))]
    return max(nums) if nums else 0


def gaccs_for_report(legacy: bool) -> list[str]:
    if legacy:
        return WESTERN_LEGACY + EASTERN_GACCS + SOUTHERN_GACCS + ALASKA_GACCS
    return ALL_GACCS


def extract_multiyear_text_gacc(pdf_path: Path, report_year: int) -> dict[str, int]:
    """Fallback: multi-year Fires/Acres text block (total wildfire acres by GACC)."""
    from pypdf import PdfReader

    gacc_order = ["AK", "EA", "EB", "NO", "NR", "NW", "RM", "SA", "SO", "SW", "WB"]
    text = "\n".join((p.extract_text() or "") for p in PdfReader(str(pdf_path)).pages)
    start = text.find("Fires/Acres")
    if start < 0:
        return {}
    block = text[start : start + 8000]
    ym = re.search(r"Fires/Acres\s+((?:19|20)\d{2}\s+)+", block)
    if not ym:
        return {}
    years = re.findall(r"(?:19|20)\d{2}", ym.group(0))
    if str(report_year) not in years:
        return {}
    col = years.index(str(report_year))
    out: dict[str, int] = {}
    for gacc in gacc_order:
        m = re.search(rf"\n{gacc}\s+Acres\s+([\d,\s]+)", block)
        if not m:
            continue
        nums = [int(x.replace(",", "")) for x in re.findall(r"[\d,]+", m.group(1))]
        if col < len(nums):
            out[gacc] = nums[col]
    return out


def extract_lightning_human(pdf_path: Path, legacy: bool) -> dict[str, int]:
    """Sum lightning + human caused acres by GACC for one calendar year."""
    gaccs = gaccs_for_report(legacy)
    per_gacc = {g: 0 for g in gaccs}

    def add_acres_row(header: list[str], row: list[str]) -> None:
        vals = [
            parse_acres_cell(v)
            for v in row[1:]
            if v and parse_acres_cell(v) > 0
        ]
        if not vals or max(vals) < 5_000:
            return
        for g in gaccs:
            for h, v in zip(header, row):
                if h == g and v:
                    per_gacc[g] += parse_acres_cell(v)

    with pdfplumber.open(pdf_path) as doc:
        for page in doc.pages:
            text = page.extract_text() or ""
            if "Geographic" not in text or "Acres" not in text:
                continue
            if "Lightning" not in text and "Human" not in text:
                continue
            for table in page.extract_tables() or []:
                header = [str(c or "").strip() for c in table[0]]
                if "NW" not in header:
                    continue
                for row in table[1:]:
                    add_acres_row(header, [str(c or "").strip() for c in row])

    return {g: acres for g, acres in per_gacc.items() if acres > 0}


def western_total(year_data: dict[str, int]) -> int:
    keys = WESTERN_MODERN if "GB" in year_data else WESTERN_LEGACY
    return sum(year_data[g] for g in keys if g in year_data)


def national_gacc_keys(year_data: dict[str, int]) -> list[str] | None:
    if all(g in year_data for g in NATIONAL_GACCS):
        return NATIONAL_GACCS
    legacy_nat = WESTERN_LEGACY + EASTERN_GACCS + SOUTHERN_GACCS + ALASKA_GACCS
    if all(g in year_data for g in legacy_nat):
        return legacy_nat
    return None


def regional_totals(year_data: dict[str, int]) -> dict[str, int | None]:
    western = western_total(year_data)
    eastern = sum(year_data[g] for g in EASTERN_GACCS if g in year_data) or None
    southern = sum(year_data[g] for g in SOUTHERN_GACCS if g in year_data) or None
    alaska = sum(year_data[g] for g in ALASKA_GACCS if g in year_data) or None

    nat_keys = national_gacc_keys(year_data)
    if nat_keys:
        national = sum(year_data[g] for g in nat_keys)
        coverage = "all_gaccs"
    else:
        national = None
        coverage = "western_only"

    return {
        "western_acres": western,
        "eastern_acres": eastern,
        "southern_acres": southern,
        "alaska_acres": alaska,
        "national_gacc_acres": national,
        "gacc_coverage": coverage,
    }


def _millions(acres: int | None) -> str:
    if acres is None:
        return ""
    return str(round(acres / 1_000_000, 4))


def _share(part: int | None, whole: int | None) -> str:
    if part is None or whole is None or whole == 0:
        return ""
    return str(round(part / whole, 4))


def write_regional_csv(
    merged_gacc: dict[int, dict[str, int]],
    sources: dict[int, str],
) -> None:
    fieldnames = [
        "year",
        "western_acres",
        "western_acres_millions",
        "eastern_acres",
        "eastern_acres_millions",
        "southern_acres",
        "southern_acres_millions",
        "alaska_acres",
        "alaska_acres_millions",
        "national_gacc_acres",
        "national_gacc_acres_millions",
        "western_share_of_gacc",
        "eastern_share_of_gacc",
        "southern_share_of_gacc",
        "alaska_share_of_gacc",
        "gacc_coverage",
        "gacc_definition",
        "source_report",
    ]
    rows = []
    for yr in sorted(merged_gacc):
        totals = regional_totals(merged_gacc[yr])
        nat = totals["national_gacc_acres"]
        rows.append({
            "year": yr,
            "western_acres": totals["western_acres"],
            "western_acres_millions": _millions(totals["western_acres"]),
            "eastern_acres": totals["eastern_acres"] or "",
            "eastern_acres_millions": _millions(totals["eastern_acres"]),
            "southern_acres": totals["southern_acres"] or "",
            "southern_acres_millions": _millions(totals["southern_acres"]),
            "alaska_acres": totals["alaska_acres"] or "",
            "alaska_acres_millions": _millions(totals["alaska_acres"]),
            "national_gacc_acres": nat or "",
            "national_gacc_acres_millions": _millions(nat),
            "western_share_of_gacc": _share(totals["western_acres"], nat),
            "eastern_share_of_gacc": _share(totals["eastern_acres"], nat),
            "southern_share_of_gacc": _share(totals["southern_acres"], nat),
            "alaska_share_of_gacc": _share(totals["alaska_acres"], nat),
            "gacc_coverage": totals["gacc_coverage"],
            "gacc_definition": "West=NW,NR,GB,RM,SW,NO,SO; East=EA; South=SA; AK=AK",
            "source_report": sources[yr],
        })

    with OUT_REGIONAL.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(rows)


def rebuild_regional_from_gacc_csv() -> None:
    """Rebuild regional-acres-annual.csv from nicc-gacc-acres-source.csv (no PDFs)."""
    if not OUT_GACC.exists():
        raise FileNotFoundError(OUT_GACC)

    merged_gacc: dict[int, dict[str, int]] = {}
    sources: dict[int, str] = {}
    with OUT_GACC.open(newline="") as f:
        for row in csv.DictReader(f):
            yr = int(row["year"])
            merged_gacc.setdefault(yr, {})
            merged_gacc[yr][row["gacc"]] = int(row["acres"])
            sources[yr] = row["source_report"]

    write_regional_csv(merged_gacc, sources)
    print(f"Wrote {OUT_REGIONAL} ({len(merged_gacc)} years) from {OUT_GACC.name}")


def main() -> None:
    merged_gacc: dict[int, dict[str, int]] = {}
    sources: dict[int, str] = {}

    for pdf in TEXT_REPORTS:
        if not pdf.exists() or pdf.stat().st_size < 100_000:
            print(f"SKIP missing/invalid: {pdf.name}")
            continue
        years, data = extract_text_table(pdf)
        if not years:
            print(f"SKIP no table: {pdf.name}")
            continue
        print(f"TEXT {pdf.name}: {years[0]}-{years[-1]}")
        for yr in years:
            merged_gacc.setdefault(yr, {})
            for gacc, by_year in data.items():
                merged_gacc[yr][gacc] = by_year[yr]
            sources[yr] = pdf.name

    for report_year, pdf, legacy in LEGACY_LIGHTNING_HUMAN:
        if not pdf.exists():
            raise FileNotFoundError(pdf)
        year_data = extract_lightning_human(pdf, legacy=legacy)
        if not year_data:
            year_data = extract_multiyear_text_gacc(pdf, report_year)
            source_suffix = "multiyear-text-total"
        else:
            source_suffix = "lightning+human"
        if not year_data:
            print(f"WARN {report_year}: no GACC acres extracted from {pdf.name}")
            continue
        merged_gacc[report_year] = year_data
        sources[report_year] = f"{pdf.name} ({source_suffix})"

    # Cross-check overlaps
    for yr in sorted(merged_gacc):
        if yr >= 2013 and yr in sources and "lightning" not in sources[yr]:
            pass  # text is authoritative for 2013+

    rows_gacc = []
    western_by_year: dict[int, float] = {}
    for yr in sorted(merged_gacc):
        w_acres = western_total(merged_gacc[yr])
        western_by_year[yr] = w_acres / 1_000_000
        for gacc, acres in sorted(merged_gacc[yr].items()):
            rows_gacc.append({
                "year": yr,
                "gacc": gacc,
                "acres": acres,
                "source_report": sources[yr],
            })
        nat_note = ""
        print(f"  {yr}: western {western_by_year[yr]:.4f}M ({sources[yr]}){nat_note}")

    OUT_GACC.parent.mkdir(parents=True, exist_ok=True)
    with OUT_GACC.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["year", "gacc", "acres", "source_report"])
        w.writeheader()
        w.writerows(rows_gacc)

    with OUT_WESTERN.open("w", newline="") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "year",
                "western_acres",
                "western_acres_millions",
                "gacc_definition",
                "source_report",
            ],
        )
        w.writeheader()
        for yr in sorted(western_by_year):
            w.writerow({
                "year": yr,
                "western_acres": int(western_by_year[yr] * 1_000_000),
                "western_acres_millions": round(western_by_year[yr], 4),
                "gacc_definition": "NW,NR,GB,RM,SW,NO,SO (EB+WB pre-2015)",
                "source_report": sources[yr],
            })

    print(f"Wrote {OUT_GACC} ({len(rows_gacc)} rows)")
    print(f"Wrote {OUT_WESTERN} ({len(western_by_year)} years)")
    write_regional_csv(merged_gacc, sources)
    print(f"Wrote {OUT_REGIONAL} ({len(western_by_year)} years)")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--from-csv":
        rebuild_regional_from_gacc_csv()
    else:
        main()
