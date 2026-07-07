# An Ounce of Prevention: U.S. Wildfire Data

U.S. wildfire data visualization, 1983-2026. Four tabs: outcomes, drivers and context, exploratory coupling, and how to read.

**[View live](https://saraxlinnea.github.io/wildfire-prevention-viz)**

---

## What This Shows

The page uses four tabs:

- **Outcomes**: national acres burned with rolling 10-year baseline band; YTD callouts; 2026 forecast overlay
- **Drivers & context**: western dryness z-score overlay, national/western DSCI (collapsible), combined federal treatment
- **Coupling** (exploratory): correlation table, VPD vs acres scatter, annual lag proxy; treatment scatter in collapsible (n=3)
- **How to read**: framing, policy context, methodology

As of June 18, 2026, more than 2.6 million acres have already burned, about 63% above the 10-year average to date. Peak fire season starts in summer. In 2025 the Forest Service treated 35% fewer acres for wildfire risk than the year before.

This page does not claim that cutting prevention in 2025 directly caused the 2026 fire season. It shows two things happening at the same time and leaves the conclusion to you.

---

## Data Sources

| Dataset | Source | Years | Notes |
|---|---|---|---|
| Total U.S. acres burned | [NIFC Total Wildfires and Acres](https://www.nifc.gov/fire-information/statistics) | 1983-2025 | Calendar year; standardized reporting from 1983 |
| 2026 YTD acres burned | [NIFC National Fire News, June 18 2026](https://www.nifc.gov/fire-information/nfn) | Jan-Jun 18 2026 | 2,627,549 acres; 163% of 10-year YTD avg |
| Forest Service treatment | [NPR analysis of USFS FACTS database, May 4 2026](https://www.npr.org/2026/05/04/nx-s1-5801475/) | 2023-2025 | Cross-checked by Center for Western Priorities |
| Interior Dept treatment | [DOI fuels management program](https://www.doi.gov/wildlandfire/fuels) | 2018-2024 | Fiscal year Oct 1 start |
| Drought severity (national) | [U.S. Drought Monitor API](https://usdmdataservices.unl.edu/api/USStatistics/GetDSCI?aoi=conus) | 2000-2026 | See `data/dsci-annual-averages.csv` |
| Drought severity (western) | [USDM NWS Western Region API](https://usdmdataservices.unl.edu/api/NWSRegionStatistics/GetDSCI?aoi=WR) | 2000-2026 | See `data/dsci-western-annual.csv` |
| Western fire season VPD | [gridMET via OPeNDAP](http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/) | 1979-2025 | Western US, May-Sep; see `data/vpd-annual.csv` |
| Ten-year average (CRS) | [CRS Report IF10244 (PDF)](https://crsreports.congress.gov/product/pdf/IF/IF10244), [Congress.gov](https://www.congress.gov/crs-product/IF10244) | 2013-2022 | 7.2M acres; reference in CSV only; chart uses rolling 10-yr band from NIFC data |
| 2026 forecast | [AccuWeather 2026 Wildfire Season Forecast](https://www.accuweather.com/en/press/larger-wildfires-fueled-by-drought-and-heat-expected-across-the-u-s-in-2026/1884295) | 2026 | 5.5-8M acres projected |
| Research station closures | [Stateline, USDA reorganization March 2026](https://stateline.org/2026/04/17/forest-service-plan-to-close-research-stations-stokes-fear-as-wildfire-season-approaches/) | 2026 | 57 of 77 stations |

**Main chart data:** [`data/wildfire-data.csv`](data/wildfire-data.csv) (row 2 is column metadata with source URLs)

**DSCI verification:** [`data/dsci-annual-averages.csv`](data/dsci-annual-averages.csv) and [`data/dsci-western-annual.csv`](data/dsci-western-annual.csv). Raw weekly files in [`data/dsci-source/`](data/dsci-source/).

**VPD:** [`data/vpd-annual.csv`](data/vpd-annual.csv). Extend with `python scripts/extend_vpd.py`.

**Correlations (exploratory, Coupling tab):** [`data/correlation-by-window.csv`](data/correlation-by-window.csv), [`data/correlation-matrix.csv`](data/correlation-matrix.csv), [`data/correlation-notes.md`](data/correlation-notes.md). Scatter annotates r ≈ 0.63 (western VPD vs national acres, 2010-2025); not causal evidence.

---

## Analysis Notebooks

| Notebook | Purpose |
|---|---|
| [`notebooks/process-vpd-data.ipynb`](https://github.com/saraxlinnea/wildfire-prevention-viz/blob/main/notebooks/process-vpd-data.ipynb) | gridMET VPD via OPeNDAP; western US, May-Sep, 1979-2025 |
| [`notebooks/verify-dsci-data.ipynb`](https://github.com/saraxlinnea/wildfire-prevention-viz/blob/main/notebooks/verify-dsci-data.ipynb) | DSCI annual averages from USDM API (national + western) |
| [`notebooks/correlation-analysis.ipynb`](https://github.com/saraxlinnea/wildfire-prevention-viz/blob/main/notebooks/correlation-analysis.ipynb) | Exploratory pairwise correlations (Coupling tab + CSVs) |

Scripts:

```bash
python scripts/audit_data.py           # pre-publish data integrity check
python scripts/extend_vpd.py          # extend VPD via gridMET
python scripts/compute_correlations.py  # regenerate correlation CSVs
```

Setup:

```bash
pip install -r requirements.txt
jupyter notebook notebooks/
```

VPD processing takes several minutes over the network (OPeNDAP subsetting per year). DSCI verification takes about 1-2 minutes.

---

## Before you publish

```bash
pip install -r requirements.txt
python scripts/audit_data.py          # must exit 0
python3 scripts/verify_local.py       # checks js/, data/, and local server
python3 -m http.server 8000           # open http://localhost:8000
```

If charts show a load error, open the browser console. Common causes: `file://` URL (use the server above), server started outside the repo root (404 on `js/` or `data/`), or Vega CDN blocked offline.

See [`data/qa-audit-report.md`](data/qa-audit-report.md) for the latest audit checklist.

---

## For technical reviewers

**Claim registry**

Every statement on the live page is tracked in [`research/claims.md`](research/claims.md) (status, sources, confidence). Update before changing copy on `index.html`.

**Reproducibility**

- Chart data: [`data/wildfire-data.csv`](data/wildfire-data.csv) (row 2 = column metadata with source URLs)
- DSCI verified against USDM API; raw weekly files in [`data/dsci-source/`](data/dsci-source/)
- VPD from gridMET OPeNDAP; extend via [`scripts/extend_vpd.py`](scripts/extend_vpd.py)
- Audit script: [`scripts/audit_data.py`](scripts/audit_data.py)
- Front-end: [`js/datasets.js`](js/datasets.js), [`js/charts.js`](js/charts.js), [`js/app.js`](js/app.js) (loaded from `index.html`; no build step)

**Exploratory correlations (Coupling tab)**

- [`data/correlation-notes.md`](data/correlation-notes.md) documents caveats and key findings
- 2010-2025 window: western VPD vs national acres burned r ≈ 0.63; shown on scatter chart, not causal evidence
- 2023-2025 FS treatment vs next-year fire: 3 pairs only; illustrative

**Known limitations**

- Interior treatment is fiscal year; acres burned and DSCI are calendar year
- FS treatment comparable from 2023 onward only (NPR/USFS FACTS method)
- VPD and western DSCI are regional; national burn acres include all land types
- 2026 values are partial year through June 18 (acres) and June 17 (DSCI)

---

## Share

Ready-to-use LinkedIn and journalist copy: [`SHARE.md`](SHARE.md)

---

## A Note on the Data

Forest Service treatment data is only available consistently from 2023 onward. Interior Department figures run on a fiscal year starting October 1. DSCI national and western series start in 2000 (USDM API has no 1999 data). VPD is western U.S. only. The Coupling tab shows exploratory coupling views; full analysis is in the notebooks and CSV files.

---

## Built With

- [Vega-Lite](https://vega.github.io/vega-lite/)
- Vanilla HTML and CSS; chart logic in `js/` modules
- Python / Jupyter for data processing (optional; chart runs without it)

```bash
git clone https://github.com/saraxlinnea/wildfire-prevention-viz.git
cd wildfire-prevention-viz
pip install -r requirements.txt   # optional, for notebooks only
python3 -m http.server 8000
# open http://localhost:8000
```

The charts load `data/wildfire-data.csv` and `data/vpd-annual.csv` via fetch, which requires a local server.

---

*Sara Bower · San Francisco · June 2026*
