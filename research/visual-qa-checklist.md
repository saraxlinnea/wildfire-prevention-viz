# Visual QA checklist

Run after substantive HTML/JS/chart changes. Requires local server (`python3 -m http.server 8000`).

## Setup

- [x] Open `http://localhost:8000/explore.html` (not `file://`)
- [x] Hard refresh (`Cmd+Shift+R`)
- [x] Clear `localStorage.wf-guide-seen` once to re-test welcome card

## Overview

- [x] Callouts: 5.2M + +37%; secondary 3rd only (no AccuWeather peer callout)
- [x] Fire chart renders (acres + fires toggle)
- [x] Default: Map by year
- [x] West vs nation and Four regions work
- [x] Ops snapshot details defer-loads WFIGS
- [x] No Explore Where bridge CTA; no separate Where tab

## Drivers

- [x] Opening prose: multi-factor; starts vs large-acre conditions; vary by region; South mentions KBDI
- [x] Top-2 regional bars with West / South / East chips (East caveat; South may show VPD + KBDI)
- [x] South caption: operational KBDI + weak annual r honesty
- [x] Dryness chart (ERC/VPD toggle) + national DSCI details
- [x] Literature rank in details; scatter + Westerling on main path
- [x] Terms: ERC / VPD / DSCI; Methods glossary includes KBDI
- [x] No treatment / WUI charts on this tab
- [x] Supplementary research drawers open and fill charts/tables

## Context

- [x] Federal 35% strip + treatment limits + treatment chart + WUI
- [x] Dual-axis + treatment-per-acre + policy-scatter inside Research details
- [x] No dryness scatter / ERC chart on this tab
- [x] Prescribed-burn photo present

## Impacts

- [x] Tab label **Impacts**
- [x] Smoke prose + `#chart-smoke-pm25`
- [x] “Not on this page yet” lists structures / suppression cost / evacuations (no invented numbers)
- [x] No Restart guide button

## Methods (right utility tab)

- [x] Methods sits on the right of the tab bar; story tabs on the left
- [x] Opens how to read, scientific limits, policy context, gaps, glossary, sources
- [x] TOC anchors work; footer Methods link switches tab
- [x] How to read names Overview / Drivers / Context / Impacts
- [x] Not included as a tour step

## Tour / welcome

- [x] Welcome: Guide me / Skip; restart copy mentions header Tour
- [x] Guide me: 4 steps Overview → Drivers → Context → Impacts
- [x] Header Tour always available
- [x] No `#restart-guide-btn`
- [x] `?tab=season` and `?tab=where` resolve to Overview

## Sign-off

| Date | Pass? | Notes |
|---|---|---|
| 2026-08-04 | **Pass (structure)** | Visual polish: Explore muted site-wide photo bg + cream scrim; visible h1; dropped numbered section labels and handoff-only Next notes; Context limits → Methods link. AccuWeather still notes-only; WFIGS still Ops details; research drawers not promoted. Hard-refresh with `?v=20260804visual`. |
| 2026-08-03 | **Pass** | Headless Chrome on `localhost:8000`: Home + Explore (Overview · Drivers · Context · Impacts · Methods). Hard refresh + cleared `wf-guide-seen`. Tour once Overview→Drivers→Context→Impacts. South chip shows KBDI caption (r ≈ 0.20, does not beat VPD). Removed dead CSS for retired Where tab. AccuWeather remains chart legend/notes only (not a peer callout). |
