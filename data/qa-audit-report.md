# QA audit report

**Date:** June 2026  
**Run:** `python scripts/audit_data.py`

## Local QA

| Check | Result |
|---|---|
| `index.html` serves via local HTTP server | Pass |
| `data/wildfire-data.csv` loads (200) | Pass |
| `data/vpd-annual.csv` loads (200) | Pass |
| Four chart containers present (`#chart-fire`, `#chart-prevention`, `#chart-dsci`, `#chart-vpd`) | Pass |
| Meta / OG tags updated for 1983-2026 range | Pass |
| Social preview card (`assets/og-card.svg`) | Added |

## Data integrity

| Check | Result |
|---|---|
| National DSCI vs `dsci-annual-averages.csv` | Pass |
| Western DSCI vs `dsci-western-annual.csv` | Pass |
| VPD values in 1.0-2.5 kPa range | Pass (after fixing 1980, 1982, 1991, 1992 bad OPeNDAP reads) |
| 2026 partial-year flags | Pass |
| Acres burned span 1983-2025 (+ 2026 YTD) | Pass |
| Correlation CSVs regenerated | Pass |

## Fixes applied during audit

- **VPD 1980, 1982, 1991, 1992:** Restored from verified gridMET OPeNDAP runs (partial reads had produced 0.04-0.75 kPa).
- **`scripts/extend_vpd.py`:** Now rejects values outside 1.0-2.5 kPa to prevent bad writes.
- **`scripts/audit_data.py`:** Added for repeatable pre-publish checks.

## Manual checks recommended before share

1. Open `http://localhost:8000` and confirm all four Vega charts render.
2. Resize browser to mobile width; confirm callouts stack 2x2 and legends wrap.
3. Hover tooltips on fire bars and prevention lines.
4. Open footer CSV links and confirm downloads.
5. Click **CRS Report IF10244 (PDF)** in a browser (crsreports.congress.gov). Congress.gov often blocks automated fetches but works for readers.
6. Notebook links point to GitHub `blob/main/...` paths. They 404 until the latest repo is pushed.
7. After GitHub push, test live URL and LinkedIn link preview.

## Link fixes (July 2026)

- CRS ten-year average: primary link is [CRS PDF mirror](https://crsreports.congress.gov/product/pdf/IF/IF10244); Congress.gov kept as secondary.
- Correlation and methods notebooks: absolute GitHub `blob/main` URLs (not relative `.ipynb` on GitHub Pages).
- Abatzoglou 2013 DOI linked in methodology for gridMET/VPD.

## Re-run audit

```bash
python scripts/audit_data.py
python scripts/compute_correlations.py
```
