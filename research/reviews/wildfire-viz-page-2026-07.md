# Wildfire prevention viz — page review (2026-07-16)

Template: AI-OS `PAPER_REVIEW` (adapted for a public data page).

Prior pass: 2026-07-16. **Update 2026-07-17:** 2008-2009 GACC hand OCR closed; regional share continuous 2003-2025; median western share ≈ 60% (n=23). **Update 2026-07-17 (smoke):** Why smoke matters on How to read; CONUS smoke PM2.5 chart 2006-2020 (Childs); literature Burke/Childs (C-IMP01-04).

---

## 1. Identification

- **Title:** An Ounce of Prevention: U.S. Wildfire Data
- **Authors:** Sara Bower
- **Type:** Public data visualization + claim registry
- **URL:** https://saraxlinnea.github.io/wildfire-prevention-viz

---

## 2. One-sentence summary

A four-tab static viz comparing national wildfire acres, federal treatment workload, western fire-season dryness, and exploratory co-movement (Patterns), with explicit non-causal framing.

---

## 3. Research question (inferred)

What public federal datasets show about temporal overlap among burn outcomes, prevention reporting, and western atmospheric drivers — without claiming causation?

---

## 4. Study type

Exploratory / descriptive analysis; bivariate Pearson r on annual panels (n=16).

---

## 5. Data and methods (summary)

| Series | Geography | Calendar |
|---|---|---|
| Acres burned | National NIFC | Calendar |
| Treatment | Federal HFR + page FS/DOI | Fiscal (toggle) |
| ERC / VPD / DSCI | Western (gridMET / USDM) | Calendar |
| Patterns coupling | Western GACC acres preferred | 2010-2025 |

Claim registry: [`research/claims.md`](../claims.md). Latest fact-check: [`research/fact-check-log.md`](../fact-check-log.md).

---

## 6. Core findings (as presented)

- Western ERC/VPD track western GACC acres more strongly than drought indices (r ≈ 0.81-0.82 exploratory).
- Geography matters: national acres pairings are weaker; median western share of GACC sum ≈ 60% (2003-2025).
- Treatment acres are workload, not effectiveness; 35% FS YoY decline is Drivers context, not an Outcomes metric.
- Dual-axis treatment vs burn is research-only (easy to misread as causation).

---

## 7. Limitations (page acknowledges)

- n=16 correlation window; ERC-VPD collinear (~0.94)
- Fiscal vs calendar mismatch for treatment
- Partial 2026 snapshots (acres through Jul 16; DSCI through Jul 14)
- Ignition cause chart n=7 in supplementary; 2007-2009 cause split not on chart (C-P2-03)
- 2008-2009 GACC regional acres filled via hand OCR of lightning+human pages (national 5.29M / 5.92M cross-checks NIFC)
- Monthly burn and state panels deferred (C-P2-01, C-P2-02)
- Smoke chart is CONUS modeled PM2.5 (2006-2020 only); not population exposure or 2026 smoke (C-IMP03)

---

## 8. Review tasks (2026-07-16 pass)

- [x] Patterns tab label + Start here expanded
- [x] Nested national/West fill bars + Outcomes regional share
- [x] Dual-axis demoted to Drivers research drawer
- [x] Y-axis padding fix; DSCI YTD-average plain language
- [x] Jul 16 NIFC YTD + DSCI refresh (C-F01–C-F04, C-D02)
- [x] Phase 2 backlog scaffolded (claims + export script + templates)
- [x] 2008-2009 GACC hand fill (lightning+human OCR → regional CSVs; gap bars removed)
- [x] Why smoke matters + CONUS smoke PM2.5 chart on How to read (C-IMP01-04)
- [ ] External reviewer read (deferred until press push)

---

## 9. Verdict

**Suitable for public sharing** with documented limits. The page does not claim causation between prevention cuts and 2026 fires; correlation is labeled exploratory; geography and calendar mismatches are stated. Remaining Phase 2 items (monthly burn, state panels) stay off the main path. Recommend completing [`visual-qa-checklist.md`](../visual-qa-checklist.md) before a major press push.
