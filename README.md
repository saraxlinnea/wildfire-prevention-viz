# An Ounce of Prevention: Our Forests on Fire

U.S. wildfire data visualization, 2015-2026. Shows the gap between federal hazardous fuels treatment work and annual acres burned.

**[View live](https://saraxlinnea.github.io/wildfire-prevention-viz)**

---

## What This Shows

Two things happening at the same time:

- **Total U.S. acres burned per year** (2015-2026), from NIFC annual statistics
- **Forest Service hazardous fuels treatment** (2023-2025), from NPR's analysis of USFS FACTS data
- **Interior Department hazardous fuels treatment** (2018-2024), from DOI fuels management program

In 2025 the Forest Service treated 35% fewer acres for wildfire risk than the year before. As of May 29, 2026, more than 2.3 million acres have already burned. Peak fire season starts in summer.

This chart does not claim that cutting prevention in 2025 directly caused the 2026 fire season. It shows two things happening at the same time. You can draw your own conclusions.

---

## Data Sources

| Dataset | Source | Years | Notes |
|---|---|---|---|
| Total U.S. acres burned | [NIFC Total Wildfires and Acres](https://www.nifc.gov/fire-information/statistics) | 2015-2025 | Calendar year |
| 2026 YTD acres burned | [NIFC National Fire News, May 29 2026](https://www.nifc.gov/fire-information/nfn) | Jan-May 2026 | Partial year only |
| Forest Service treatment | [NPR analysis of USFS FACTS database, May 4 2026](https://www.npr.org/2026/05/04/nx-s1-5801475/) | 2023-2025 | Cross-checked by Center for Western Priorities |
| Interior Dept treatment | [DOI fuels management program](https://www.doi.gov/wildlandfire/fuels) | 2018-2024 | Fiscal year Oct 1 start |
| Ten-year average | [Congress.gov CRS Report IF10244](https://www.congress.gov/crs-product/IF10244) | 2013-2022 | |
| 2026 forecast | AccuWeather 2026 Wildfire Season Forecast | 2026 | 5.5-8M acres projected |

Raw data: [`data/wildfire-data.csv`](data/wildfire-data.csv)

---

## A Note on the Data

Forest Service treatment data is only available consistently from 2023 onward. Before that the methodology changed enough that year-to-year comparisons become unreliable. Interior Department figures run on a fiscal year starting October 1, not a calendar year, so they are not perfectly comparable to the acres burned figures which are calendar year. Fire outcomes and prevention work do not track each other neatly year to year. Drought, wind, and fuel load drive a lot of the variation.

---

## Built With

- [Vega-Lite](https://vega.github.io/vega-lite/)
- Vanilla HTML and CSS
- No build tools or dependencies beyond CDN-loaded Vega

```bash
git clone https://github.com/saraxlinnea/wildfire-prevention-viz.git
cd wildfire-prevention-viz
open index.html
```

---

*Sara Bower · San Francisco · June 2026*
