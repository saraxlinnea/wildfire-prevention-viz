# Claim registry — live page

Tracks every empirical and editorial statement on the public visualization.  
Follows [AI-OS Claim Tracking Layer](https://github.com/saraxlinnea/AI-OS/blob/main/CORE/CLAIM_TRACKING_LAYER.md) and [Evidence Standard](https://github.com/saraxlinnea/AI-OS/blob/main/CORE/EVIDENCE_STANDARD.md).

**Live page:** [saraxlinnea.github.io/wildfire-prevention-viz](https://saraxlinnea.github.io/wildfire-prevention-viz)  
**Last audited against:** 2026-07-04 fact-check pass ([`fact-check-log.md`](fact-check-log.md))  
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
| **Normalized statement** | U.S. national acres burned from Jan 1 through June 18, 2026 equals 2,627,549 acres |
| **Display text** | "more than **2.6 million acres**" / callout **2.6M** |
| **Page location** | Header dek, callouts, prose block, methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (agency operational reporting) |
| **Sources** | [NIFC National Fire News, June 18 2026](https://www.nifc.gov/fire-information/nfn); `data/wildfire-data.csv` row 2026 |
| **Limitations** | Partial calendar year only; not comparable to full-year bars |

---

### C-F02 — 2026 YTD vs 10-year average (percent above)

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned through June 18 is approximately 63% above the 10-year YTD average for the same date |
| **Display text** | "**63% above the 10-year average** to date" |
| **Page location** | Header dek, callout, prose block |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (NIFC published comparison) |
| **Sources** | NIFC National Fire News, June 18 2026 |
| **Limitations** | Comparison is YTD-to-YTD, not full-year |

---

### C-F03 — 2026 YTD vs 10-year average (ratio)

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned is 163% of the 10-year average YTD acres burned (same date) |
| **Display text** | callout **163%** |
| **Page location** | Callouts |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC National Fire News, June 18 2026 |
| **Notes** | 163% ratio ≡ 63% above average (C-F02); both from same NIFC table |

---

### C-F04 — 2026 YTD rank vs prior years

| Field | Value |
|---|---|
| **Normalized statement** | 2026 YTD acres burned through June 18 ranks second highest in NIFC's YTD comparison table; 2022 same-date YTD was about 3.1 million acres (highest) |
| **Display text** | "2026 ranks second, not a record" / "Same date in 2022 saw about 3.1 million acres" |
| **Page location** | Prose block |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC National Fire News YTD table, June 18 2026 |

---

### C-F05 — NIFC standardized reporting start year

| Field | Value |
|---|---|
| **Normalized statement** | NIFC national acres-burned statistics are comparable from calendar year 1983 onward |
| **Display text** | "National acres burned run from 1983 (NIFC)" / "Standardized reporting from 1983" |
| **Page location** | Intro block, methodology |
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
| **Page location** | Methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong |
| **Sources** | NIFC documentation |

---

### C-F07 — Ten-year average reference line

| Field | Value |
|---|---|
| **Normalized statement** | Mean U.S. acres burned for calendar years 2013–2022 was 7.2 million acres per year |
| **Display text** | "Ten-year average burned (7.2M, 2013-2022)" |
| **Page location** | Fire chart legend |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate (CRS summary of NIFC data) |
| **Sources** | [CRS IF10244](https://crsreports.congress.gov/product/pdf/IF/IF10244) |
| **Limitations** | Flat reference line; not a rolling average; ends 2022 |

---

### C-F08 — 2026 full-year forecast range

| Field | Value |
|---|---|
| **Normalized statement** | AccuWeather projects 5.5 to 8.0 million U.S. acres burned in calendar year 2026 if current conditions hold |
| **Display text** | "**5.5-8M**" / "AccuWeather projects 5.5 to 8 million acres" |
| **Page location** | Fire chart legend, callouts, prose, methodology |
| **Status** | Speculative |
| **Confidence** | Low |
| **Evidence strength** | Speculative (commercial forecast, conditional language) |
| **Sources** | [AccuWeather 2026 Wildfire Season Forecast](https://www.accuweather.com/en/press/larger-wildfires-fueled-by-drought-and-heat-expected-across-the-u-s-in-2026/1884295) |
| **Limitations** | Not NIFC official; scenario-dependent; must not be read as observed data |

---

### C-F09 — Peak fire season timing

| Field | Value |
|---|---|
| **Normalized statement** | U.S. wildfire activity typically peaks in summer months |
| **Display text** | "Peak fire season starts in summer" / "Peak season is still ahead" |
| **Page location** | Header dek, prose block |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Evidence strength** | Moderate (general climatology; not sourced inline on page) |
| **Sources** | Implicit NIFC seasonal patterns; widely documented |
| **Limitations** | Regional variation not stated |

---

## Federal prevention (hazardous fuels treatment)

### C-P01 — FS treatment acres 2025

| Field | Value |
|---|---|
| **Normalized statement** | U.S. Forest Service treated 2.6 million acres for wildfire risk in calendar year 2025 |
| **Display text** | "treated 2.6 million acres for wildfire risk" (2025) |
| **Page location** | Prose block |
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
| **Page location** | Prose block |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Moderate |
| **Sources** | NPR / USFS FACTS; `wildfire-data.csv` (2024: 4.1) |

---

### C-P03 — FS treatment YoY percent change 2024→2025

| Field | Value |
|---|---|
| **Normalized statement** | Forest Service wildfire-risk treatment acres decreased from 4.1M to 2.6M (2024→2025), a ~36.6% decline, displayed as 35% |
| **Display text** | "**35% fewer acres**" / callout **35%** |
| **Page location** | Header dek, callouts, quote block |
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
| **Page location** | Intro block, prevention panel note, methodology |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | NPR methodology note; page author decision |

---

### C-P05 — Interior treatment reporting basis

| Field | Value |
|---|---|
| **Normalized statement** | Interior Department hazardous fuels treatment is reported on a federal fiscal year basis (Oct 1 start), not calendar year |
| **Display text** | "Interior fuels work is reported from 2018 (fiscal year)" / panel note |
| **Page location** | Intro block, prevention panel, methodology |
| **Status** | Methodological |
| **Confidence** | High |
| **Sources** | [DOI fuels management program](https://www.doi.gov/wildlandfire/fuels) |

---

### C-P06 — Interior treatment scope

| Field | Value |
|---|---|
| **Normalized statement** | Interior treatment figures cover BLM, NPS, BIA, and FWS lands, fiscal years 2018–2024 |
| **Display text** | methodology bullet |
| **Page location** | Methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | DOI fuels program |

---

## Drought (DSCI)

### C-D01 — DSCI data availability

| Field | Value |
|---|---|
| **Normalized statement** | U.S. Drought Monitor DSCI weekly statistics used for annual averages begin in calendar year 2000 |
| **Display text** | "Drought index readings start in 2000" |
| **Page location** | Intro block |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | [U.S. Drought Monitor API](https://usdmdataservices.unl.edu/api/USStatistics/GetDSCI?aoi=conus) |

---

### C-D02 — DSCI 2026 partial-year values

| Field | Value |
|---|---|
| **Normalized statement** | 2026 DSCI values are 24-week averages through June 16, 2026 (national and western) |
| **Display text** | methodology bullet |
| **Page location** | Methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | `data/dsci-annual-averages.csv`, `data/dsci-western-annual.csv`; USDM API pulls |

---

### C-D03 — Western vs national DSCI on same chart

| Field | Value |
|---|---|
| **Normalized statement** | National (conus) and NWS Western Region DSCI are displayed together; western region covers much of U.S. fire-season geography |
| **Display text** | panel note: "much of the fire season hits the West" |
| **Page location** | Drought panel |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Notes** | Geographic overlap statement is directionally true; not a quantitative claim |

---

## Western VPD

### C-V01 — VPD series definition

| Field | Value |
|---|---|
| **Normalized statement** | Western U.S. mean fire-season VPD is computed for May–September, west of 100°W, from gridMET, years 1979–2025 |
| **Display text** | VPD panel note and methodology |
| **Page location** | VPD panel, methodology |
| **Status** | Supported |
| **Confidence** | High |
| **Evidence strength** | Strong (published dataset + peer-reviewed gridMET paper) |
| **Sources** | [gridMET](http://thredds.northwestknowledge.net/thredds/dodsC/MET/vpd/); [Abatzoglou 2013](https://doi.org/10.1002/joc.3413); `data/vpd-annual.csv` |

---

### C-V02 — VPD geographic mismatch with national fire data

| Field | Value |
|---|---|
| **Normalized statement** | Western VPD is not geographically comparable to national acres-burned totals |
| **Display text** | "National acres burned count the whole country. Western dryness, not a national match." |
| **Page location** | VPD panel note |
| **Status** | Methodological |
| **Confidence** | High |

---

## Cross-panel / epistemic

### C-X01 — No causal claim across panels

| Field | Value |
|---|---|
| **Normalized statement** | The page does not assert that any chart series caused any other chart series |
| **Display text** | "I am not claiming one line caused another" / methodology closing |
| **Page location** | Intro block, methodology closing |
| **Status** | Excluded (explicit non-claim) |
| **Confidence** | High |
| **AI-OS note** | Prevents upgrade of temporal co-occurrence to causation per Evidence Standard §7 |

---

### C-X02 — Prevention cut ≠ 2026 fire season cause

| Field | Value |
|---|---|
| **Normalized statement** | The page does not assert that reduced 2025 Forest Service treatment caused 2026 fire outcomes |
| **Display text** | "not claiming that cutting prevention in 2025 caused the 2026 fire season" |
| **Page location** | Methodology closing |
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
| **Normalized statement** | Fire, prevention, drought, and VPD panels use different year ranges and geographic scopes by design |
| **Display text** | intro block |
| **Page location** | Intro block |
| **Status** | Methodological |
| **Confidence** | High |

---

### C-X05 — Correlations are exploratory and off-page

| Field | Value |
|---|---|
| **Normalized statement** | Pairwise correlations between series exist in repo notebooks but are not presented as findings on the public page |
| **Display text** | "Correlations are exploratory and do not appear on this page" |
| **Page location** | Build note, footer |
| **Status** | Methodological |
| **Sources** | `notebooks/correlation-analysis.ipynb`, `data/correlation-notes.md` |

---

## Context / policy (non-chart)

### C-R01 — USDA research station reorganization

| Field | Value |
|---|---|
| **Normalized statement** | USDA announced plans in March 2026 to close 57 of 77 Forest Service research stations |
| **Display text** | prose block / methodology |
| **Page location** | Prose block, methodology |
| **Status** | Supported |
| **Confidence** | Medium |
| **Evidence strength** | Moderate (news reporting of agency plan) |
| **Sources** | [Stateline, April 17 2026](https://stateline.org/2026/04/17/forest-service-plan-to-close-research-stations-stokes-fear-as-wildfire-season-approaches/) |
| **Limitations** | Plan announced; closure outcome may change |

---

### C-R02 — Research stations study fire and smoke

| Field | Value |
|---|---|
| **Normalized statement** | Many affected Forest Service research stations conduct fire behavior or smoke forecasting research |
| **Display text** | "Many of those sites study fire behavior and smoke forecasting" |
| **Page location** | Prose block |
| **Status** | Partially supported |
| **Confidence** | Medium |
| **Sources** | Stateline reporting; general FS research station missions |
| **Limitations** | "Many" is qualitative; not a count |

---

### C-R03 — Franklin prevention quote

| Field | Value |
|---|---|
| **Normalized statement** | Benjamin Franklin wrote "an ounce of prevention is worth a pound of cure" in 1735 urging Philadelphia fire prevention |
| **Display text** | quote block |
| **Page location** | Quote block |
| **Status** | Supported |
| **Confidence** | High |
| **Sources** | Historical letter, widely cited |

---

## Editorial (depends on factual claims)

### C-E01 — Juxtaposition framing

| Field | Value |
|---|---|
| **Statement** | The federal government enters peak fire season with high YTD acres burned and reduced FS treatment vs prior year |
| **Display text** | quote block first sentence |
| **Page location** | Quote block |
| **Status** | Editorial |
| **Depends on** | C-F02, C-P03 |
| **Notes** | Factual components are supported; rhetorical juxtaposition is author interpretation, not causal claim |

---

### C-E02 — Closing line

| Field | Value |
|---|---|
| **Statement** | Prevention is cheaper than cure (normative economic framing) |
| **Display text** | "The ounce was always going to be cheaper." |
| **Page location** | Quote attribution line |
| **Status** | Editorial |
| **Notes** | Opinion / rhetorical capstone; not an empirical claim |

---

## Page location index

Quick lookup: where each claim appears on `index.html`.

| Location | Claim IDs |
|---|---|
| Header dek | C-P03, C-F01, C-F02, C-F09 |
| Intro block | C-F05, C-P04, C-P05, C-D01, C-V01, C-X01, C-X04 |
| Fire chart | C-F07, C-F08 |
| Prevention chart | C-P04, C-P05 |
| Drought chart | C-D01, C-D03 |
| VPD chart | C-V01, C-V02 |
| Callouts | C-P03, C-F01, C-F02, C-F08, C-F03 |
| Prose block | C-F01, C-F02, C-F04, C-P01, C-P02, C-F08, C-R01, C-R02 |
| Quote block | C-R03, C-E01, C-E02 |
| Methodology | C-F05, C-F06, C-F01, C-P04, C-P06, C-D02, C-V01, C-F08, C-R01, C-X01, C-X02 |
| Build note | C-X05 |
| Meta / OG tags | C-F01, C-P03 (twitter description) |

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
| 2026-07-04 | Copy fixes C-F04 (2022 ~3.1M), C-D02 (DSCI through June 16); tighter page margins |
| 2026-07-04 | Structured fact-check pass; see [`fact-check-log.md`](fact-check-log.md) (0 fail, 4 warn) |
| 2026-07-03 | Initial registry from live page (four panels, June 18 YTD) |
