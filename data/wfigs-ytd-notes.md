# WFIGS YTD perimeter snapshot

**Not live.** Static GeoJSON for Outcomes ops context.

| Field | Value |
|---|---|
| Source | NIFC WFIGS Interagency Perimeters YearToDate |
| Fetched (UTC) | 2026-08-03T19:36:22Z |
| Filter | GIS acres ≥ 100 |
| Features | 962 |
| Perimeter acres sum | 6,106,543 (not equal to NIFC national YTD) |

## Limits

- Perimeters are incomplete and lag the fire front.
- Sum of perimeter acres is not the NIFC National Fire News YTD total.
- Fires under 100 GIS acres are omitted to keep the static file small.
- Refresh with `python scripts/fetch_wfigs_ytd.py` when updating YTD callouts.

## Claim

C-WFIGS01
