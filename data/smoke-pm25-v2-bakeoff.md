# ECHO smoke v2 bake-off (vs Childs v1)

Live `#chart-smoke-pm25` uses **ECHO v2.0 beta (2006-2023)** as of **2026-08-25** (user OK). Childs v1 remains archived as `smoke-pm25-v1-annual.csv` for this comparison.

Built 2026-08-07 from Dropbox folder zip → `county/smokePM2pt5_predictions_daily_county_20060101-20231231.csv` (~120 MB) via `scripts/build_smoke_v2_beta_annual.py` (same unweighted county-mean method as v1).

- **v1 file (archive):** `smoke-pm25-v1-annual.csv`
- **v2 / live file:** `smoke-pm25-annual.csv` (also `smoke-pm25-v2-beta-annual.csv`)
- **Overlap years compared:** 2006-2020 (n=15)
- **v2 year span:** 2006-2023
- **Mean bias (v2 − v1):** −0.0401 µg/m³ (v2 slightly lower)
- **RMSE:** 0.0447 µg/m³
- **Overlap ratios (v2/v1):** about 0.88–0.94 (no year-scale break)

## Year table (2006-2020 overlap)

| Year | v1 µg/m³ | v2 µg/m³ | ratio (v2/v1) | abs diff |
|---:|---:|---:|---:|---:|
| 2006 | 0.2207 | 0.2014 | 0.913 | -0.0193 |
| 2007 | 0.6127 | 0.5377 | 0.878 | -0.0750 |
| 2008 | 0.2608 | 0.2402 | 0.921 | -0.0206 |
| 2009 | 0.1658 | 0.1510 | 0.911 | -0.0148 |
| 2010 | 0.2566 | 0.2259 | 0.880 | -0.0307 |
| 2011 | 0.6897 | 0.6282 | 0.911 | -0.0615 |
| 2012 | 0.6755 | 0.5989 | 0.887 | -0.0766 |
| 2013 | 0.4337 | 0.4044 | 0.932 | -0.0293 |
| 2014 | 0.2495 | 0.2239 | 0.897 | -0.0256 |
| 2015 | 0.4768 | 0.4316 | 0.905 | -0.0452 |
| 2016 | 0.2402 | 0.2159 | 0.899 | -0.0243 |
| 2017 | 0.5060 | 0.4768 | 0.942 | -0.0292 |
| 2018 | 0.5949 | 0.5537 | 0.931 | -0.0412 |
| 2019 | 0.3848 | 0.3396 | 0.883 | -0.0452 |
| 2020 | 0.7681 | 0.7047 | 0.917 | -0.0634 |

## Post-2020 v2 years (no v1)

| Year | v2 µg/m³ |
|---:|---:|
| 2021 | 1.5117 |
| 2022 | 1.2114 |
| 2023 | 2.4472 |

Qualitative: 2021–2023 CONUS means sit well above the 2006–2019 v2 overlap range (peak overlap year 2011 ≈ 0.63). 2023 is the highest year in the v2 file. That ordering is consistent with a period that included severe western fire seasons and heavy 2023 Canadian smoke influence on eastern CONUS air quality in public reporting; this note does not invent external exposure totals.

## Go / no-go criteria

| Criterion | Result |
|---|---|
| Complete years through ≥2023 | **YES** (2006–2023) |
| Method parity with v1 aggregate | **YES** (smoke-day rows; non-smoke = 0; unweighted county mean of daily means) |
| No wild unexplained level break vs v1 | **PASS** (RMSE ≈ 0.045; systematic ~9% lower, not a reshaped series) |

## Recommendation

**GO (bake-off gate passed).** Wired to live chart **2026-08-25** with claim **C-IMP03** status **Speculative** (ECHO still labels preliminary / subject to change). Do not stitch EPA/AirNow total PM2.5.

### Reproduce

```bash
python scripts/build_smoke_v2_beta_annual.py --local
python scripts/compare_smoke_v2_bakeoff.py
```

Dropbox folder (~8.8 GB zip): [ECHO shared folder](https://www.dropbox.com/scl/fo/91k0aq80vp57qixkm508q/AKQSIJ5C1kDMQLz8oh02UAA?rlkey=nutebc9pn2vsupr0p9ks4k73u&dl=0).
