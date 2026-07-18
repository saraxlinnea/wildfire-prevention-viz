# Claim registry — live page

Tracks every empirical and editorial statement on the public visualization.  
Follows [AI-OS Claim Tracking Layer](https://github.com/saraxlinnea/AI-OS/blob/main/CORE/CLAIM_TRACKING_LAYER.md) and [Evidence Standard](https://github.com/saraxlinnea/AI-OS/blob/main/CORE/EVIDENCE_STANDARD.md).

**Live page:** [saraxlinnea.github.io/wildfire-prevention-viz](https://saraxlinnea.github.io/wildfire-prevention-viz)  
**Last audited against:** 2026-07-13 fact-check pass ([`fact-check-log.md`](fact-check-log.md))  
**Update rule:** Any new copy on `index.html` must get a claim ID here before publish.

---

## Status legend

| Status | Meaning |
|---|---|
| **Supported** | Directly verified from cited primary or secondary source |
| **Partially supported** | Directionally correct; rounding, scope mismatch, or single-source dependency |
| **Speculative** | Forecast or projection, not observed data |
| **Editorial** | Interpretive framing; depends on listed claim IDs |
| **Excluded** | Explicitly not claimed on the page |
| **Methodological** | Scope or limitation statement, not a finding |

**Confidence:** High / Medium / Low (qualitative, per Evidence Standard)

---

## Fire outcomes (national)

### C-F01 — 2026 YTD acres burned

| Field | Value |
|---|---|
| **Normalized statement** | U.S. national acres burned from Jan 1 through July 16, 2026 equals 3,674,911 acres |
| **Display text** | "more than **3.6 million acres**" / callout **3.7M** |
| **Page location** | Header dek; Outcomes callouts; How to read methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (agency operational reporting) |
| **Sources** | [NIFC National Fire News, July 16 2026](https://www.nifc.gov/fire-information/nfn); `data/wildfire-data.csv` row 2026 |
| **Limitations** | Partial calendar year only; not comparable to full-year bars |

---

### C-F02 — 2026 YTD vs 10-year average (percent above)

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned through July 16 is approximately 29% above the 10-year YTD average for the same date (10-yr avg ≈ 2,845,121 acres from NIFC 2016-2025 same-date rows) |
| **Display text** | "**29% above the 10-year average** to date" |
| **Page location** | Header dek; Outcomes callout |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (NIFC published same-date table; average derived from listed years) |
| **Sources** | NIFC National Fire News, July 16 2026 |
| **Limitations** | Comparison is YTD-to-YTD, not full-year; NFN 10-year average cell was blank on fetch—computed from published year rows |

---

### C-F03 — 2026 YTD vs 10-year average (ratio)

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned is about 129% of the 10-year average YTD acres burned (same date, July 16) |
| **Display text** | (not on callouts; equivalent to C-F02) |
| **Page location** | Claim registry / derived from C-F02 |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC National Fire News, July 16 2026 |
| **Notes** | 129% of average ≡ 29% above average (C-F02); both from same NIFC table |

---

### C-F04 — 2026 YTD rank vs prior years

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned through July 16 ranks third in NIFC's same-date comparison table; 2022 same-date YTD was about 5.2 million acres (highest) and 2017 about 4.4 million (second) |
| **Display text** | "3rd" / "behind 2022 (~5.2M) and 2017 (~4.4M)" |
| **Page location** | Outcomes callouts; How to read policy context |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC National Fire News YTD table, July 16 2026 |

---

### C-F05 — NIFC standardized reporting start year

| Field | Value |
|---|---|
| **Normalized statement** | NIFC national acres-burned statistics are comparable from calendar year 1983 onward |
| **Display text** | "National acres burned start in 1983" / "Standardized reporting from 1983" |
| **Page location** | Intro block; Interpretation tab methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (documented NIFC methodology) |
| **Sources** | [NIFC Total Wildfires and Acres](https://www.nifc.gov/fire-information/statistics) |

---

### C-F06 — Pre-1983 acres not comparable

| Field | Value |
|---|---|
| **Normalized statement** | NIFC acres-burned figures before 1983 use non-comparable reporting methods |
| **Display text** | "pre-1983 figures are not comparable" |
| **Page location** | Interpretation tab methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC documentation |

---

### C-F07 — CRS ten-year average (reference only)

| Field | Value |
|---|---|
| **Normalized statement** | Mean U.S. acres burned for calendar years 2013–2022 was 7.2 million acres per year |
| **Display text** | (no longer on fire chart; retained in `wildfire-data.csv` column `ten_year_avg_millions`) |
| **Page location** | Data file and footer; superseded on chart by C-F09 rolling band |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate (CRS summary of NIFC data) |
| **Sources** | [CRS IF10244](https://crsreports.congress.gov/product/pdf/IF/IF10244) |
| **Limitations** | Flat figure; not a rolling average; ends 2022 |

---

### C-F09 — Rolling ten-year baseline band

| Field | Value |
|---|---|
| **Normalized statement** | For each calendar year with ten prior full years of NIFC data, the fire chart shows the min-to-max range of acres burned in those ten prior years; band begins in 1993 |
| **Display text** | "Prior 10-year range" / "Shaded band shows the min-to-max range of the prior ten full calendar years" |
| **Page location** | Fire tab legend, panel note; Interpretation tab methodology |
| **Status** | Methodological |
| **Confidence** | High |
| **Evidence strength** | Computed from NIFC annual statistics in `data/wildfire-data.csv` |
| **Sources** | [NIFC Total Wildfires and Acres](https://www.nifc.gov/fire-information/statistics); chart JavaScript |
| **Limitations** | Trailing window only; not YTD-comparable; distinct from NIFC's YTD 10-year average in C-F02 |

---

### C-F10 — Percent deviation from rolling ten-year average

| Field | Value |
|---|---|
| **Normalized statement** | Chart toggle shows each year's acres burned as percent above or below the mean of the ten prior full calendar years |
| **Display text** | "% from 10-yr avg" toggle |
| **Page location** | Fire tab chart toggle |
| **Status** | Methodological |
| **Confidence** | High |
| **Evidence strength** | Derived from same rolling window as C-F09 |
| **Sources** | Chart JavaScript |
| **Limitations** | Full-year acres only; 2026 YTD point uses 2016–2025 window for comparison |

---

### C-F08 — 2026 full-year forecast range

| Field | Value |
|---|---|
| **Normalized statement** | AccuWeather projects 5.5 to 8.0 million U.S. acres burned in calendar year 2026 if current conditions hold |
| **Display text** | "**5.5-8M**" / "AccuWeather projects 5.5 to 8 million acres" |
| **Page location** | Fire tab legend; Interpretation tab callouts, prose, methodology |
| **Status** | Speculative |
| **Confidence** | Low |
| **Evidence strength** | Speculative (commercial forecast, conditional language) |
| **Sources** | [AccuWeather 2026 Wildfire Season Forecast](https://www.accuweather.com/en/press/larger-wildfires-fueled-by-drought-and-heat-expected-across-the-u-s-in-2026/1884295) |
| **Limitations** | Not NIFC official; scenario-dependent; must not be read as observed data |

---

### C-F11 — Peak fire season timing

| Field | Value |
|---|---|
| **Normalized statement** | U.S. wildfire activity typically peaks in summer months |
| **Display text** | "Peak western fire season is underway (historically concentrated in July–September)" |
| **Page location** | Header dek; How to read |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Evidence strength** | Moderate (general climatology; not sourced inline on page) |
| **Sources** | Implicit NIFC seasonal patterns; widely documented |
| **Limitations** | Regional variation not stated; mid-season wording updated 2026-07-16 (was “ahead”) |

---

## Federal prevention (hazardous fuels treatment)

### C-P01 — FS treatment acres 2025

| Field | Value |
|---|---|
| **Normalized statement** | U.S. Forest Service treated 2.6 million acres for wildfire risk in calendar year 2025 |
| **Display text** | "treated 2.6 million acres for wildfire risk" (2025) |
| **Page location** | Interpretation tab policy context |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate (journalistic analysis of agency database) |
| **Sources** | [NPR USFS FACTS analysis, May 4 2026](https://www.npr.org/2026/05/04/nx-s1-5801475/); cross-check [Center for Western Priorities, May 27 2026](https://westernpriorities.org/2026/05/u-s-forest-service-treated-35-fewer-acres-for-wildfire-risk-in-2025/) |
| **Limitations** | FS series comparable only from 2023 onward (C-P04) |

---

### C-P02 — FS treatment acres 2024

| Field | Value |
|---|---|
| **Normalized statement** | U.S. Forest Service treated 4.1 million acres for wildfire risk in calendar year 2024 |
| **Display text** | "down from 4.1 million the year before" |
| **Page location** | Interpretation tab policy context |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate |
| **Sources** | NPR / USFS FACTS; `wildfire-data.csv` (2024: 4.1) |

---

### C-P03 — FS treatment YoY percent change 2024→2025

| Field | Value |
|---|---|
| **Normalized statement** | Forest Service wildfire-risk treatment acres decreased from 4.1M to 2.6M (2024→2025), a ~36.6% decline, displayed as 35% |
| **Display text** | "**35% fewer acres**" / federal-context strip on Drivers |
| **Page location** | Drivers tab `federal-context-strip` (moved off Outcomes, 2026-07-16); Interpretation policy context |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate |
| **Sources** | Derived from C-P01, C-P02; NPR/CWP |
| **Notes** | Exact: (4.1−2.6)/4.1 = 36.6%; page rounds to 35% |

---

### C-P04 — FS treatment series start year

| Field | Value |
|---|---|
| **Normalized statement** | Forest Service treatment figures on this page are consistently reported only from calendar year 2023 |
| **Display text** | "Forest Service figures from 2023" / "Consistent figures from 2023 onward only" |
| **Page location** | Policy tab panel note; Interpretation tab methodology |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | NPR methodology note; page author decision |

---

### C-P05 — Interior treatment reporting basis

| Field | Value |
|---|---|
| **Normalized statement** | Interior Department hazardous fuels treatment is reported on a federal fiscal year basis (Oct 1 start), not calendar year |
| **Display text** | "Interior fuels work is reported from 2018 (fiscal year)" / panel note |
| **Page location** | Policy tab panel note; Interpretation tab methodology |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | [DOI fuels management program](https://www.doi.gov/wildlandfire/fuels) |

---

### C-P06 — Interior treatment scope

| Field | Value |
|---|---|
| **Normalized statement** | Interior treatment figures cover BLM, NPS, BIA, and FWS lands, fiscal years 2018–2024 |
| **Display text** | methodology bullet |
| **Page location** | Interpretation tab methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | DOI fuels program |

---

### C-P07 — HFR joint FS+DOI treatment series (FY 2003-2021)

| Field | Value |
|---|---|
| **Normalized statement** | USDA FS and DOI hazardous fuels treatment totals from the joint HFR-DOI-FS NFPORS report span fiscal years 2003-2021; combined treatment acres FY 2003 ≈ 3.21M, FY 2021 ≈ 5.26M |
| **Display text** | Drivers tab treatment chart (combined total); Coupling research accordion |
| **Page location** | Drivers tab `#chart-policy`; `data/hfr-prevention-annual.csv`; Coupling tab research `<details>` |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | [HFR-DOI-FS Accomplishments 2003-2021](https://www.forestsandrangelands.gov/documents/resources/reports/2021/HFR-DOI-FS-Accomplishments2003-2021.pdf); `scripts/extract_hfr_prevention.py` |
| **Limitations** | Fiscal year; definition shifts in report footnotes; exploratory r ≈ −0.27 vs national acres (not causal) |
| **Related** | C-P04, C-P05, C-P06 |

---

### C-P08 — HFR treatment vs national acres (dual-axis overlap)

| Field | Value |
|---|---|
| **Normalized statement** | Dual-axis chart overlays federal hazardous-fuels treatment (HFR FY 2003-2021 plus page-verified totals 2022-2025) and national acres burned (calendar 2003-2025) on shared year labels; shows temporal co-occurrence only, not that treatment caused fire outcomes |
| **Display text** | Drivers tab "Federal treatment vs national acres burned" panel |
| **Page location** | Drivers tab research `<details>` `#chart-treatment-acres` (demoted from main path) |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | `data/hfr-prevention-annual.csv`; NIFC national acres in `wildfire-data.csv` |
| **Limitations** | HFR fiscal years through 2021; page series for 2022-2025; fiscal vs calendar mismatch; weak exploratory r in repository notes is not causal evidence |
| **Related** | C-P07, C-X01 |

---

### C-R07 — Pre-2010 regional GACC acres (2003-2012 continuous)

| Field | Value |
|---|---|
| **Normalized statement** | Regional GACC acres cover 2003-2012 continuously: 2003-2006 and 2010-2012 lightning+human PDF text; 2007 multiyear text totals; 2008-2009 hand transcription of lightning+human chart pages (summed) |
| **Display text** | Repository + Patterns research accordion |
| **Page location** | `data/regional-acres-annual.csv`, `data/pre2010-acres-notes.md`; `western-acres-annual.csv` 23 years |
| **Status** | Supported |
| **Confidence** | Medium-High |
| **Limitations** | 2007 uses total wildfire acres text table, not lightning+human; 2008-2009 are hand-OCR (not machine PDF text) |
| **Related** | C-R01, C-W01, C-R06 |

---

## Drought (DSCI)

### C-D01 — DSCI data availability

| Field | Value |
|---|---|
| **Normalized statement** | U.S. Drought Monitor DSCI weekly statistics used for annual averages begin in calendar year 2000 |
| **Display text** | "2000 onward" (atmosphere tab drought panel note) |
| **Page location** | Atmosphere tab drought panel note |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | [U.S. Drought Monitor API](https://usdmdataservices.unl.edu/api/USStatistics/GetDSCI?aoi=conus) |

---

### C-D02 — DSCI 2026 partial-year values

| Field | Value |
|---|---|
| **Normalized statement** | 2026 DSCI values are 28-week averages through July 14, 2026 (national 169.9; western 156.0); annual DSCI on this page is a year-to-date (or full-year) average of weekly USDM readings |
| **Display text** | Drivers glossary / dryness plain-read: “year-to-date average of weekly… readings”; methodology: 28-week averages through July 14 |
| **Page location** | Drivers tab terms + dryness chart; How to read glossary/methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | `data/dsci-annual-averages.csv`, `data/dsci-western-annual.csv`; USDM API pulls 2026-07-16 |

---

### C-D03 — Western vs national DSCI on same chart

| Field | Value |
|---|---|
| **Normalized statement** | National (conus) and NWS Western Region DSCI are displayed together; western region covers much of U.S. fire-season geography |
| **Display text** | "National vs western DSCI (raw index)" secondary view |
| **Page location** | Atmosphere tab collapsible secondary chart |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Notes** | Geographic overlap statement is directionally true; not a quantitative claim |

---

## Western VPD

### C-V01 — VPD series definition

| Field | Value |
|---|---|
| **Normalized statement** | Western U.S. mean fire-season VPD is computed for May–September, west of 100°W, from gridMET, years 1979–2025; on the Drivers tab VPD is defined as atmospheric “thirst” (temperature + humidity), not a fire model |
| **Display text** | Drivers tab definition list; VPD panel note and methodology |
| **Page location** | Drivers tab; Interpretation tab methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (published dataset + peer-reviewed gridMET paper) |
| **Sources** | [gridMET](http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/); [Abatzoglou 2013](https://doi.org/10.1002/joc.3413); `data/vpd-annual.csv` |

---

### C-V03 — ERC series definition

| Field | Value |
|---|---|
| **Normalized statement** | Western U.S. mean fire-season ERC (Energy Release Component) is computed for May–September, west of 100°W, from gridMET NFDRS fuel model G, years 1979–2025; on the Drivers tab ERC is defined as potential energy release given fuel dryness (no wind/slope) |
| **Display text** | Drivers tab definition list; ERC panel toggle, methodology, Coupling scatter |
| **Page location** | Drivers tab atmosphere chart; Coupling tab; methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (gridMET derived fire-danger index; Abatzoglou 2013) |
| **Sources** | [gridMET ERC](http://thredds.northwestknowledge.net/thredds/dodsC/MET/erc/); `data/erc-annual.csv`; `scripts/extend_erc.py` |
| **Related** | C-V01, C-W03, C-Lit01 |

---

### C-Lit01 — Literature proxy ranking (ERC ≳ VPD ≫ drought)

| Field | Value |
|---|---|
| **Normalized statement** | Published western U.S. fire–climate studies treat short-term fire-danger indices (especially ERC) and fire-season VPD as stronger annual burned-area proxies than longer-timescale drought indices such as PDSI; the page ranks ERC, then VPD, then DSCI/drought accordingly and does not claim literature r equals this repository’s Pearson r |
| **Display text** | Coupling tab “Proxy ranking (literature → this page)” table |
| **Page location** | Coupling tab |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong for relative ordering; methods differ across papers |
| **Sources** | [Riley et al. 2013](https://research.fs.usda.gov/treesearch/49353); [Williams et al. 2015](https://doi.org/10.1071/WF14023); [Abatzoglou & Williams 2016](https://doi.org/10.1073/pnas.1607171113) |
| **Limitations** | Papers use different years, forest vs all-land burned area, percentiles, and windows; page r column is this repository only (C-W02, C-W03, C-C04) |
| **Related** | C-V01, C-V03, C-W02, C-W03, C-X05, C-M06 |

---

### C-W03 — Western acres vs western ERC correlation

| Field | Value |
|---|---|
| **Normalized statement** | Pearson correlation between western fire-season ERC and western GACC acres burned for 2010-2025 is approximately 0.82 (repository value 0.821) |
| **Display text** | "Western acres burned vs western ERC" r = 0.82; scatter default ERC driver |
| **Page location** | Coupling tab correlation table and scatter |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | High for this bivariate window (exploratory only) |
| **Sources** | `data/correlation-matrix.csv`; `scripts/compute_correlations.py` |
| **Limitations** | Exploratory; n = 16; ERC and VPD are collinear (r ≈ 0.94); not causal |
| **Related** | C-W02, C-V03, C-X05 |

---

### C-V02 — VPD geographic mismatch with national fire data

| Field | Value |
|---|---|
| **Normalized statement** | Western VPD is not geographically comparable to national acres-burned totals |
| **Display text** | "National acres burned count the whole country. Western dryness, not a national match." |
| **Page location** | Atmosphere tab panel note |
| **Status** | Methodological |
| **Confidence** | High |

---

## Cross-panel / epistemic

### C-X01 — No causal claim across panels

| Field | Value |
|---|---|
| **Normalized statement** | The page does not assert that any chart series caused any other chart series |
| **Display text** | "This page does not claim one line caused another" / methodology closing |
| **Page location** | Intro block; Interpretation tab methodology closing |
| **Status** | Excluded (explicit non-claim) |
| **Confidence** | High |
| **AI-OS note** | Prevents upgrade of temporal co-occurrence to causation per Evidence Standard §7 |

---

### C-X02 — Prevention cut ≠ 2026 fire season cause

| Field | Value |
|---|---|
| **Normalized statement** | The page does not assert that reduced 2025 Forest Service treatment caused 2026 fire outcomes |
| **Display text** | "not claiming that cutting prevention in 2025 caused the 2026 fire season" |
| **Page location** | Interpretation tab methodology closing |
| **Status** | Excluded (explicit non-claim) |
| **Related rejected claim** | See C-X03 |

---

### C-X03 — REJECTED: Prevention cuts caused 2026 fires

| Field | Value |
|---|---|
| **Normalized statement** | Reduced 2025 FS treatment caused increased 2026 acres burned |
| **On page?** | **No** — deliberately excluded |
| **Status** | Unknown / insufficient evidence |
| **Confidence** | Low |
| **Why excluded** | No causal identification; different geographies and lag structure; only temporal overlap |
| **Evidence against treating as supported** | Correlation study is exploratory and off-page (`data/correlation-notes.md`) |

---

### C-X04 — Panels use mismatched timelines

| Field | Value |
|---|---|
| **Normalized statement** | Fire, atmosphere, policy, and interpretation use separate tabs because series differ in geography, calendar, and reporting period |
| **Display text** | intro block (four tabs) |
| **Page location** | Intro block |
| **Status** | Methodological |
| **Confidence** | High |

---

### C-X05 — Correlations on page as exploratory coupling

| Field | Value |
|---|---|
| **Normalized statement** | Pairwise correlation and lag-aligned views appear on the Coupling tab as exploratory coupling; they are not presented as causal findings |
| **Display text** | "Exploratory coupling views. Correlation is not causation." / methodology correlations bullet |
| **Page location** | Coupling tab intro; scatter, lag, and policy scatter charts; How to read methodology |
| **Status** | Methodological |
| **Sources** | `notebooks/correlation-analysis.ipynb`, `data/correlation-matrix.csv`, `data/correlation-notes.md` |
| **Related** | C-C01, C-C02, C-C03 |

---

### C-C01 — Western VPD vs national acres burned correlation (2010-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Pearson correlation between western fire-season VPD and national acres burned for full calendar years 2010-2025 is approximately 0.63 (repository value 0.625) |
| **Display text** | "Pearson r ≈ 0.63" / chart annotation "Pearson r ≈ 0.63 (exploratory)" |
| **Page location** | Coupling tab correlation table and scatter panel note |
| **Status** | Supported (derived) |
| **Confidence** | High |
| **Sources** | `data/correlation-matrix.csv`; `scripts/compute_correlations.py` |
| **Limitations** | National acres vs western VPD geography mismatch; exploratory only; partial years excluded |

---

### C-C04 — Correlation table (2010-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Pearson r for key pairs in 2010-2025 window: western acres vs western ERC 0.82 (0.821); western acres vs western VPD 0.81 (0.808); national acres vs western ERC 0.53 (0.532); national acres vs western VPD 0.63 (0.625); acres vs national DSCI 0.10 (0.097); western acres vs western DSCI 0.08 (0.075); western VPD vs ERC 0.94 (0.944); western VPD vs national DSCI 0.56 (0.560); national vs western DSCI 0.73 (0.734) |
| **Display text** | Coupling tab correlation table |
| **Page location** | Coupling tab |
| **Status** | Supported (derived) |
| **Confidence** | High |
| **Sources** | `data/correlation-matrix.csv` |
| **Limitations** | Rounded for display; exploratory only |

---

### C-C02 — Annual lag proxy limitation

| Field | Value |
|---|---|
| **Normalized statement** | Lag view aligns western VPD in year t with national acres burned in year t+1; annual resolution cannot resolve sub-seasonal lag |
| **Display text** | "Annual data cannot resolve sub-seasonal lag." |
| **Page location** | Coupling tab supplementary `<details>` lag chart panel note |
| **Status** | Methodological |
| **Confidence** | High |

---

### C-C03 — FS treatment vs fire scatter sample size

| Field | Value |
|---|---|
| **Normalized statement** | Forest Service treatment vs following-year acres burned scatter has at most three year pairs (2023-2025 treatment years); 2026 outcome may be partial |
| **Display text** | "FS figures comparable from 2023 only (three pairs)" / "n = 3 FS year pairs (2023-2025)" |
| **Page location** | Coupling tab collapsible policy scatter |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-P04, C-X01 |

---

### C-A01 — Atmospheric z-score overlay

| Field | Value |
|---|---|
| **Normalized statement** | Western VPD and western DSCI are shown on a common z-score axis for overlapping years 2000-2025; 2026 partial DSCI excluded from z-scores |
| **Display text** | Atmosphere tab panel note |
| **Page location** | Drivers tab primary chart |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-V01, C-D01 |

---

### C-P07 — Combined federal treatment total

| Field | Value |
|---|---|
| **Normalized statement** | Policy chart default view uses HFR joint FS+DOI totals FY 2003-2021, then page-verified FS (calendar) and Interior (fiscal) for 2022-2025 where reported; sum is approximate because calendars and sources differ |
| **Display text** | Policy tab panel note; "Combined total" toggle |
| **Page location** | Policy tab |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-P04, C-P05 |

---

## Context / policy (non-chart)

### C-RS01 — USDA research station reorganization

| Field | Value |
|---|---|
| **Normalized statement** | USDA announced plans in March 2026 to close 57 of 77 Forest Service research stations |
| **Display text** | prose block / methodology |
| **Page location** | How to read tab policy context, methodology |
| **Status** | Supported |
| **Confidence** | Medium |
| **Evidence strength** | Moderate (news reporting of agency plan) |
| **Sources** | [Stateline, April 17 2026](https://stateline.org/2026/04/17/forest-service-plan-to-close-research-stations-stokes-fear-as-wildfire-season-approaches/) |
| **Limitations** | Plan announced; closure outcome may change |
| **Notes** | Renamed from C-R01 (2026-07-13) to avoid collision with regional GACC claim C-R01 |

---

### C-RS02 — Research stations study fire and smoke

| Field | Value |
|---|---|
| **Normalized statement** | Stateline reports that affected Forest Service research stations include work on fire behavior and smoke forecasting |
| **Display text** | "Stateline reports that affected stations include work on fire behavior and smoke forecasting" |
| **Page location** | How to read tab policy context |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Sources** | [Stateline, April 17 2026](https://stateline.org/2026/04/17/forest-service-plan-to-close-research-stations-stokes-fear-as-wildfire-season-approaches/) |
| **Limitations** | Qualitative; attributed to Stateline reporting, not independently counted |
| **Notes** | Renamed from C-R02 (2026-07-13); softened uncounted "many" |

---

### C-RS03 — Franklin prevention quote

| Field | Value |
|---|---|
| **Normalized statement** | Benjamin Franklin wrote "an ounce of prevention is worth a pound of cure" in 1735 urging Philadelphia fire prevention |
| **Display text** | (removed from live page 2026-07-06) |
| **Page location** | Off page |
| **Status** | Supported (historical) |
| **Confidence** | High |
| **Sources** | Historical letter, widely cited |
| **Notes** | Retired with editorial quote block; renamed from C-R03 (2026-07-13) |

---

### C-X06 — How to read this framing

| Field | Value |
|---|---|
| **Normalized statement** | The page presents observed series on mismatched geographies and calendars; temporal overlap is not presented as causal evidence |
| **Display text** | "What this is" / "What it is not" / "How to compare" (How to read tab) |
| **Page location** | How to read tab, How to read this |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-X01, C-X02, C-F09 vs C-F02 distinction in fire tab note |

---

## Methodological / interpretive (Phase A copy)

### C-M01 — YTD acres do not predict full-year total

| Field | Value |
|---|---|
| **Normalized statement** | Early-season (YTD) acres burned are not a reliable predictor of the full calendar-year total |
| **Display text** | "Early-season acres do not predict the full-year total" |
| **Page location** | Outcomes tab fire chart caption (In context) |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-F04 (2022 YTD highest, not necessarily full-year record) |

---

### C-M02 — Pearson r² interpretation (VPD vs acres)

| Field | Value |
|---|---|
| **Normalized statement** | Pearson r ≈ 0.81 between western VPD and western GACC acres burned implies roughly 65% of variance explained (r² ≈ 0.65); national acres pairing remains r ≈ 0.63 / r² ≈ 0.39 |
| **Display text** | Coupling tab correlation "In context" (western acres r² ≈ 0.65) |
| **Page location** | Coupling tab correlation table caption |
| **Status** | Methodological |
| **Confidence** | High |
| **Evidence strength** | Mathematical derivation from C-W02 / C-C01 |
| **Related** | C-W02, C-C01, C-X05 |

---

### C-M03 — Correlation window sample size

| Field | Value |
|---|---|
| **Normalized statement** | Pairwise Pearson correlations on the Coupling tab use n = 16 full calendar years (2010–2025); partial 2026 excluded |
| **Display text** | "n = 16 full calendar years" / "Sixteen full calendar years (2010-2025)" |
| **Page location** | Coupling tab dek, correlation panel note |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | `data/correlation-matrix.csv`, `scripts/compute_correlations.py` |
| **Related** | C-C04 |

---

### C-M04 — VPD vs DSCI measure different processes

| Field | Value |
|---|---|
| **Normalized statement** | VPD measures physical atmospheric dryness; DSCI measures modeled drought stress from USDM categories; they can diverge (e.g., wet spring, dry soils) |
| **Display text** | Drivers intro block; atmosphere chart caption (In context) |
| **Page location** | Drivers tab intro; atmosphere chart |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-A01, C-V01, C-D03 |

---

### C-M05 — Treatment acres ≠ hazard reduction

| Field | Value |
|---|---|
| **Normalized statement** | Federal hazardous-fuels acres treated are a measure of reported work, not proven reduction in fire risk or outcomes; effects can lag and depend on location and treatment type |
| **Display text** | "Acres treated are not the same as risk reduced" / policy chart In context |
| **Page location** | Drivers tab intro; policy chart caption |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-P07, C-X01, C-X02 |

---

### C-M06 — National DSCI dilutes western fire signal

| Field | Value |
|---|---|
| **Normalized statement** | Contiguous-U.S. DSCI averages drought nationally, which can dilute western fire-season extremes; weaker correlation with national acres (r ≈ 0.10) vs western VPD (r ≈ 0.63) is consistent with western concentration of fire activity |
| **Display text** | National DSCI details caption: drought useful for water/veg stress; weaker acres match than ERC/VPD; Coupling ranks pairings next |
| **Page location** | Drivers tab national DSCI `<details>`; Coupling tab |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Evidence strength** | Moderate (correlation pattern + geographic reasoning) |
| **Related** | C-C04, C-D03, C-V02 |

---

### C-W01 — Western GACC acres series (2010-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Western acres burned are the sum of NICC Geographic Area Coordination Center (GACC) acres for NW, NR, GB, RM, SW, NO, and SO; for 2010-2012 EB and WB replace GB (pre-merge). Series spans calendar years 2010-2025. |
| **Display text** | Western acres / western GACC acres in Coupling scatter toggle and correlation table |
| **Page location** | Coupling tab; Outcomes western vs national chart |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | High (NICC annual report tables) |
| **Sources** | NICC annual reports (`scripts/build_western_acres.py`); `data/western-acres-annual.csv`; `data/nicc-gacc-acres-source.csv` |
| **Limitations** | 2010-2012 derived from lightning+human GACC acres (validated against 2015 total); GACC boundaries ≠ gridMET west-of-100°W VPD mask; excludes AK, EA, SA |

---

### C-R01 — Regional GACC acres series (2010-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Regional NICC GACC acres burned are summed by group: West (NW, NR, GB, RM, SW, NO, SO; EB+WB pre-2015), East (EA), South (SA), Alaska (AK), and national total (all ten GACCs when present). Years 2003-2012 from legacy PDF extracts plus 2008-2009 hand OCR; 2013+ from text tables. |
| **Display text** | Coupling regional accordion (shares); full series in repository CSVs |
| **Page location** | `data/regional-acres-annual.csv`; Coupling tab regional `<details>`; built by `scripts/build_western_acres.py` |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | High (NICC annual report tables; national GACC sum ≈ NIFC national acres 2013-2025 within ~0.04M) |
| **Sources** | `data/regional-acres-annual.csv`; `data/nicc-gacc-acres-source.csv`; `scripts/build_western_acres.py` |
| **Limitations** | 2010-2012 lack EA/SA/AK; GACC ≠ state census geography; regional table is summary only |
| **Related** | C-W01, C-M07 |

---

### C-R02 — Regional gridMET driver series (west, south, east)

| Field | Value |
|---|---|
| **Normalized statement** | Regional fire-season VPD and ERC from gridMET: west May-Sep west of 100°W (copied from vpd/erc annual); south Jan-Apr bbox lon -106 to -81 lat 25-36; east Mar-Jun bbox lon -90 to -68 lat 37-47. Alaska not in gridMET (lat max ~49.4°N). |
| **Display text** | Repository artifacts only |
| **Page location** | `data/regional-gridmet-annual.csv`; `scripts/extend_regional_indices.py` |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | gridMET OPeNDAP; `scripts/extend_regional_indices.py` |
| **Limitations** | Bboxes approximate GACC geography; south/east seasons are research defaults; not on live page |
| **Related** | C-R01, C-R03 |

---

### C-R03 — Regional correlation ranks (2013-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Exploratory Pearson r between regional GACC acres and regional drivers for 2013-2025 (n=13): west acres vs ERC 0.83, vs VPD 0.77, vs DSCI −0.01; south vs VPD 0.36, vs fm100 −0.18, vs ERC 0.17, vs DSCI −0.14; east vs DSCI 0.81, vs VPD 0.49, vs ERC 0.17; Alaska acres vs DSCI 0.51 (gridMET unavailable) |
| **Display text** | Coupling tab accordion "Regional GACC breakdown (research extension, n = 13)" |
| **Page location** | Coupling tab `<details>` regional table; `data/regional-correlation-rank.csv`; `scripts/compute_regional_correlations.py` |
| **Status** | Supported (derived) |
| **Confidence** | Medium |
| **Limitations** | n=13; exploratory; east acres small share (~1.5% median); Alaska without gridMET; not causal |
| **Related** | C-R01, C-R02, C-R04, C-X05 |

---

### C-R04 — Regional NWS DSCI series (east, south, alaska + west merge)

| Field | Value |
|---|---|
| **Normalized statement** | Annual average DSCI from USDM NWSRegionStatistics GetDSCI for Eastern (aoi=ER), Southern (SR), Alaska (AR), merged with western (WR) in `regional-dsci-annual.csv` |
| **Display text** | Repository + Coupling regional accordion source links |
| **Page location** | `data/regional-dsci-annual.csv`, `data/dsci-eastern-annual.csv`, `data/dsci-southern-annual.csv`, `data/dsci-alaska-annual.csv`; `scripts/fetch_regional_dsci.py` |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | USDM API; western column from `dsci-western-annual.csv` |
| **Limitations** | Calendar-year average of weekly DSCI; NWS region boundaries ≠ GACC geography |
| **Related** | C-D02, C-R03 |

---

### C-R05 — Southeast Jan-Apr 100-hr fuel moisture (fm100)

| Field | Value |
|---|---|
| **Normalized statement** | gridMET mean 100-hour dead fuel moisture (%) for Southeast bbox lon −106 to −81, lat 25–36, Jan–Apr, 2010–2025. Southern GACC acres vs fm100 Pearson r ≈ −0.18 (n=13); does not beat VPD (r ≈ 0.36) |
| **Display text** | Coupling regional accordion south row (fm100 second driver) |
| **Page location** | `data/south-fm100-annual.csv`; `scripts/extend_fm100.py` |
| **Status** | Supported (derived) |
| **Confidence** | Medium |
| **Limitations** | Negative r expected (drier fuels); weak magnitude; n=13; exploratory |
| **Related** | C-R02, C-R03 |

---

### C-R06 — Regional GACC share time series (2003-2025)

| Field | Value |
|---|---|
| **Normalized statement** | Stacked 100% chart of NICC GACC regional shares of national GACC acres burned: West, South, Alaska, East for years with `gacc_coverage=all_gaccs` (2003-2025 continuous; 2008-2009 from hand OCR) |
| **Display text** | Patterns / Outcomes "Who carried the national total?" regional share chart |
| **Page location** | Outcomes tab `#chart-regional-share-outcomes`; Patterns `#chart-regional-share`; `data/regional-acres-annual.csv` |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | `data/regional-acres-annual.csv`; NICC annual reports; `data/gacc-2008-2009-hand-extract-template.csv` |
| **Limitations** | GACC sum ≈ NIFC national when all ten GACCs present; 2008-2009 hand transcription |
| **Related** | C-R01, C-M07, C-R07 |

---

### C-R08 — Monthly western VPD vs acres (repository research)

| Field | Value |
|---|---|
| **Normalized statement** | gridMET western May and March-May mean VPD (2010-2025, n=16) vs calendar-year acres: May VPD vs western GACC acres Pearson r ≈ 0.496; Mar-May vs western acres r ≈ 0.544; fire-season VPD vs western acres r ≈ 0.808 (same window); May VPD year t vs western acres t+1 r ≈ −0.54 (n=15). Outcome is still calendar-year burn totals, not summer-only acres |
| **Display text** | Coupling research accordion row; `data/vpd-monthly-correlation-notes.md` |
| **Page location** | Repository only (not main charts); `data/vpd-monthly-annual.csv`; `scripts/extend_vpd_monthly.py`; `scripts/compute_vpd_monthly_correlations.py` |
| **Status** | Supported (derived) |
| **Confidence** | Medium |
| **Limitations** | Exploratory; May and fire-season VPD highly correlated; no monthly burn data for true summer-acres test; not causal |
| **Related** | C-V01, C-W02, C-C02, C-X05 |

---

### C-R09 — HFR WUI vs non-WUI designation acres (repository research)

| Field | Value |
|---|---|
| **Normalized statement** | HFR-DOI-FS WUI and Non-WUI columns are designation acres from the same prevention tables (FY 2003-2021). Median WUI share of designation acres ≈ 59.0%. Exploratory Pearson r (WUI share vs national acres, same FY label) ≈ 0.202 (n=19); combined WUI acres vs national acres r ≈ 0.003; combined treatment vs national acres r ≈ −0.135 |
| **Display text** | Drivers WUI share chart; median 59%; FY 2003-2021 |
| **Page location** | Drivers tab WUI chart; `data/hfr-wui-notes.md` |
| **Status** | Supported (derived) |
| **Confidence** | Medium |
| **Limitations** | WUI designation ≠ homes protected or treatment effectiveness; fiscal vs calendar year mismatch for acres; not causal |
| **Related** | C-P07, C-X05 |

---

### C-R10 — NICC lightning vs human cause acres (repository research)

| Field | Value |
|---|---|
| **Normalized statement** | NICC annual report GACC Total columns for lightning vs human caused acres burned extracted for 2003-2006, 2010-2012 (n=7 on ignition chart); median lightning share ≈ 61%; 2007 has percent-only cause tables; 2008-2009 lightning+human pages were hand-read for regional GACC totals but ignition chart remains n=7 (cause share series not extended) |
| **Display text** | Coupling supplementary ignition stacked bar; median lightning share ≈ 61% |
| **Page location** | Coupling tab supplementary `<details>`; `data/ignition-cause-notes.md` |
| **Status** | Supported (derived) |
| **Confidence** | Medium |
| **Limitations** | Initial cause only; GACC totals may differ from NIFC national series; incomplete year window; not causal |
| **Related** | C-X05 |

---

### C-R11 — Correlation sensitivity windows (repository research)

| Field | Value |
|---|---|
| **Normalized statement** | Alternate Pearson r windows for western acres vs ERC/VPD: 2010-2025 (r ≈ 0.821 / 0.808, n=16); 2013-2025 (r ≈ 0.833 / 0.765, n=13); excl. 2020 (r ≈ 0.773 / 0.778, n=15) |
| **Display text** | Coupling supplementary sensitivity table |
| **Page location** | Coupling tab supplementary details; `data/correlation-sensitivity.csv` |
| **Status** | Methodological |
| **Confidence** | High |
| **Related** | C-W02, C-W03, C-X05 |

---

### C-W02 — Western acres vs western VPD correlation

| Field | Value |
|---|---|
| **Normalized statement** | Pearson correlation between western fire-season VPD and western GACC acres burned for 2010-2025 is approximately 0.81 (repository value 0.808) |
| **Display text** | "Western acres burned vs western VPD" r = 0.81; scatter default western mode |
| **Page location** | Coupling tab correlation table and scatter |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | High for this bivariate window (exploratory only) |
| **Sources** | `data/correlation-matrix.csv`; `scripts/compute_correlations.py` |
| **Limitations** | Exploratory; n = 16; not causal; still imperfect geography match to VPD mask |
| **Related** | C-C01, C-X05, C-W01 |

---

### C-M07 — Western concentration of U.S. fire acres

| Field | Value |
|---|---|
| **Normalized statement** | In most years the majority of U.S. GACC acres burned occur in western GACCs (median western share ≈ 60% of the national GACC sum for 2003-2025, n=23); western-led national years include 2020 and 2021 (western share ≈ 92% and 87%); Alaska-heavy years include 2004, 2009, and 2019 (Alaska ≈ 81%, 50%, and 54% of national GACC acres) so national totals rose while western acres stayed lower |
| **Display text** | Outcomes briefing + nested bars (national shell, western fill); median western share ≈ 60%; 2020/2021 both high; 2004/2009/2019 national rises with western lower |
| **Page location** | Outcomes tab `#chart-western-acres-outcomes`; Patterns western acres + regional share; How to read Start here |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | High (quantified via NICC GACC sums in `data/regional-acres-annual.csv`) |
| **Sources** | NICC annual reports via `scripts/build_western_acres.py`; `data/regional-acres-annual.csv`; 2008-2009 hand OCR |
| **Limitations** | "Western" here means seven GACCs, not a state census definition; Outcomes national reference line uses NIFC national acres alongside GACC western series |
| **Related** | C-W01, C-R06 |

---

## Phase 2 backlog (excluded until data)

### C-P2-01 — Monthly burn acres (deferred)

| Field | Value |
|---|---|
| **Normalized statement** | True May-dry → summer-burn tests require monthly (or summer-only) burn acres; this page does not yet publish that series |
| **Display text** | How to read gaps; `monthly-burn-gap-notes.md` |
| **Page location** | How to read dataset gaps; Phase 2 backlog |
| **Status** | Excluded |
| **Confidence** | n/a |
| **Sources** | Planned: NIFC monthly / MTBS |
| **Related** | C-R08 |

### C-P2-02 — State / ecoregion panels (deferred)

| Field | Value |
|---|---|
| **Normalized statement** | State or ecoregion small multiples are not on the live page; regional GACC share is the shipped geography alternative |
| **Display text** | How to read gaps; `state-ecoregion-research-notes.md` |
| **Page location** | How to read; Phase 2 backlog |
| **Status** | Excluded |
| **Confidence** | n/a |
| **Related** | C-R06, C-M07 |

### C-P2-03 — Ignition cause 2007-2009 gap

| Field | Value |
|---|---|
| **Normalized statement** | NICC ignition cause acres for the supplementary chart remain n=7 (2003-2006, 2010-2012); 2007 percent-only; 2008-2009 pages were used for regional GACC totals but cause-share series was not extended onto the ignition chart |
| **Display text** | Coupling/Patterns supplementary; `ignition-cause-notes.md` |
| **Page location** | Patterns supplementary; Phase 2 backlog |
| **Status** | Supported (as a gap statement) |
| **Confidence** | High |
| **Related** | C-R10 |

---

## Editorial (depends on factual claims)

### C-E01 — Juxtaposition framing

| Field | Value |
|---|---|
| **Statement** | The federal government enters peak fire season with high YTD acres burned and reduced FS treatment vs prior year |
| **Display text** | (removed from live page 2026-07-06) |
| **Page location** | Off page |
| **Status** | Editorial |
| **Depends on** | C-F02, C-P03 |
| **Notes** | Retired with Franklin quote block |

---

### C-E02 — Closing line

| Field | Value |
|---|---|
| **Statement** | Prevention is cheaper than cure (normative economic framing) |
| **Display text** | (removed from live page 2026-07-06) |
| **Page location** | Off page |
| **Status** | Editorial |
| **Notes** | Retired with Franklin quote block |

---

## Page location index

Quick lookup: where each claim appears on `index.html`.

| Location | Claim IDs |
|---|---|
| Header dek | C-F01, C-F02, C-F11 |
| Intro block | C-X01, C-X04 |
| Intro story spine | C-X01 |
| Outcomes tab | C-F01, C-F02, C-F03, C-F04, C-F08, C-F09, C-F10, C-M01, C-M07 |
| Drivers tab | C-A01, C-D01, C-D02, C-D03, C-M04, C-M05, C-M06, C-P04, C-P05, C-P07, C-P08, C-V01, C-V02, C-V03 |
| Drivers tab | C-P01, C-P02, C-P03, C-P04, C-P05, C-P06, C-P07, C-P08, C-V01, C-V02, C-V03, C-R09 |
| Coupling tab (main) | C-X05, C-C01, C-C02, C-C03, C-C04, C-Lit01, C-W01, C-W02, C-W03, C-M02, C-M03, C-M06, C-M07, C-V02, C-V03, C-R06, C-R07 |
| Coupling supplementary | C-R08, C-R10, C-R11 |
| How to read tab | C-X06, C-F04, C-F09, C-F11, C-P01, C-P02, C-F08, C-RS01, C-RS02, C-X01, C-X02, C-M03, C-M04, C-M05, C-M07 |
| How to read methodology | C-F05, C-F06, C-F07, C-P06, C-F08, C-RS01, C-X05 |
| Meta / OG tags | C-F01, C-F02 (twitter description) |

---

## Pre-publish checklist

Before updating the live page:

1. [x] Every new sentence in `index.html` maps to a claim ID or is marked Editorial
2. [x] Numeric claims match `data/wildfire-data.csv` after data refresh
3. [x] Forecast claims (C-F08) remain labeled Speculative in copy
4. [x] No claim upgraded to causal without new identification evidence
5. [x] Run `python scripts/audit_data.py` (data integrity; manual CSV audit 2026-07-04 if env broken)

---

## Changelog

| Date | Change |
|---|---|
| 2026-07-17 | Closed 2008-2009 GACC gap (hand OCR); C-R06/C-R07/C-M07 updated; median western share ≈ 60% (n=23, 2003-2025) |
| 2026-07-16 | Phase 2 scaffold: C-P2-01/02/03; GACC hand-extract template + export script; PAPER_REVIEW Jul 16 pass; byline July 2026 |
| 2026-07-16 | Readability pass: type scale; Outcomes 2+2 callouts; mid-season “underway”; Q→chart→notice→next; Patterns tab label; DSCI YTD-average sentence; collapsed How to read drawers; C-F11 display text |
| 2026-07-16 | Refresh 2026 YTD to NIFC Jul 16 (C-F01–C-F04); DSCI partial through Jul 14, 28 weeks (C-D02) |
| 2026-07-16 | Tiers A-C UI: story rebalance, ignition chart (C-R10), sensitivity table (C-R11), Start here, dataset gaps; C-P03 moved to Drivers; Stateline C-RS01 re-verified |
| 2026-07-12 | HFR prevention FY 2003-2021 (C-P07); pre-2010 GACC acres 2003-2007 (C-R07); 2008-2009 gap documented |
| 2026-07-12 | Extended chart windows: lag 1979-2024; regional share 2003-2025; treatment HFR 2003-2021 + page 2022-2025; western acres chart 2003-2025 |
| 2026-07-12 | Story spine in header; Coupling tab trimmed (scatter first; bar/matrix/lag in supplementary details); dual-axis HFR treatment vs acres on Drivers (C-P08) |
| 2026-07-11 | Southeast fm100 (C-R05); regional GACC share chart (C-R06); south fm100 does not beat VPD |
| 2026-07-11 | Regional Phase 3: NWS regional DSCI (C-R04); Coupling regional accordion (C-R03) |
| 2026-07-11 | Regional Phase 2: C-R02/C-R03; regional gridMET + correlation rank CSVs |
| 2026-07-11 | Regional GACC Phase 1: `regional-acres-annual.csv` (C-R01) |
| 2026-07-09 | Drivers definitions rewrite; Coupling literature proxy ranking (C-Lit01); replication framing for scatters |
| 2026-07-08 | ERC (gridMET fire danger): C-V03, C-W03; Drivers ERC/VPD toggle; Coupling ERC scatter default |
| 2026-07-07 | Phase B: western GACC acres 2010-2025; C-W01/C-W02; Coupling scatter national/western toggle |
| 2026-07-06 | Phase A copy: richer captions, drivers intro, scientific limits, claims C-M01–C-M07 |
| 2026-07-06 | Copy polish: remove Franklin quote, four tabs, neutral framing, deduped interpretation |
| 2026-07-06 | v2 Phase 2-3: merge atmosphere/policy charts, Relationships tab, JS modules, C-X05 revised |
| 2026-07-06 | v2 Phase 1: five-tab layout, rolling 10-yr fire band, % deviation toggle; claims C-F09, C-F10; C-F11 renumber; page locations synced |
| 2026-07-04 | Copy fixes C-F04 (2022 ~3.1M), C-D02 (DSCI through June 16); tighter page margins |
| 2026-07-04 | Structured fact-check pass; see [`fact-check-log.md`](fact-check-log.md) (0 fail, 4 warn) |
| 2026-07-03 | Initial registry from live page (four panels, June 18 YTD) |
