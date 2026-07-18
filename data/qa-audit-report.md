# QA audit report

**Date:** 2026-07-13 (refreshed for four-tab layout)  
**Automated:** `python scripts/audit_data.py` · `python scripts/verify_local.py`  
**Claim-level fact-check:** [`research/fact-check-log.md`](../research/fact-check-log.md) (2026-07-13 housekeeping pass)  
**Visual checklist:** [`research/visual-qa-checklist.md`](../research/visual-qa-checklist.md)

## Automated checks

| Check | Command | Expected |
|---|---|---|
| Data integrity | `python scripts/audit_data.py` | Exit 0 |
| Boot CSV row counts | `python scripts/verify_local.py` | FILE CHECK: OK |
| Local HTTP (optional) | `python3 -m http.server 8000` + verify_local | SERVER CHECK: OK |

## Boot CSVs (required)

Loaded by `js/app.js` on page load:

| File | Min rows |
|---|---|
| `data/wildfire-data.csv` | 40 calendar years |
| `data/vpd-annual.csv` | 40 |
| `data/erc-annual.csv` | 40 |
| `data/regional-acres-annual.csv` | 18 |
| `data/hfr-prevention-annual.csv` | 19 fiscal years |
| `data/vpd-monthly-annual.csv` | 14 |

## Optional CSVs

| File | Used for |
|---|---|
| `data/ignition-cause-annual.csv` | Coupling supplementary ignition chart (n=7) |
| `data/correlation-sensitivity.csv` | Coupling supplementary sensitivity table |

## Chart containers (by tab)

| Tab | Primary chart IDs |
|---|---|
| Outcomes | `#chart-fire`, `#chart-western-acres-outcomes` |
| Drivers | `#chart-policy`, `#chart-wui-share`, `#chart-treatment-acres`, `#chart-atmosphere` |
| Coupling | `#chart-scatter`, `#chart-western-acres`, `#chart-regional-share` |
| Coupling supplementary | `#chart-ignition-cause`, `#chart-may-vpd`, `#chart-proxy-rank`, `#chart-lag` |
| Drivers research details | `#chart-treatment-per-acre` |
| Atmosphere details | `#chart-atmosphere-national` |

## Data integrity (audit_data.py)

| Check | Result |
|---|---|
| National DSCI vs audit CSV | OK |
| Western DSCI vs audit CSV | OK |
| VPD 1979-2025 in range 1.0-2.5 kPa | OK |
| 2026 partial-year flags | OK |
| Acres burned span 1983-2025 (+ 2026 YTD) | OK |
| Required data files present | OK |

## Known intentional gaps

- **2008-2009** regional GACC acres: filled 2026-07-17 via hand OCR; continuous in `regional-acres-annual.csv`.
- **2007-2009** ignition cause: supplementary chart only; n=7 years.
- **2026 YTD:** Jul 16 NIFC snapshot (3,674,911 acres); may drift from later NFN updates.
- **2026 DSCI:** 28-week averages through Jul 14 (national 169.9; western 156.0).

## Re-run before share

```bash
cd "/Users/saralinnea/Desktop/Projects/wildfire analysis"
pip install -r requirements.txt
python scripts/audit_data.py
python scripts/verify_local.py
python3 -m http.server 8000
```

Then complete [`research/visual-qa-checklist.md`](../research/visual-qa-checklist.md).
