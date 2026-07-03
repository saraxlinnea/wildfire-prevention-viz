# Correlation analysis notes

Exploratory only. Not shown on the public visualization.

## Caveats

- Correlation is not causation. These series use different geographies, calendars, and definitions.
- Interior treatment is fiscal year (Oct 1). Acres burned and DSCI are calendar year.
- Forest Service treatment is comparable only from 2023 onward (three years).
- National acres burned include the entire country. VPD and western DSCI cover western or regional areas.
- Short windows (especially 2023-2025) have very few observations. Treat those correlations as illustrative, not conclusive.
- 2026 partial-year values are excluded from all calculations.

## Files

- `correlation-by-window.csv`: pairwise Pearson and Spearman correlations by analysis window
- `correlation-matrix.csv`: Pearson matrix for 2010-2025 overlap (acres burned, national DSCI, western DSCI, VPD)

## Key results (2010-2025, n=16)

| Pair | Pearson r |
|---|---|
| Acres burned vs western VPD | 0.625 |
| National DSCI vs western DSCI | 0.734 |
| Acres burned vs national DSCI | 0.097 |
| Western VPD vs national DSCI | 0.560 |

Western fire-season VPD tracks national acres burned more closely than national DSCI does in this window. That fits the geographic mismatch: VPD is western-only; most acres burned are also in the West, but national DSCI averages dilute regional signal.

The 2023-2025 FS overlap window has only three years. Treat those correlations as illustrative only.

## Reproduce

```bash
python scripts/compute_correlations.py
```

Or run the [correlation analysis notebook](https://github.com/saraxlinnea/wildfire-prevention-viz/blob/main/notebooks/correlation-analysis.ipynb) on GitHub (after repo is pushed).
