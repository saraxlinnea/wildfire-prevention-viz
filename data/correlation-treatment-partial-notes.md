# Treatment vs acres — partial correlations (exploratory)

Drivers tab research under the dual-axis chart. **Not causal.**

## Window

HFR combined federal treatment (FY 2003-2021) vs NIFC national acres burned
(calendar year label = fiscal year). n = 19.

Controls available in this repository:

- western fire-season ERC (gridMET)
- western fire-season VPD (gridMET; collinear with ERC)
- linear calendar year
- HFR WUI share of designation
- western share of NICC GACC acres

Still missing: El Niño, ignitions, suppression effort, housing growth, vegetation recovery.

## Headline

- Raw treatment–acres r ≈ **-0.135**
- After ERC + VPD + year + WUI share + western share: partial r ≈ **-0.101**
- Joint R² with treatment ≈ **0.167**; without treatment ≈ **0.135**

Treatment adds little once dryness and composition controls are in the model.
Weak negative co-movement is not evidence that cutting treatment caused larger burn years.

## Reproduce

```bash
python scripts/compute_treatment_partial_correlations.py
```
