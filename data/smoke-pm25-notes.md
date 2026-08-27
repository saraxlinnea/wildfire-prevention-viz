# Wildfire smoke PM2.5 (annual CONUS)

Repository chart series for **Impacts → Why smoke matters**.

## Source (live chart)

- **Stanford ECHO Lab v2.0 beta** (Childs et al., “Growing wildfire-derived PM2.5…,” in review). Preliminary; subject to change. [ECHO wildfire_smoke](https://www.stanfordecholab.com/wildfire_smoke).
- **Years:** 2006-2023 (county daily → annual unweighted mean).
- **Artifact:** `data/smoke-pm25-annual.csv` (same values as `smoke-pm25-v2-beta-annual.csv`).

## Archive (not on live chart)

- **Childs et al. 2022** v1 (Harvard Dataverse [doi:10.7910/DVN/DJVMTV](https://doi.org/10.7910/DVN/DJVMTV)): `data/smoke-pm25-v1-annual.csv` (2006-2020 only).
- Rebuild v1: `python scripts/build_smoke_annual.py` (writes the live path historically; prefer writing to a temp path or restore from `smoke-pm25-v1-annual.csv` if regenerating archive).

## Build (live / v2)

```bash
# County daily under data/smoke-source/county/ (gitignored), then:
python scripts/build_smoke_v2_beta_annual.py --local
# Copy or sync into live annual file when locking:
# cp data/smoke-pm25-v2-beta-annual.csv data/smoke-pm25-annual.csv
python scripts/compare_smoke_v2_bakeoff.py   # needs smoke-pm25-v1-annual.csv
```

County file lists smoke days only; non-smoke days = 0 by construction.

**Annual county mean** = sum(`smokePM_pred`) / days in calendar year.  
**National series** = unweighted mean across counties.

## Chart on page

- `data/smoke-pm25-annual.csv` → `#chart-smoke-pm25` on Impacts (main path)
- Claim **C-IMP03** (series; **Speculative** while ECHO labels beta); literature stats **C-IMP01**, **C-IMP02**; exploratory acres pairing **C-IMP04**
- Shared window with structures: **2014-2023** Impacts research `<details>` (claim **C-IMP05**); 2024-2025 structures-only on structures chart
- Page copy: series **ends 2023**; not a 2026 smoke forecast; not total PM2.5 from all sources.

## Bake-off (locked 2026-08-07; wired 2026-08-25)

See [`smoke-pm25-v2-bakeoff.md`](smoke-pm25-v2-bakeoff.md). Overlap vs Childs v1: RMSE ≈ 0.045, ~9% lower. User OK to wire live chart 2026-08-25.

| Product | Years | Status |
|---|---|---|
| Childs / Dataverse **v1** | 2006-2020 | Archived (`smoke-pm25-v1-annual.csv`) |
| ECHO Lab **v2.0 beta** | 2006-2023 | **Live** `#chart-smoke-pm25` |
| EPA / AirNow total PM2.5 | varies | **Do not stitch** |

## Limits

- **Geography:** CONUS only; not Alaska/Hawaii; not aligned with western GACC acres scope.
- **Years:** 2006-2023 on the live page (beta).
- **Not causal:** co-movement with NIFC national acres (C-IMP04) or with structures (C-IMP05) does not mean acres or homes caused exposure (or the reverse); wind and population matter.
- **Not a smoke forecast** for 2026.

## Related literature (prose only on page)

- **Burke et al. 2023**, *Nature* — wildfire smoke influence on PM2.5 trends in most CONUS states since ~2016 (claim C-IMP01).
- **Childs et al. 2022**, *ES&T* — v1 methods and extreme-exposure prose (claim C-IMP02).
