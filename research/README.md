# Research

Structured reasoning artifacts for the wildfire visualization. Follows [AI-OS](https://github.com/saraxlinnea/AI-OS) layers.

| File | Purpose |
|---|---|
| [`claims.md`](claims.md) | Claim registry for every statement on the live page |
| [`fact-check-log.md`](fact-check-log.md) | Pass/fail audit log per claim ID (latest run: 2026-07-13) |

## Using the claim registry

1. Before editing copy on `index.html`, check whether the statement already has a claim ID in `claims.md`.
2. New factual claims need a row before publish: normalized statement, source, status, confidence.
3. Causal or predictive language defaults to **Excluded** or **Speculative** unless evidence supports upgrade.
4. Editorial lines (quote block, closing) are tagged **Editorial** and list which factual claims they depend on.

## Re-running the fact-check

```bash
cd "/Users/saralinnea/Desktop/Projects/wildfire analysis"
python scripts/audit_data.py          # Tier A internal data audit
```

Then spot-check external sources listed in `claims.md` (NIFC, NPR/CWP, AccuWeather, DOI, CRS, Stateline). Update `fact-check-log.md` with the run date and any changed results.

If `audit_data.py` fails with a pandas/numpy error, run the manual checks documented in the latest `fact-check-log.md` Tier A section.

## Planned additions

- `reviews/` — PAPER_REVIEW outputs for major sources (NIFC, HFR-DOI-FS 2003–2021, gridMET, etc.)
- `synthesis.md` — cross-source consensus map once 3+ reviews exist
