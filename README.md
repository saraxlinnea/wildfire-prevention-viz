# An Ounce of Prevention: U.S. Wildfire Data

U.S. wildfire data visualization, 1983-2026. Four tabs: outcomes, drivers and context, exploratory coupling, and how to read.

**[View live](https://saraxlinnea.github.io/wildfire-prevention-viz)**

---

## What This Shows

The page uses four tabs:

- **Outcomes:** national acres burned with rolling 10-year baseline band; western vs national GACC acres; 2026 YTD and forecast callouts (fire metrics only)
- **Drivers & context:** federal treatment (HFR 2003-2021 + page series), WUI designation share, treatment vs acres dual-axis, western ERC/VPD z-score overlay; 35% FS YoY context lives here (not on Outcomes)
- **Coupling** (exploratory): literature proxy ranking, ERC/VPD scatter, regional GACC share; lightning vs human cause (n=7) in supplementary details; sensitivity and May VPD in supplementary details
- **How to read:** Start here path, dataset gaps, glossary, scientific limits, methodology

As of July 16, 2026, more than 3.6 million acres have already burned nationally, about 29% above the 10-year average to date. Peak fire season runs July through September in the West.

This page does not claim that cutting prevention in 2025 directly caused the 2026 fire season. It shows what moved together in the record and leaves conclusions to you.

---

## Data Sources

| Dataset | Source | Years | Notes |
|---|---|---|---|
| Total U.S. acres burned | [NIFC Total Wildfires and Acres](https://www.nifc.gov/fire-information/statistics) | 1983-2025 | Calendar year; standardized reporting from 1983 |
| 2026 YTD acres burned | [NIFC National Fire News, July 16 2026](https://www.nifc.gov/fire-information/nfn) | Jan-Jul 16 2026 | 3,674,911 acres; ~129% of 10-year YTD avg |
| Forest Service treatment | [NPR analysis of USFS FACTS database, May 4 2026](https://www.npr.org/2026/05/04/nx-s1-5801475/) | 2023-2025 | Cross-checked by Center for Western Priorities |
| HFR federal treatment | HFR-DOI-FS NFPORS | FY 2003-2021 | Joint FS+DOI; `data/hfr-prevention-annual.csv` |
| Interior Dept treatment | [DOI fuels management program](https://www.doi.gov/wildlandfire/fuels) | 2018-2024 | Fiscal year Oct 1 start |
| Drought severity (national) | [U.S. Drought Monitor API](https://usdmdataservices.unl.edu/api/USStatistics/GetDSCI?aoi=conus) | 2000-2026 | See `data/dsci-annual-averages.csv` |
| Drought severity (western) | [USDM NWS Western Region API](https://usdmdataservices.unl.edu/api/NWSRegionStatistics/GetDSCI?aoi=WR) | 2000-2026 | See `data/dsci-western-annual.csv` |
| Western fire season VPD | [gridMET via OPeNDAP](http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/) | 1979-2025 | May-Sep west of 100°W; `data/vpd-annual.csv` |
| May western VPD | gridMET OPeNDAP | 2010-2025 | `data/vpd-monthly-annual.csv`; timing research |
| Western fire season ERC | [gridMET via OPeNDAP](http://thredds.northwestknowledge.net/thredds/dodsC/MET/erc/) | 1979-2025 | `data/erc-annual.csv` |
| Western acres burned (GACC) | NICC annual reports | 2003-2025 | 2008-2009 hand OCR of lightning+human pages; `data/western-acres-annual.csv` |
| Regional GACC acres | NICC annual reports | 2003-2007, 2010-2025 | `data/regional-acres-annual.csv` |
| Ignition cause acres | NICC annual reports | 2003-2012 (n=7) | Lightning vs human GACC totals; gap 2007-2009 extract |
| Regional gridMET VPD/ERC | gridMET OPeNDAP | 1979-2025 (west); 2010-2025 (south/east) | `data/regional-gridmet-annual.csv` |
| Ten-year average (CRS) | [CRS Report IF10244](https://crsreports.congress.gov/product/pdf/IF/IF10244) | 2013-2022 | 7.2M reference; chart uses rolling NIFC band |
| 2026 forecast | [AccuWeather 2026 forecast](https://www.accuweather.com/en/press/larger-wildfires-fueled-by-drought-and-heat-expected-across-the-u-s-in-2026/1884295) | 2026 | 5.5-8M acres projected (speculative) |
| Research station closures | [Stateline, April 17 2026](https://stateline.org/2026/04/17/forest-service-plan-to-close-research-stations-stokes-fear-as-wildfire-season-approaches/) | 2026 | 57 of 77 stations |

**Main chart data:** [`data/wildfire-data.csv`](data/wildfire-data.csv) (row 2 is column metadata with source URLs)

**Boot CSVs (required for charts):** `wildfire-data.csv`, `vpd-annual.csv`, `erc-annual.csv`, `regional-acres-annual.csv`, `hfr-prevention-annual.csv`, `vpd-monthly-annual.csv`

**Correlations (exploratory):** [`data/correlation-matrix.csv`](data/correlation-matrix.csv), [`data/correlation-sensitivity.csv`](data/correlation-sensitivity.csv), [`data/correlation-notes.md`](data/correlation-notes.md). Default scatter: western GACC acres vs western ERC (r ≈ 0.82, 2010-2025); not causal.

**Phase 2 backlog:** [`research/PHASE2_RESEARCH.md`](research/PHASE2_RESEARCH.md)

---

## Analysis Notebooks

| Notebook | Purpose |
|---|---|
| [`notebooks/process-vpd-data.ipynb`](notebooks/process-vpd-data.ipynb) | gridMET VPD; western US, May-Sep, 1979-2025 |
| [`notebooks/verify-dsci-data.ipynb`](notebooks/verify-dsci-data.ipynb) | DSCI annual averages from USDM API |
| [`notebooks/correlation-analysis.ipynb`](notebooks/correlation-analysis.ipynb) | Exploratory pairwise correlations |

Scripts:

```bash
python scripts/audit_data.py                    # pre-publish check (must exit 0)
python scripts/verify_local.py                  # boot CSV row counts + optional server
python scripts/extend_vpd.py                    # extend VPD via gridMET
python scripts/extend_erc.py                    # extend ERC via gridMET
python scripts/compute_correlations.py          # correlation CSVs
python scripts/compute_sensitivity_correlations.py
python scripts/extract_ignition_cause.py        # lightning vs human NICC extract
python scripts/build_western_acres.py           # GACC western + regional acres
```

Setup:

```bash
pip install -r requirements.txt
jupyter notebook notebooks/
```

---

## Before you publish

```bash
pip install -r requirements.txt
python scripts/audit_data.py          # must exit 0
python3 scripts/verify_local.py
python3 -m http.server 8000           # open http://localhost:8000
```

If charts fail: use HTTP not `file://`; hard refresh after deploy (`Cmd+Shift+R`).

See [`data/qa-audit-report.md`](data/qa-audit-report.md) and [`research/fact-check-log.md`](research/fact-check-log.md).

---

## For technical reviewers

**Claim registry:** [`research/claims.md`](research/claims.md) — every on-page statement tracked by ID.

**Reproducibility**

- Front-end: [`js/datasets.js`](js/datasets.js), [`js/charts.js`](js/charts.js), [`js/app.js`](js/app.js) (no build step)
- Audit: [`scripts/audit_data.py`](scripts/audit_data.py)
- Page review stub: [`research/reviews/`](research/reviews/)

**Known limitations**

- Interior treatment is fiscal year; burn acres and DSCI are calendar year
- FS treatment comparable from 2023 onward only (NPR/USFS FACTS)
- ERC, VPD, western DSCI are regional; national burn acres include all land types
- 2026 partial year through July 16 (acres) and July 14 (DSCI)
- Continuous 2003-2025 regional GACC acres (2008-2009 hand OCR); ignition cause n=7 (see `ignition-cause-notes.md`)

---

## Share

[`SHARE.md`](SHARE.md) — LinkedIn and journalist copy.

---

## Built With

- [Vega-Lite](https://vega.github.io/vega-lite/)
- Vanilla HTML/CSS/JS; Python/Jupyter for data processing (optional for viewing)

```bash
git clone https://github.com/saraxlinnea/wildfire-prevention-viz.git
cd wildfire-prevention-viz
python3 -m http.server 8000
```

---

*Sara Bower · San Francisco · July 2026*
