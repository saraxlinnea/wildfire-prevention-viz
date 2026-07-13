# HFR prevention notes (FY 2003-2021)

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

- **2003-2021** (n = 19 fiscal years)

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
```
