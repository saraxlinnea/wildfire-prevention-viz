# HFR WUI vs non-WUI designation acres (exploratory)

Repository research only. Not on the main live charts.

## What the HFR columns mean

The HFR-DOI-FS report lists **WUI** and **Non-WUI** designation acres alongside
treatment totals. These are **where work was categorized**, not a separate count of
homes protected or risk reduced. WUI share can rise when agencies prioritize
community-adjacent projects even if total treatment acres fall.

## Output

- `hfr-wui-annual.csv`: combined WUI / non-WUI and shares by fiscal year
- Source: `hfr-prevention-annual.csv` (FY 2003-2021)

## WUI share of designation acres (median)

Median WUI share: **59.0%** across FY 2003-2021

Recent years (WUI share of designation):

| FY | Treatment (M ac) | WUI (M ac) | Non-WUI (M ac) | WUI share |
|---|---|---|---|---|
| 2016 | 5.29 | 2.67 | 2.62 | 50.5% |
| 2017 | 3.90 | 2.25 | 1.65 | 57.6% |
| 2018 | 4.65 | 2.90 | 1.74 | 62.5% |
| 2019 | 4.21 | 2.65 | 1.57 | 62.8% |
| 2020 | 4.47 | 2.86 | 1.61 | 64.1% |
| 2021 | 5.26 | 3.38 | 1.87 | 64.3% |

## Exploratory correlation vs national acres (same FY label, n = 19)

| Pairing | Pearson r |
|---|---|
| WUI share of designation vs national acres | 0.202 |
| Combined WUI acres vs national acres | 0.003 |
| Combined treatment vs national acres | -0.135 |

## Limitations

- Fiscal year vs calendar year mismatch for acres burned.
- WUI designation ≠ treatment effectiveness or community outcomes.
- Not causal.

## Reproduce

```bash
python scripts/extract_hfr_prevention.py
python scripts/compute_hfr_wui_analysis.py
```
