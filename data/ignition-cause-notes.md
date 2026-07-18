# Ignition cause acres (exploratory)

National GACC **Total** column from NICC lightning vs human caused acres burned tables.

## Window

2003-2012, n = 7 calendar years (non-contiguous)

## Median lightning share

61.9%

## Skipped years

- **2007:** percent-only cause tables (no GACC Total row in PDF text)
- **2008:** cause acres table image-only (no numeric row in PDF text)
- **2009:** cause acres table image-only (no numeric row in PDF text)

## Limitations

- **2007:** percent-only cause tables (no GACC Total row in PDF text)
- **2008-2009:** Cause acres tables are image-only in NICC PDFs (same class of gap as GACC regional extract). Export companion pages via `scripts/export_nicc_gap_pages.py` (lightning/human chart pages) if attempting hand OCR. Claim **C-P2-03**.
- 2013+ reports in this repo lack the same text blocks; not included.
- GACC totals may differ from NIFC national acres series.
- Initial cause classification only.
- Not causal.

## Reproduce

```bash
python scripts/extract_ignition_cause.py
```
