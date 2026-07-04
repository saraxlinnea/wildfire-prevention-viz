# Fact-check log

**Run date:** 2026-07-04  
**Tier A audit:** WARN — `scripts/audit_data.py` failed (pandas/numpy binary incompatibility in local conda env). Manual stdlib CSV audit: **PASS** (0 errors).  
**Claims checked:** 32  
**Summary:** 26 PASS · 2 PASS (copy) · 2 PASS (derived) · 2 N/A · 4 WARN · 0 FAIL

---

## Results

| Claim ID | Result | Method | Source / evidence | Notes |
|---|---|---|---|---|
| C-F01 | PASS | external + CSV | NIFC YTD PDF (`gacc.nifc.gov`); `wildfire-data.csv`; page methodology cites 2,627,549 | Live NIFC NFN now shows 3.26M acres as of Jul 4; page correctly frozen at Jun 18 snapshot |
| C-F02 | PASS | derived + external | 2,627,549 vs 10-yr YTD avg 1,611,629 → 63% above | Matches NIFC-derived math and page copy |
| C-F03 | PASS | derived | 2,627,549 / 1,611,629 = 163% | Consistent with C-F02 |
| C-F04 | PASS | external + copy | Page: about 3.1M for 2022 same-date; NIFC-derived reporting ~3.1M Jun 18 2022 | Fixed 2026-07-04 |
| C-F05 | PASS | CSV + external | Burn series starts 1983 in `wildfire-data.csv`; NIFC statistics document standardized reporting | |
| C-F06 | PASS | copy | Methodology states pre-1983 not comparable | Standard NIFC caveat |
| C-F07 | PASS | CSV + external | CRS IF10244: 7.2M acres avg 2013–2022; CSV `ten_year_avg_millions=7.2` | |
| C-F08 | PASS | CSV + external | AccuWeather press release: "5.5-8 million acres"; CSV `5.5`/`8.0` | Remains **Speculative** per registry; correctly labeled on page |
| C-F09 | WARN | copy | Summer peak stated; not inline-sourced on page | Directionally correct; regional variation omitted |
| C-P01 | PASS | CSV + external | CSV 2025 `fs_treatment=2.6`; CWP May 27 2026 confirms FS treatment decline | |
| C-P02 | PASS | CSV | CSV 2024 `fs_treatment=4.1` | |
| C-P03 | PASS (derived) | CSV + external | Exact decline 36.6%; page and CWP use **35%** | Source convention matches page rounding |
| C-P04 | PASS (copy) | copy + external | Intro/methodology; NPR methodology (2023+ comparable series) | |
| C-P05 | PASS (copy) | external | DOI fuels page: fiscal-year program, Oct 1 basis | |
| C-P06 | PASS | CSV + external | Interior 2018–2024 in CSV; DOI lists BLM/NPS/BIA/FWS; FY acreage matches CSV exactly | e.g. FY2024 DOI 2.36M = CSV 2.36 |
| C-D01 | PASS | repo | `dsci-annual-averages.csv` starts 2000; USDM API endpoint documented | |
| C-D02 | PASS | repo + copy | CSV/raw: 24 weeks, last week `20260616`; page says "through June 16" | Fixed 2026-07-04 |
| C-D03 | WARN | copy | Panel note qualitative ("much of fire season hits the West") | Not a quantitative claim |
| C-V01 | PASS | repo + script | `vpd-annual.csv` 1979–2025; `scripts/extend_vpd.py` defines May–Sep, west of 100°W | |
| C-V02 | PASS (copy) | copy | VPD panel geographic mismatch disclaimer present | |
| C-X01 | PASS (copy) | copy | "I am not claiming one line caused another" in intro | |
| C-X02 | PASS (copy) | copy | Methodology closing excludes prevention→2026 causation | |
| C-X03 | N/A | copy | Causal claim absent from page (by design) | Rejected hypothesis tracked in registry only |
| C-X04 | PASS (copy) | copy | Intro states mismatched timelines/geographies | |
| C-X05 | PASS (copy) | copy + repo | "Correlations are exploratory…" + notebook/CSV exist off-page | |
| C-R01 | WARN | copy + partial external | Page cites Stateline Apr 17 2026; live fetch returned truncated page | 57 of 77 stations not re-extracted live; retained from prior sourcing |
| C-R02 | WARN | copy | "Many of those sites study fire behavior and smoke forecasting" | Qualitative; not independently counted |
| C-R03 | PASS | external | Franklin 1735 letter attribution; widely documented | |
| C-E01 | PASS (derived) | derived | Quote juxtaposition depends on C-F02 + C-P03 (both PASS) | Editorial; factual deps verified |
| C-E02 | N/A | — | "The ounce was always going to be cheaper" | Opinion; no empirical fact-check |

---

## Tier A: manual audit detail

Run when `python scripts/audit_data.py` unavailable:

| Check | Result |
|---|---|
| National DSCI vs audit CSV | OK |
| Western DSCI vs audit CSV | OK |
| VPD 1979–2025 in range 1.0–2.5 kPa | OK |
| 2026 partial-year flags | OK |
| Acres burned span 1983–2025 (+ 2026 YTD) | OK |
| Required data files present | OK |

---

## Warnings (no action required)

1. **C-R01 / C-R02** — Stateline article did not fully load in automated fetch. Claims match cited URL and README; re-verify before next major share push.

2. **Live NIFC drift** — Current NIFC NFN (Jul 4, 2026) reports 3,264,379 YTD acres. Page intentionally uses Jun 18 snapshot (2,627,549). Not a defect.

3. **Tier A env** — Fix local pandas/numpy mismatch to restore `audit_data.py` (`pip install --upgrade pandas numpy` or fresh venv).

4. **C-F09 / C-D03** — Qualitative panel/dek statements; not quantitatively verified.

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
