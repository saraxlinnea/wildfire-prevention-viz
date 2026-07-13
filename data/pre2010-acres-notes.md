# Pre-2010 GACC acres notes

Repository research artifact. Western/regional acres extended to **2003-2012** where NICC PDFs allow extraction.

## Methods by window

| Years | Method | Coverage |
|---|---|---|
| 2003-2006 | pdfplumber lightning + human caused acres tables | `all_gaccs` when EA/SA/AK present |
| 2007 | pypdf multi-year **total** wildfire acres text table (Fires/Acres block) | `all_gaccs` |
| 2008-2009 | **Not extracted** — PDFs are chart/image-heavy; no machine-readable GACC table | gap |
| 2010-2012 | pdfplumber lightning + human | `all_gaccs` |
| 2013-2025 | NICC annual report text tables (`build_western_acres.py`) | `all_gaccs` |

## 2008-2009 gap

`annual_report_2008_508.pdf` and `annual_report_2009_508.pdf` lack extractable `Fires/Acres` text blocks and pdfplumber GACC tables. National totals appear in prose (e.g. 2008 ≈ 5.29M acres) but regional GACC splits are not recoverable from these PDFs without OCR.

## Western definition

NW, NR, EB, WB, RM, SW, NO, SO pre-2015; GB replaces EB/WB from 2015 NICC tables onward.

## Reproduce

```bash
# Download 2003-2009 PDFs into data/nicc-source/ (see data/nicc-source/README.md)
python scripts/build_western_acres.py
```

## Cross-check

2007 multiyear text extract sums to **9.328M** national GACC acres, matching the 2007 NICC report narrative.
