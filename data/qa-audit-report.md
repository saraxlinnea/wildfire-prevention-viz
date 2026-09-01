# QA audit report

**Date:** 2026-08-04 (Home + Explore briefing)  
**Automated:** `python scripts/audit_data.py` · `python scripts/verify_local.py`  
**Claim-level fact-check:** [`research/fact-check-log.md`](../research/fact-check-log.md)  
**Visual checklist:** [`research/visual-qa-checklist.md`](../research/visual-qa-checklist.md)

## Automated checks

| Check | Command | Expected |
|---|---|---|
| Data integrity | `python scripts/audit_data.py` | Exit 0 |
| Boot CSV row counts | `python scripts/verify_local.py` | FILE CHECK: OK |
| Local HTTP (optional) | `python3 -m http.server 8000` + verify_local | SERVER CHECK: OK |

## Boot CSVs (required)

Loaded by `js/app.js` on Explore load:

| File | Min rows / notes |
|---|---|
| `data/wildfire-data.csv` | 40 calendar years |
| `data/vpd-annual.csv` | 40 |
| `data/erc-annual.csv` | 40 |
| `data/regional-acres-annual.csv` | 18+ |
| `data/hfr-prevention-annual.csv` | 19 fiscal years |
| `data/vpd-monthly-annual.csv` | 14 |
| `data/gacc-regions.geojson` | 50 state features (Overview map) |
| `data/wfigs-ytd-snapshot.geojson` | Overview WFIGS map (loads with Overview) |
| `data/south-kbdi-annual.csv` | South KBDI (Drivers) |

## Optional CSVs

| File | Used for |
|---|---|
| `data/ignition-cause-annual.csv` | Still fetched; ignition chart off main path (Methods gaps notes, n=7) |
| `data/correlation-sensitivity.csv` | Drivers reliability diagnostics |
| `data/correlation-partial.csv` | Drivers reliability / research |
| `data/westerling-snowmelt-tercile.csv` | Drivers Westerling chart |

## Chart containers (by tab)

| Tab | Primary chart / map IDs |
|---|---|
| Home | `#map-wfigs-ytd` (via `js/home.js`) |
| Overview | `#chart-fire`, geo panel (`#chart-gacc-choropleth`, `#chart-western-acres-outcomes`, `#chart-regional-share-outcomes`), `#map-wfigs-ytd` (Ops details) |
| Drivers | `#chart-regional-top-drivers`, `#chart-atmosphere`, `#chart-scatter`, `#chart-westerling-snowmelt`; details `#chart-atmosphere-national` |
| Context | `#chart-policy`, `#chart-suppression`, `#chart-wui-share`; research `#chart-treatment-acres`, `#chart-treatment-per-acre`, `#chart-policy-scatter` |
| Impacts | `#chart-smoke-pm25`, `#chart-structures-destroyed`, `#chart-suppression-impacts`; research `#chart-smoke-structures-overlap` (2014-2023) |
| Methods | Reference only (no primary Vega charts) |

## Data integrity (audit_data.py)

| Check | Result |
|---|---|
| National / western DSCI vs audit CSV | OK (last run 2026-08-04) |
| Western / regional acres continuity (incl. 2008-2009) | OK |
| VPD / ERC / regional gridMET | OK |
| 2026 partial-year flags; fires_count 1983-2025 | OK |
| gacc-regions.geojson + wfigs snapshot | OK |

## Known intentional gaps

- **2008-2009** regional GACC acres: filled 2026-07-17 via hand OCR; continuous in `regional-acres-annual.csv`.
- **2007-2009** ignition cause share series: not on main path; n=7 in notes.
- **2026 YTD:** Aug 27 NIFC snapshot (7,971,399 acres); may drift from later NFN updates.
- **2026 DSCI:** 34-week averages through Aug 25 (national 168.7; western 164.2).

## Re-run before share

```bash
cd "/Users/saralinnea/Desktop/Projects/wildfire analysis"
pip install -r requirements.txt
python scripts/audit_data.py
python scripts/verify_local.py
python3 -m http.server 8000
```

Then complete [`research/visual-qa-checklist.md`](../research/visual-qa-checklist.md).
