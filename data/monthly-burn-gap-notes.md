# Monthly burn acres gap (Tier C / Phase 2 research)

**Not on main charts.** Calendar-year acres blur spring vs summer fire timing.

Claim ID: **C-P2-01** (Excluded until data exists).

## What would be needed

- NIFC or NICC **monthly** acres burned (national or western GACC), or
- MTBS / agency fire-perimeter aggregates by month

## Why it matters

Monthly VPD research (`vpd-monthly-correlation-notes.md`) pairs May dryness with **annual** burn totals. A true "May dryness → summer acres" test needs burn outcomes limited to June–September (or similar).

## Current proxy

- May western VPD vs western acres (same calendar year): r ≈ 0.50 (n=16)
- Fire-season VPD vs western acres: r ≈ 0.81 (same window)

## Implementation checklist (when data arrives)

1. Source CSV under `data/` with year, month, acres, geography, source URL
2. Script to annualize June–Sep (or fire-season) western acres
3. Re-run May VPD vs summer-only acres correlation; claim C-R08 addendum
4. Optional Coupling supplementary scatter; keep off main path until n and geography are solid
5. Fact-check + `audit_data.py` row checks

## Status

**Scaffolded 2026-07-16.** No monthly burn pipeline in this repo yet.
