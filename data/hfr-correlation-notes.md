# HFR prevention correlation notes (exploratory)

Repository research only. Not on the live page.

## Source

- `hfr-prevention-annual.csv` (FY 2003-2021, NFPORS joint FS+DOI report)
- `wildfire-data.csv` national acres burned (NIFC, calendar year)

## Same-year pairings (fiscal FY = calendar year label)

Window: 2004-2025 overlap, n = 18

| Pairing | Pearson r |
|---|---|
| Combined HFR treatment vs national acres | -0.27 |
| FS treatment vs national acres | -0.332 |
| DOI treatment vs national acres | -0.168 |

## Lag pairing (FY treatment vs next calendar-year acres)

n = 19

| Pairing | Pearson r |
|---|---|
| Combined HFR treatment (FY t) vs national acres (year t+1) | -0.168 |

## Limitations

- Fiscal vs calendar year mismatch; fire season spans months.
- HFR totals include treatment-type columns that changed definition over time (see report footnotes).
- Not causal. Overlaps conceptually with Interior (2018-2024) and FS NPR (2023-2025) page series but different methods.

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
python scripts/compute_hfr_correlations.py
```
