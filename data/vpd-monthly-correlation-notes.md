# Monthly western VPD vs acres burned (exploratory)

Repository research only. Not on the main live charts.

## Question

Does **May** or **March-May** western VPD track annual acres burned more usefully than
the annual lag proxy (western VPD year t vs national acres t+1)?

**Outcome limitation:** Acres burned are still **calendar-year totals** (NIFC / western GACC).
We do not have summer-only burn totals in this repo. "Summer acres" here means
fire-season dryness (May or spring VPD) paired with the same calendar year's burn total.

## Source

- `vpd-monthly-annual.csv` from `scripts/extend_vpd_monthly.py` (gridMET, west of 100°W)
- `vpd-annual.csv` fire-season May-Sep for comparison
- `wildfire-data.csv` national and western acres

## Window

2010-2025, n = 16 full years (partial 2026 excluded)

## Results

| Pairing | Pearson r | n |
|---|---|---|
| May VPD vs western acres (same year) | 0.496 | 16 |
| May VPD vs national acres (same year) | 0.145 | 16 |
| Mar-May VPD vs western acres (same year) | 0.544 | 16 |
| Mar-May VPD vs national acres (same year) | 0.35 | 16 |
| Fire-season VPD vs western acres (same year) | 0.808 | 16 |
| May VPD (year t) vs western acres (year t+1) | -0.54 | 15 |
| May VPD (year t) vs national acres (year t+1) | -0.477 | 15 |

## Headline comparisons

- May VPD vs western acres (same year): **r = 0.496**
- Fire-season VPD vs western acres (same year): **r = 0.808**
- May VPD vs western acres (lag 1 year): **r = -0.54**

## Interpretation (not causal)

- May and fire-season VPD are highly correlated with each other; do not treat as independent.
- Same-year May VPD vs western acres should be compared to fire-season VPD (≈0.81 on this page).
- Lag-1 May VPD is a finer **timing** test than annual VPD lagged against national acres,
  but calendar-year acres still blur spring vs summer burns.
- Monthly burn data would be needed for a true "May dryness → summer acres" test.

## Reproduce

```bash
python scripts/extend_vpd_monthly.py --start 2010 --end 2025
python scripts/compute_vpd_monthly_correlations.py
```
