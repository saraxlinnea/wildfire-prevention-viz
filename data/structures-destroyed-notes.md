# Structures destroyed by wildfire (national)

Impacts-tab series under smoke. Bake-off locked **NICC annual report** national totals (SIT/ICS-209).

## Bake-off (2026-08-04)

| Source | Geography | Years checked | Definition | Continuity / notes |
|---|---|---|---|---|
| **NICC Wildland Fire Summary annual reports** | National | **2014–2025** (12 years) | SIT/209 structures destroyed; often split residences / minor / commercial | Continuous narrative totals; undercount vs county/state damage assessments |
| Headwaters Economics (FAMAuth / ICS-209) | National + state | Cumulative since 2005 (page updated Apr 2026) | Compiled ICS-209; some manual fixes (e.g. Tubbs → CAL FIRE) | Method clear; **no downloadable annual national CSV** on the public page for this pass; still undercount |
| Cal Fire | California | Long state series | State damage assessments | Not U.S.; fallback only |

**Decision:** Ship **national NICC** totals (acceptance rule 1: ≥10 consecutive years, stable “structures destroyed” wording). Headwaters remains a methods cross-check, not the chart series. Cal Fire not used.

## Pre-2014 backfill attempt (2026-08-07)

Acceptance for shipping earlier years: continuous NICC national “structures destroyed” wording back to at least **2006** (align with Childs smoke start).

| Years | Result |
|---|---|
| **2010–2013** | Same `total of N structures were … destroyed` extract as 2014+; hand-verified (788 / 5,246 / 4,244 / 2,135; residences 338 / 3,459 / 2,216 / 1,093). Stored in `EXTRACTED_PRE2014` in `scripts/extract_nicc_structures.py`; **not shipped** on the live CSV. |
| **2005–2009** | PDFs download; text extract finds **no** national structures-destroyed totals (no TOC structures section; season summaries lack the later wording). Do not invent Headwaters blends. |

**Decision:** Keep live series **2014–2025**. Document gap. Optional research write: `python scripts/extract_nicc_structures.py --include-pre2014` (2010-2025 CSV; still not continuous to 2006). Smoke × structures overlap remains **2014–2020** while live smoke is Childs v1.

## Artifact

- `data/structures-destroyed-annual.csv`
- Raw PDFs (gitignored): `data/nicc-structures-source/*.pdf`
- Extract script: `scripts/extract_nicc_structures.py`

## Locked annual totals (all structures)

| Year | Structures | Residences (or residential) | Source PDF |
|---|---:|---:|---|
| 2014 | 1,953 | 1,038 | Annual_Report_2014_508.pdf |
| 2015 | 4,636 | 2,638 | annual_report_2015_508.pdf |
| 2016 | 4,312 | 3,192 | annual_report_2016_508.pdf |
| 2017 | 12,306 | 8,065 | annual_report_2017_508_0.pdf |
| 2018 | 25,790 | 18,137 | annual_report_ 2018_508.pdf |
| 2019 | 963 | 444 | annual_report_2019_508.pdf |
| 2020 | 17,904 | 9,630 | annual_report_0.pdf (2020) |
| 2021 | 5,972 | 3,577 | annual_report_0.pdf (2021) |
| 2022 | 2,717 | 1,261 | annual_report.2.pdf |
| 2023 | 4,318 | 3,060 | annual_report_2023_0.pdf |
| 2024 | 4,552 | 2,406 | annual_report_2024.pdf |
| 2025 | 18,385 | 12,773 | annual_report_2025_0.pdf |

Peak-year spot checks vs CRS IF10244 (NICC-cited): 2019=963, 2020=17,904, 2021=5,972, 2022=2,717 — match.

## Limits (must appear on chart)

- SIT/209 **undercounts** vs many county/state assessments (NICC disclaimer; Headwaters Almeda example).
- “Structures” mix residences, minor, and commercial; chart default is **all structures**.
- Calendar year; not fiscal. Not causal vs acres burned or treatment.
- 2018 and 2025 are extreme loss years; do not read the series as a smooth trend only.

- Overlap with smoke (ECHO v2 beta live): calendar **2014-2023** only; dual-axis research panel on Impacts (claim **C-IMP05**). Structures-only years 2024-2025 stay on the structures chart.

## Claims

- **C-STR01** series
- **C-STR02** undercount / geography limits
- **C-IMP05** shared window with smoke (2014-2023)

## Reproduce

```bash
python scripts/extract_nicc_structures.py          # from cached PDFs
python scripts/extract_nicc_structures.py --download  # fetch PDFs then extract
```
