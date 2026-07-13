# Correlation analysis notes

Exploratory only. Not shown on the public visualization.

## Caveats

- Correlation is not causation. These series use different geographies, calendars, and definitions.
- Interior treatment is fiscal year (Oct 1). Acres burned and DSCI are calendar year.
- Forest Service treatment is comparable only from 2023 onward (three years).
- National acres burned include the entire country. Western acres sum seven western GACCs (NICC); VPD, ERC, and western DSCI cover western or regional areas.
- ERC and VPD are highly collinear in this window (r ≈ 0.94); treat as related fire-weather signals, not independent predictors.
- Literature ranking on the Coupling tab (Riley et al. 2013; Williams et al. 2015; Abatzoglou & Williams 2016) is for relative strength only; paper methods differ from this repository’s Pearson r.
- Short windows (especially 2023-2025) have very few observations. Treat those correlations as illustrative, not conclusive.
- 2026 partial-year values are excluded from all calculations.

## Files

- `correlation-by-window.csv`: pairwise Pearson and Spearman correlations by analysis window
- `correlation-matrix.csv`: Pearson matrix for 2010-2025 overlap (national and western acres, DSCI, VPD, ERC)

## Reproduce

```bash
python scripts/compute_correlations.py
```

Or run `notebooks/correlation-analysis.ipynb`.
