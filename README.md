# U.S. Wildfire Prevention vs. Acres Burned (2015–2026)

An interactive data visualization examining the relationship between federal wildfire prevention work and annual acres burned across the United States.

**[View live →](https://saraxlinnea.github.io/wildfire-prevention-viz)**

---

## What This Shows

Two trends in the same chart:

- **Total U.S. acres burned per year** (2015–2026), sourced from NIFC annual statistics
- **Forest Service hazardous fuels treatment** (2023–2025), sourced from NPR's analysis of Forest Service FACTS database and the Center for Western Priorities

In 2025, the Forest Service treated 35% fewer acres for wildfire risk than in 2024. This is the sharpest single-year decline in recent history. As of April 2026, nearly 1.9 million acres have already burned, running at 194% of the ten-year average before peak fire season begins.

---

## Data Sources

| Dataset | Source | Years |
|---|---|---|
| Total U.S. acres burned | [NIFC Annual Statistics](https://www.nifc.gov/fire-information/statistics) | 2015–2025 |
| 2026 YTD acres burned | [NIFC May 1 2026 Outlook](https://www.nifc.gov/nicc-files/predictive/outlooks/monthly_seasonal_outlook.pdf) | Jan–Apr 2026 |
| Forest Service fuels treatment | [NPR analysis / Grassroots Wildland Firefighters](https://www.npr.org/2026/05/04/nx-s1-5801475/) | 2023–2025 |
| FS treatment (35% drop) | [Center for Western Priorities, May 27 2026](https://westernpriorities.org/2026/05/u-s-forest-service-treated-35-fewer-acres-for-wildfire-risk-in-2025/) | 2024–2025 |
| Interior Dept treatment | [DOI Fuels Management](https://www.doi.gov/wildlandfire/fuels) | 2018–2024 |
| Ten-year average | [Congress.gov CRS Report IF10244](https://www.congress.gov/crs-product/IF10244) | 2013–2022 |

Raw data is available in [`data/wildfire-data.csv`](data/wildfire.csv).

---

## A Note on Data Availability

Forest Service hazardous fuels treatment data is published consistently from 2023 onward. Prior to that, methodology and reporting changed across administrations, making direct year-to-year comparisons unreliable. The chart reflects what the data actually supports rather than extending a trend line further back than the evidence warrants.

---

## Built With

- [Vega-Lite](https://vega.github.io/vega-lite/) — declarative grammar of interactive graphics
- Vanilla HTML and CSS
- No build tools, no dependencies beyond CDN-loaded Vega

---


## Context

The Forest Service announced plans in March 2026 to close 57 of its 77 research stations. These are the facilities that study how fires spread and what stops them. This visualization was built to provide context for that decision against the backdrop of the 2026 fire season.

---

