# Southeast KBDI (Jan-May mean)

Exploratory regional series for Drivers South context.

## What it is

**Keetch-Byram Drought Index (KBDI)** estimates moisture deficit in the top ~8 inches of soil (0 = saturated, 800 = extremely dry). It is a classic Southern Area operational drought / deep-drying index used with NFDRS (alongside ERC, BI, and fuel moisture).

gridMET does not publish KBDI. This series is **computed** from gridMET daily maximum temperature (`tmmx`) and precipitation (`pr`) using the common NFDRS-adjunct Keetch & Byram (1968) daily update (0.2 inch interception; drought factor depends on Tmax and mean annual precip R).

## Geography and season

- Bbox: lon −106 to −81, lat 25–36 (same SE research bbox as south VPD/ERC/fm100)
- Season: **Jan-May mean** of daily regional KBDI (southern-relevant; not western May-Sep)
- R (drought factor): mean annual precip over sample years 2010/2015/2020 for this bbox (~45.6 in in the 2026-08-03 build)

## Files and reproduce

```bash
python scripts/extend_kbdi.py --start 2010 --end 2025
python scripts/compute_regional_correlations.py
```

- `data/south-kbdi-annual.csv`
- Ranked with other South drivers in `data/regional-correlation-rank.csv`

## Exploratory result (2013-2025, n=13)

Southern GACC acres vs Jan-May KBDI: Pearson r ≈ **0.20** (weak). Does **not** beat south Jan-Apr VPD (r ≈ 0.36). Still beats fm100 by absolute r in this window, so it can appear as the second South bar. Not causal. Annual climate indices often track SE acres weakly because southern fire is also human-ignition and short-weather driven.

## Limits

- Regional spatial-mean weather then one KBDI path (not cell-wise KBDI then average)
- Spin-up uses prior calendar year so Jan is not cold-started at 0
- Formula variants exist; this matches a common NFDRS-adjunct form, not a SACC daily product archive
- Soft-fail: Drivers South copy still explains KBDI if CSV is missing; top bars only include KBDI when present in the rank CSV
