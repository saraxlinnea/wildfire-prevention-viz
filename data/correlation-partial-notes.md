# Partial correlation notes (exploratory)

Repository research for Patterns supplementary. **Not causal.**

## Window

Western GACC acres × western fire-season ERC/VPD, calendar years **2010-2025** (n = 16).

## Results

See `correlation-partial.csv`. Headline:

- Raw acres–ERC r ≈ **0.821**; acres–VPD r ≈ **0.808**
- Partial acres–ERC | VPD ≈ **0.30**; acres–VPD | ERC ≈ **0.18**
- Controlling for linear year barely changes raw r
- ERC–VPD collinearity r ≈ **0.944**
- Joint ERC+VPD multiple R² ≈ **0.684** (barely above ERC alone)

## Interpretation

ERC and VPD are nearly the same dryness signal in this sample. After one is controlled for, the other adds little. This is a redundancy check, not evidence that either “causes” acres burned. Still no controls for El Niño, ignitions, suppression, or housing growth.

## Reproduce

```bash
python scripts/compute_partial_correlations.py
```
