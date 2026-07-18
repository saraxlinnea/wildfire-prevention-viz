# Wildfire smoke PM2.5 (annual CONUS)

Repository chart series for **How to read → Why smoke matters**. Not on Outcomes/Patterns main path.

## Source

- **Childs et al. 2022**, *Environmental Science & Technology* 56(19):13607-13621. [doi:10.1021/acs.est.2c02934](https://doi.org/10.1021/acs.est.2c02934)
- **Dataset:** Harvard Dataverse [doi:10.7910/DVN/DJVMTV](https://doi.org/10.7910/DVN/DJVMTV) — county daily wildfire smoke PM2.5 predictions, 2006-2020.

## Build

```bash
# Downloads ~75 MB county file to data/smoke-source/ (gitignored), writes annual CSV
python scripts/build_smoke_annual.py
# Rebuild from cached county file only:
python scripts/build_smoke_annual.py --local
```

County file is tab-separated: `GEOID`, `date`, `smokePM_pred`. Only smoke days are listed; non-smoke days are 0 by construction in the model.

**Annual county mean** = sum(`smokePM_pred`) / days in calendar year.  
**National series** = unweighted mean across counties (not population-weighted; Childs paper uses population weighting for some national summaries).

## Chart on page

- `data/smoke-pm25-annual.csv` → `#chart-smoke-pm25` on How to read tab
- Claim **C-IMP03** (series); literature stats **C-IMP01**, **C-IMP02**; exploratory acres pairing **C-IMP04**

## Limits

- **Geography:** CONUS only; not Alaska/Hawaii; not aligned with western GACC acres scope.
- **Years:** 2006-2020 only (Childs v1 dataset end).
- **Not causal:** co-movement with NIFC national acres (C-IMP04) does not mean acres caused exposure; wind and population matter.
- **Not a smoke forecast** for 2026.

## Related literature (prose only on page)

- **Burke et al. 2023**, *Nature* — wildfire smoke influence on PM2.5 trends in most CONUS states since ~2016 (claim C-IMP01).
