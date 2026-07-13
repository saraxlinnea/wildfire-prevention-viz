# Regional correlation notes (Phase 2–3)

Exploratory only. Notebook/repository analysis; Coupling tab has a summary accordion.

## Window

- **2013-2025** calendar years (n = 13), `gacc_coverage=all_gaccs`
- 2010-2012 excluded (EA/SA/AK absent in legacy NICC extract)

## Geography

- **West:** NICC western GACCs vs gridMET west of 100°W May-Sep + USDM NWS WR DSCI
- **South:** NICC SA GACC vs gridMET SE bbox Jan-Apr (VPD/ERC/fm100) + USDM NWS SR DSCI
- **East:** NICC EA GACC vs gridMET Mid-Atlantic/NE bbox Mar-Jun + USDM NWS ER DSCI
- **Alaska:** NICC AK GACC vs USDM NWS AR DSCI only (gridMET lat max ~49.4°N)

## Files

- `regional-correlation-rank.csv`: acres vs VPD/ERC/DSCI ranked within each region
- `regional-correlation-matrix.csv`: Pearson matrix for regional series
- `regional-gridmet-annual.csv`: regional driver series (`scripts/extend_regional_indices.py`)
- `regional-dsci-annual.csv`: NWS regional DSCI (`scripts/fetch_regional_dsci.py`)
- `south-fm100-annual.csv`: Southeast Jan-Apr 100-hr fuel moisture (`scripts/extend_fm100.py`)

## Reproduce

```bash
python scripts/fetch_regional_dsci.py
python scripts/extend_fm100.py --start 2010 --end 2025
python scripts/extend_regional_indices.py --start 2010 --end 2025
python scripts/compute_regional_correlations.py
```
