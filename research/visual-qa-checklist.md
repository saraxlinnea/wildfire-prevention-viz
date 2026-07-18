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
- [ ] Regional share chart on Outcomes (stacked bars, full 2003-2025 span)
- [ ] Y-axis labels visible (chart left padding)
- [ ] Callouts are fire-only (no 35% treatment)
- [ ] Header dek: mid-season “underway / Jul-Sep” (not “ahead”)

## Drivers tab

- [ ] 35% FS context strip visible
- [ ] Chart questions on treatment / dual-axis / WUI / dryness
- [ ] Order: treatment total → dual-axis (+ controls table) → WUI → dryness
- [ ] Dual-axis on main path (not inside Research `<details>`)
- [ ] Treatment partial-corr table fills (raw ≈ −0.14; full controls ≈ −0.10)
- [ ] WUI prose has “Why this is important” linking large seasons to communities
- [ ] DSCI plain sentence: YTD weekly average (terms + dryness note)
- [ ] Treatment chart full width; fiscal/calendar + combined/breakdown toggles work
- [ ] WUI chart full width below dual-axis (not side-by-side smush)
- [ ] ERC/VPD dryness toggle updates chart and legend text (keep as **lines**, not bars)
- [ ] Open treatment-per-acre `<details>`; chart embeds

## Patterns tab (was Coupling)

- [ ] Tab label reads **Patterns**
- [ ] Scatter: ERC/VPD and western/national toggles; dynamic r badge updates (r / n / window)
- [ ] Methods box includes plain-language r sentence + limited controls + ERC/VPD collinearity
- [ ] Western acres + regional share charts render
- [ ] Regional share: stacked **bars** (not blank); continuous 2003-2025; calendar-year + share axis titles
- [ ] Westerling snowmelt tercile bars render (Early/Middle/Late; literature attribution)
- [ ] Research `<details>` closed on first visit
- [ ] Open supplementary `<details>`: partial-corr table, sensitivity table, May VPD, ignition bar, rank bar, matrix, lag
- [ ] Ignition chart **not** on main path (only inside supplementary)
- [ ] No ERC × VPD redundancy scatter on page

## How to read tab

- [ ] Start here mentions Why smoke matters
- [ ] Why smoke matters prose cites Burke + Childs with limits
- [ ] Smoke PM2.5 chart renders 2006-2020; 2020 label visible
- [ ] Exploratory r sentence populates (r ≈ 0.65)
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
