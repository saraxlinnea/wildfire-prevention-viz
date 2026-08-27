# Federal wildfire suppression costs (NIFC)

Context-tab series for **spend fighting** next to hazardous-fuels treatment; Impacts also shows a compact copy (`#chart-suppression-impacts`). Not state/local costs and not a blended “total fire cost.”

## Source (locked)

- **Primary:** [NIFC Federal Firefighting Costs (Suppression Only)](https://www.nifc.gov/fire-information/statistics/suppression-costs)
- Companion PDF often mirrored as [SuppCosts.pdf](https://www.nifc.gov/sites/default/files/document-media/SuppCosts.pdf)
- Columns used: Forest Service, DOI Agencies, Total
- Access date for this extract: **2026-08-04**
- Artifact: `data/suppression-cost-annual.csv`

## Definition

- **Fiscal year** costs reported by federal land management agencies to NIFC External Affairs.
- Suppression only (extinguishing / confining wildfire). Excludes preparedness-only lines and non-federal spend.
- Not staffing days, aircraft hours, or homes protected.

## Window

- Table on NIFC page: **FY 1985–2023** (through the latest published row at access date).
- Explore chart x-domain is clipped to **2003–2023** so it sits next to the HFR / page treatment window.

## Inflation

- CSV and chart use **nominal** dollars.
- Real (CPI-adjusted) dollars are **not** shown in v1. Rising nominal totals partly reflect price level, not only more suppression activity.

## FY2020+ wildfire funding fix

- Since FY2020, Congress can appropriate additional suppression funds via the wildfire adjustment (“funding fix”). CRS digests track **appropriations**; this page uses NIFC **costs** as published.
- Do not equate NIFC cost rows with CRS appropriation totals without a separate crosswalk.

## Acres on the NIFC cost table

- The NIFC table also lists fires and acres. Those acres are **not** wired into this page’s NIFC national acres series without a documented crosswalk. The Explore chart shows **dollars only**.

## Claims

- **C-SUP01** series definition
- **C-SUP02** chart display limits (fiscal; federal only; nominal; not causal vs treatment or acres)
- **C-SUP03** Impacts compact chart (same series; not causal vs smoke/structures)

## Reproduce

Hand-verified from the NIFC HTML table into `suppression-cost-annual.csv`. Optional refresh:

```bash
# Re-check live table against CSV (manual / future scrape)
# Source URL is stored per row in the CSV.
```
