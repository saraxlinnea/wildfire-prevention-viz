# Visual QA checklist

Run after substantive HTML/JS/chart changes. Requires local server (`python3 -m http.server 8000`).

## Setup

- [ ] Open `http://localhost:8000/` (not `file://`)
- [ ] Hard refresh (`Cmd+Shift+R`)

## Outcomes tab

- [ ] Fire chart renders (acres + % toggle)
- [ ] Rolling band, 2026 YTD point, forecast range visible in acres mode
- [ ] Primary callouts: 3.7M + +29%; secondary: 3rd + AccuWeather
- [ ] Chart questions + plain-read on fire and west-vs-nation
- [ ] West briefing cites median ≈ 60%; nested bars (national shell + western fill), not dual lines
- [ ] Regional share has continuous bars 2003-2025 (no gray 2008-2009 gap columns)
- [ ] Regional share chart on Outcomes (stacked bars + 2008-2009 gap)
- [ ] Y-axis labels visible (chart left padding)
- [ ] Callouts are fire-only (no 35% treatment)
- [ ] Header dek: mid-season “underway / Jul-Sep” (not “ahead”)

## Drivers tab

- [ ] 35% FS context strip visible
- [ ] Chart questions on treatment / WUI / dual-axis / dryness
- [ ] DSCI plain sentence: YTD weekly average (terms + dryness note)
- [ ] Treatment chart full width; fiscal/calendar + combined/breakdown toggles work
- [ ] WUI chart full width below treatment (not side-by-side smush)
- [ ] Dual-axis treatment vs acres is inside Research `<details>` (not main path); opens and embeds
- [ ] ERC/VPD dryness toggle updates chart and legend text (keep as **lines**, not bars)
- [ ] Open treatment-per-acre `<details>`; chart embeds

## Patterns tab (was Coupling)

- [ ] Tab label reads **Patterns**
- [ ] Scatter: ERC/VPD and western/national toggles; r note visible
- [ ] Methods box includes plain-language r sentence
- [ ] Western acres + regional share charts render
- [ ] Regional share: stacked **bars** (not blank); gray 2008-2009 gap; calendar-year + share axis titles; caption mentions gap
- [ ] Research `<details>` closed on first visit
- [ ] Open supplementary `<details>`: sensitivity table, May VPD, ignition bar, rank bar, matrix, lag
- [ ] Ignition chart **not** on main path (only inside supplementary)

## How to read tab

- [ ] Start here path is 2-3 minutes with full Outcomes / Drivers / Patterns / limits paragraphs
- [ ] Dataset gaps + glossary collapsed by default
- [ ] Policy context uses Stateline-attributed fire/smoke wording (not "many")

## Mobile (~375px width)

- [ ] Tab bar wraps; active tab visible
- [ ] Legends wrap; chart heights acceptable
- [ ] No horizontal scroll on body

## Tooltips

- [ ] Fire, treatment, scatter, regional share show year + values on hover

## Footer / links

- [ ] CSV download works
- [ ] Stateline, NIFC, gridMET links open

## Sign-off

| Date | Pass? | Notes |
|---|---|---|
| | | |
