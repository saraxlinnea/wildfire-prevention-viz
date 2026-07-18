# Pre-2010 GACC acres notes

Repository research artifact. Western/regional acres cover **2003-2025** continuously.

## Methods by window

| Years | Method | Coverage |
|---|---|---|
| 2003-2006 | pdfplumber lightning + human caused acres tables | `all_gaccs` when EA/SA/AK present |
| 2007 | pypdf multi-year **total** wildfire acres text table (Fires/Acres block) | `all_gaccs` |
| 2008-2009 | Hand transcription of lightning + human chart pages (PNG renders) | `all_gaccs` |
| 2010-2012 | pdfplumber lightning + human | `all_gaccs` |
| 2013-2025 | NICC annual report text tables (`build_western_acres.py`) | `all_gaccs` |

## 2008-2009 hand extract (closed 2026-07-17)

`annual_report_2008_508.pdf` and `annual_report_2009_508.pdf` lack extractable text GACC tables. Filled from OCR-page PNGs:

1. `python scripts/export_nicc_gap_pages.py` → `data/nicc-source/ocr-pages/`
2. Read lightning acres + human acres tables; sum per GACC
3. Store in `data/gacc-2008-2009-hand-extract-template.csv`
4. `build_western_acres.py` loads that CSV when PDF extract fails for those years

| Year | Western (M) | National GACC (M) | West share | Cross-check |
|---|---|---|---|---|
| 2008 | 2.9558 | 5.2925 | 55.9% | Matches NIFC national ≈ 5.3M |
| 2009 | 1.6239 | 5.9218 | 27.4% | Matches NIFC national ≈ 5.9M; Alaska-dominated |

Western sum = NW+NR+EB+WB+RM+SW+NO+SO; East=EA; South=SA; Alaska=AK.

## Western definition

NW, NR, EB, WB, RM, SW, NO, SO pre-2015; GB replaces EB/WB from 2015 NICC tables onward.

## Reproduce

```bash
# Download 2003-2009 PDFs into data/nicc-source/ (see data/nicc-source/README.md)
python scripts/build_western_acres.py
# Or after editing hand-extract CSV / nicc-gacc-acres-source.csv:
python scripts/build_western_acres.py --from-csv
```

## Cross-check

2007 multiyear text extract sums to **9.328M** national GACC acres, matching the 2007 NICC report narrative.
2008 hand-OCR national GACC sum **5.292M**; 2009 **5.922M**.
