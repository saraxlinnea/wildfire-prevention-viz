# State / ecoregion small multiples (Tier C / Phase 2 research)

**Not on main charts.**

Claim ID: **C-P2-02** (Excluded until data exists).

## Scope

Per-state or ecoregion panels would show whether western ERC–acres coupling is uniform or driven by California, Oregon, and northern Rockies.

## Data gaps

- State-level acres: NIFC state summaries exist but are not normalized in this repo.
- gridMET masks are regional bboxes, not state polygons.
- Alignment with GACC geography is imperfect.

## Lower-effort alternative on this page (shipped)

- Regional GACC share chart on Outcomes + Patterns (West / South / Alaska / East)
- Nested western-fill vs national bars
- Story-year annotations (2015, 2020, 2022)

## Implementation checklist (when data arrives)

1. Choose grain: state vs Bailey / Omernik ecoregion
2. Build annual acres CSV + claim IDs (Supported only with cited extract)
3. Pair with state-masked or GACC-proxy drivers (document mismatch)
4. Small-multiple chart in Patterns supplementary first (n and geography caveats)
5. Fact-check + visual QA

## Status

**Scaffolded 2026-07-16.** Deferred until state-level extract scripts exist.
