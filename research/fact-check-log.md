# Fact-check log

**Run date:** 2026-07-13 (monthly VPD + HFR WUI research)  
**Summary:** gridMET May/Mar-May VPD 2010-2025; correlation notes written; HFR WUI share median 59.0%; audit PASS.

---

## Monthly VPD + HFR WUI (2026-07-13)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-R08 | PASS (derived) | gridMET OPeNDAP | May vs western acres r=0.496; Mar-May 0.544; lag-1 May −0.54; fire-season 0.808 |
| C-R09 | PASS (derived) | HFR CSV | WUI share median 59.0%; r vs national acres 0.202 (n=19) |
| C-R06 | PASS (recheck) | repo | Regional share chart 2003-2007 + 2010-2025; 2008-2009 gap |

---

**Run date:** 2026-07-11 (south fm100 + regional share chart)  
**Summary:** fm100 fetched 2010-2025; south fm100 r=−0.18 (VPD still best); regional share chart on Coupling tab; audit PASS.

---

**Run date:** 2026-07-12 (HFR prevention + pre-2010 GACC acres)  
**Summary:** HFR FY 2003-2021 extracted; western/regional acres 2003-2007; 2008-2009 gap; audit PASS.

---

## HFR + pre-2010 acres (2026-07-12)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-P07 | PASS | HFR PDF | 19 fiscal years; combined treatment FY 2003-2021 |
| C-R07 | PASS (partial) | NICC PDFs | 2003-2007 + 2010-2012; 2008-2009 skipped; 2007 multiyear = 9.328M national |
| C-R01 | PASS (derived) | repo | regional CSV 21 years; shares 2003-2006 all_gaccs |

---

## Regional fm100 + share chart (2026-07-11)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-R05 | PASS (derived) | gridMET OPeNDAP | fm100 Jan-Apr SE bbox; r=−0.179 vs south acres; VPD 0.361 still best |
| C-R06 | PASS | repo | Stacked share chart 2003-2007 + 2010-2025; shares match regional-acres CSV |
| C-R03 | PASS (derived) | repo | South row updated with fm100 in accordion |

---

## Regional Phase 3 (2026-07-11)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-R04 | PASS | USDM API | `regional-dsci-annual.csv`; ER/SR/AR + WR merge |
| C-R03 | PASS (derived) | repo | West ERC best; East DSCI r=0.81 (small-acre caveat); Alaska DSCI only |
| C-R01 | PASS | repo | Shares in Coupling accordion match CSV medians |

---

## Regional Phase 2 (2026-07-11)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-R02 | PASS | gridMET OPeNDAP | `regional-gridmet-annual.csv` west/south/east |
| C-R03 | PASS (derived) | repo | West ERC r=0.833 best; South/East VPD best (weaker) |
| C-R01 | PASS | repo | Acres merged in correlation script |

---

## Regional GACC Phase 1 (2026-07-11)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-R01 | PASS | repo + NICC | West/EA/SA/AK + national GACC sum; shares 2013-2025 |
| C-W01 | PASS (derived) | repo | Western column matches `western-acres-annual.csv` |
| — | PASS | cross-check | National GACC sum ≈ NIFC national 2013-2025 (±~0.04M) |

---

## Chart copy + new Coupling charts (2026-07-11)

| Claim ID | Result | Method | Notes |
|---|---|---|---|
| C-C04 | PASS (derived) | repo | Added western acres vs western DSCI 0.08 |
| C-W01 | PASS | repo | Western acres chart 2010-2025 |
| C-Lit01 | PASS (copy) | unchanged | Rank bar visualizes same r ordering |

---

## Literature ranking + definitions (2026-07-09)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-V01 | PASS (copy) | copy + gridMET | Drivers definition: VPD = atmospheric thirst | Series years/geo unchanged |
| C-V03 | PASS (copy) | copy + gridMET | Drivers definition: ERC = potential energy release | Series years/geo unchanged |
| C-Lit01 | PASS | literature | Riley 2013; Williams 2015; Abatzoglou & Williams 2016 | Ranking only; page r column = repo |
| C-W02 / C-W03 | PASS (derived) | repo | Rank table “This page” 0.81 / 0.82 | Unchanged matrix values |
| C-M06 | PASS (derived) | repo | DSCI r=0.10 as rank #3 comparator | National acres pairing |

---

## Phase B western acres (2026-07-07)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-W01 | PASS | repo + NICC PDFs | `western-acres-annual.csv`; build script sums 7 GACCs | 2010-2012 = lightning+human; 2013+ from text tables |
| C-W02 | PASS (derived) | repo | `correlation-matrix.csv` western_acres vs VPD = 0.808 | Page rounds to 0.81 |
| C-C04 | PASS (derived) | repo | Table includes western acres vs VPD 0.81 | National vs VPD still 0.63 |
| C-M02 | PASS (derived) | math | r=0.808 → r²≈0.65 for western acres pairing | Updated copy |
| C-M07 | PASS | repo | Western share of national acres now quantified 2010-2025 | Was WARN (partial) |
| C-C01 | PASS (derived) | repo | National acres vs western VPD still 0.625 | Unchanged; secondary in table |

---

## ERC fire danger (2026-07-08)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-V03 | PASS | repo + gridMET | `erc-annual.csv` 1979-2025; `extend_erc.py` | Same geo/season as VPD |
| C-W03 | PASS (derived) | repo | western acres vs ERC = 0.821 | Best pairing in matrix |
| C-C04 | PASS (derived) | repo | Updated with ERC rows; VPD vs ERC r=0.944 | Collinearity noted on page |

---

## Phase A copy delta (2026-07-06)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-M01 | PASS (copy) | copy | YTD vs full-year framing; consistent with C-F04 | Methodological |
| C-M02 | PASS (derived) | math | Updated 2026-07-07 for western acres r² | See Phase B |
| C-M03 | PASS (derived) | repo | 2010-2025 inclusive = 16 years | `correlation-matrix.csv` |
| C-M04 | PASS (copy) | copy + C-V01/C-D03 | VPD vs DSCI process distinction | No new numeric claim |
| C-M05 | PASS (copy) | copy | Treatment ≠ outcomes; aligns C-X01/C-X02 | Methodological |
| C-M06 | PASS (derived) | repo | r=0.10 vs 0.63 from correlation matrix | Geographic reasoning |
| C-M07 | PASS | repo | Upgraded 2026-07-07 with GACC western acres | Was WARN (partial) |

---

## v2 Phase 2-3 delta (2026-07-06)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-X05 | PASS (copy) | copy + repo | Relationships tab + methodology; exploratory framing | Revised from off-page to on-page coupling |
| C-C01 | PASS (derived) | repo | `correlation-matrix.csv` r=0.625; page rounds to 0.63 | Scatter excludes partial years 2010-2025 |
| C-C02 | PASS (copy) | copy | Lag panel note states annual resolution limit | |
| C-C03 | PASS (copy) | copy + CSV | Three FS years in CSV; panel + chart n=3 warning | 2026 outcome partial flagged |
| C-A01 | PASS (derived) | repo + JS | Z-scores from 2000-2025 overlap; 2026 DSCI excluded | |
| C-P07 | PASS (copy) | copy | Policy tab combined total + fiscal/calendar note | |

---

## v2 Phase 1 delta (2026-07-06)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-F07 | PASS | CSV + external | CRS IF10244: 7.2M acres avg 2013-2022; CSV `ten_year_avg_millions=7.2` | Chart legend removed; CSV/footer reference only |
| C-F09 | PASS | derived + repo | Rolling min-max of prior 10 full calendar years from `wildfire-data.csv`; band starts 1993 | Methodological; distinct from NIFC YTD 10-yr avg (C-F02) |
| C-F10 | PASS | derived | Toggle recomputes C-F09 window as % deviation | Forecast overlay hidden in pct mode by design |

---

## Results (full registry)

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-F01 | PASS | external + CSV | NIFC YTD PDF (`gacc.nifc.gov`); `wildfire-data.csv`; page methodology cites 2,627,549 | Live NIFC NFN now shows 3.26M acres as of Jul 4; page correctly frozen at Jun 18 snapshot |
| C-F02 | PASS | derived + external | 2,627,549 vs 10-yr YTD avg 1,611,629 → 63% above | Matches NIFC-derived math and page copy |
| C-F03 | PASS | derived | 2,627,549 / 1,611,629 = 163% | Consistent with C-F02 |
| C-F04 | PASS | external + copy | Page: about 3.1M for 2022 same-date; NIFC-derived reporting ~3.1M Jun 18 2022 | Fixed 2026-07-04 |
| C-F05 | PASS | CSV + external | Burn series starts 1983 in `wildfire-data.csv`; NIFC statistics document standardized reporting | |
| C-F06 | PASS | copy | Methodology states pre-1983 not comparable | Standard NIFC caveat |
| C-F07 | PASS | CSV + external | CRS IF10244: 7.2M acres avg 2013-2022; CSV `ten_year_avg_millions=7.2` | Not on chart; superseded by C-F09 band |
| C-F08 | PASS | CSV + external | AccuWeather press release: "5.5-8 million acres"; CSV `5.5`/`8.0` | Remains **Speculative** per registry; correctly labeled on page |
| C-F09 | PASS | derived + repo | Rolling band from NIFC full-year acres in CSV | See v2 delta above |
| C-F10 | PASS | derived | % toggle from same window as C-F09 | See v2 delta above |
| C-F11 | WARN | copy | Summer peak stated; not inline-sourced on page | Directionally correct; regional variation omitted |
| C-P01 | PASS | CSV + external | CSV 2025 `fs_treatment=2.6`; CWP May 27 2026 confirms FS treatment decline | Policy context section |
| C-P02 | PASS | CSV | CSV 2024 `fs_treatment=4.1` | Policy context section |
| C-P03 | PASS (derived) | CSV + external | Exact decline 36.6%; page and CWP use **35%** | Source convention matches page rounding |
| C-P04 | PASS (copy) | copy + external | Policy tab note; methodology; NPR methodology (2023+ comparable series) | |
| C-P05 | PASS (copy) | external | DOI fuels page: fiscal-year program, Oct 1 basis | |
| C-P06 | PASS | CSV + external | Interior 2018-2024 in CSV; DOI lists BLM/NPS/BIA/FWS; FY acreage matches CSV exactly | e.g. FY2024 DOI 2.36M = CSV 2.36 |
| C-D01 | PASS | repo | `dsci-annual-averages.csv` starts 2000; USDM API endpoint documented | Atmosphere tab panel note |
| C-D02 | PASS | repo + copy | CSV/raw: 24 weeks, last week `20260616`; page says "through June 16" | Fixed 2026-07-04 |
| C-D03 | WARN | copy | Atmosphere tab note qualitative ("much of the fire season hits the West") | Not a quantitative claim |
| C-V01 | PASS | repo + script | `vpd-annual.csv` 1979-2025; `scripts/extend_vpd.py` defines May-Sep, west of 100°W | |
| C-V02 | PASS (copy) | copy | Atmosphere and Relationships tabs geographic mismatch disclaimers | |
| C-C01 | PASS (derived) | repo | `correlation-matrix.csv` r=0.625; page 0.63 | 2010-2025 full years |
| C-C02 | PASS (copy) | copy | Lag panel annual resolution note | |
| C-C03 | PASS (copy) | copy + CSV | Three FS treatment years; n=3 warning on chart | |
| C-A01 | PASS (derived) | JS + repo | Z-score overlay 2000-2025; 2026 DSCI excluded | |
| C-P07 | PASS (copy) | copy | Combined federal total + calendar/fiscal caveat | |
| C-X01 | PASS (copy) | copy | "This page does not claim one line caused another" in intro | |
| C-X02 | PASS (copy) | copy | Methodology closing excludes prevention to 2026 causation | |
| C-X03 | N/A | copy | Causal claim absent from page (by design) | Rejected hypothesis tracked in registry only |
| C-X04 | PASS (copy) | copy | Intro states five tabs / mismatched timelines | |
| C-X05 | PASS (copy) | copy + repo | Relationships tab exploratory coupling; not causal | Revised 2026-07-06 Phase 2-3 |
| C-X06 | PASS (copy) | copy | How to read this framing in Interpretation tab | |
| C-R01 | WARN | copy + partial external | Page cites Stateline Apr 17 2026; live fetch returned truncated page | 57 of 77 stations not re-extracted live; retained from prior sourcing |
| C-R02 | WARN | copy | "Many of those sites study fire behavior and smoke forecasting" | Qualitative; not independently counted |
| C-R03 | N/A | copy | Franklin quote removed from live page | Retained in registry; title only |
| C-E01 | N/A | copy | Editorial juxtaposition removed with quote block | |
| C-E02 | N/A | copy | Closing line removed with quote block | |

---

## Tier A: manual audit detail

Run when `python scripts/audit_data.py` unavailable:

| Check | Result |
|---|---|
| National DSCI vs audit CSV | OK |
| Western DSCI vs audit CSV | OK |
| VPD 1979-2025 in range 1.0-2.5 kPa | OK |
| 2026 partial-year flags | OK |
| Acres burned span 1983-2025 (+ 2026 YTD) | OK |
| Required data files present | OK |

---

## Warnings (no action required)

1. **C-R01 / C-R02** - Stateline article did not fully load in automated fetch. Claims match cited URL and README; re-verify before next major share push.

2. **Live NIFC drift** - Current NIFC NFN (Jul 4, 2026) reports 3,264,379 YTD acres. Page intentionally uses Jun 18 snapshot (2,627,549). Not a defect.

3. **Tier A env** - Fix local pandas/numpy mismatch to restore `audit_data.py` (`pip install --upgrade pandas numpy` or fresh venv).

4. **C-F11 / C-D03** - Qualitative panel/dek statements; not quantitatively verified.

---

## Failures

None.

---

## Re-run

```bash
cd "/Users/saralinnea/Desktop/Projects/wildfire analysis"
python scripts/audit_data.py          # Tier A (requires working pandas)
# Then spot-check external sources listed in research/claims.md
# Update this log with new run date and any changed results
```
