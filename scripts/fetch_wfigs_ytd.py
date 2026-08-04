#!/usr/bin/env python3
"""Fetch NIFC WFIGS Year-to-Date fire perimeters into a slim static GeoJSON.

Uses curl (more reliable than urllib SSL on some macOS Pythons).
Filters to GIS acres >= 100 and simplifies coordinates for GitHub Pages weight.

Usage:
  python scripts/fetch_wfigs_ytd.py
"""

from __future__ import annotations

import json
import subprocess
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "wfigs-ytd-snapshot.geojson"
NOTES = ROOT / "data" / "wfigs-ytd-notes.md"

BASE = (
    "https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
    "WFIGS_Interagency_Perimeters_YearToDate/FeatureServer/0/query"
)
FIELDS = "OBJECTID,poly_IncidentName,poly_GISAcres,attr_PercentContained,attr_POOState"
WHERE = "poly_GISAcres >= 100"
MIN_ACRES = 100
PAGE = 500


def curl_json(params: dict) -> dict:
    url = BASE + "?" + urllib.parse.urlencode(params)
    result = subprocess.run(
        [
            "curl",
            "-fsSL",
            "-A",
            "wildfire-prevention-viz/1.0 (research snapshot)",
            "-H",
            "Referer: https://data-nifc.opendata.arcgis.com/",
            url,
        ],
        capture_output=True,
        text=True,
        timeout=180,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit((result.stderr or result.stdout or "curl failed")[:800])
    return json.loads(result.stdout)


def simplify_ring(ring: list, step: int = 12, nd: int = 2) -> list:
    if len(ring) <= 8:
        pts = ring
    else:
        pts = ring[::step]
        if pts[-1] != ring[-1]:
            pts.append(ring[-1])
        if len(pts) < 4:
            pts = ring
    out = [[round(x, nd), round(y, nd)] for x, y in pts]
    if out and out[0] != out[-1]:
        out.append(out[0])
    return out


def simplify_geom(geom: dict | None) -> dict | None:
    if not geom:
        return None
    t = geom.get("type")
    coords = geom.get("coordinates")
    if t == "Polygon":
        return {"type": "Polygon", "coordinates": [simplify_ring(r) for r in coords]}
    if t == "MultiPolygon":
        return {
            "type": "MultiPolygon",
            "coordinates": [[simplify_ring(r) for r in poly] for poly in coords],
        }
    return geom


def fetch_features() -> list[dict]:
    features: list[dict] = []
    offset = 0
    while True:
        chunk = curl_json(
            {
                "where": WHERE,
                "outFields": FIELDS,
                "f": "geojson",
                "outSR": "4326",
                "geometryPrecision": "2",
                "resultOffset": str(offset),
                "resultRecordCount": str(PAGE),
                "returnExceededLimitFeatures": "true",
            }
        )
        feats = chunk.get("features") or []
        print(f"offset {offset} got {len(feats)}")
        if not feats:
            break
        features.extend(feats)
        if len(feats) < PAGE:
            break
        offset += len(feats)
        if offset > 30000:
            raise SystemExit("too many features; aborting")
    return features


def slim_features(raw: list[dict]) -> list[dict]:
    slim: list[dict] = []
    for feat in raw:
        geom = simplify_geom(feat.get("geometry"))
        if not geom:
            continue
        props = feat.get("properties") or {}
        acres = props.get("poly_GISAcres")
        if not isinstance(acres, (int, float)) or acres < MIN_ACRES:
            continue
        slim.append(
            {
                "type": "Feature",
                "geometry": geom,
                "properties": {
                    "name": props.get("poly_IncidentName") or "Unnamed",
                    "acres": round(float(acres), 1),
                    "pct_contained": props.get("attr_PercentContained"),
                    "state": props.get("attr_POOState"),
                },
            }
        )
    slim.sort(key=lambda f: f["properties"].get("acres") or 0)
    return slim


def write_notes(meta: dict) -> None:
    NOTES.write_text(
        f"""# WFIGS YTD perimeter snapshot

**Not live.** Static GeoJSON for Outcomes ops context.

| Field | Value |
|---|---|
| Source | NIFC WFIGS Interagency Perimeters YearToDate |
| Fetched (UTC) | {meta.get("fetched_at_utc")} |
| Filter | GIS acres ≥ {MIN_ACRES} |
| Features | {meta.get("feature_count")} |
| Perimeter acres sum | {f"{meta.get('acres_sum'):,.0f}" if meta.get("acres_sum") is not None else "—"} (not equal to NIFC national YTD) |

## Limits

- Perimeters are incomplete and lag the fire front.
- Sum of perimeter acres is not the NIFC National Fire News YTD total.
- Fires under {MIN_ACRES} GIS acres are omitted to keep the static file small.
- Refresh with `python scripts/fetch_wfigs_ytd.py` when updating YTD callouts.

## Claim

C-WFIGS01
""",
        encoding="utf-8",
    )


def main() -> None:
    count = curl_json({"where": WHERE, "returnCountOnly": "true", "f": "json"}).get("count")
    print(f"service count (acres>={MIN_ACRES}): {count}")
    slim = slim_features(fetch_features())
    acres_vals = [f["properties"]["acres"] for f in slim]
    fetched_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    meta = {
        "source": "NIFC WFIGS Interagency Perimeters YearToDate",
        "source_url": BASE.rsplit("/0/query", 1)[0],
        "open_data_url": "https://data-nifc.opendata.arcgis.com/",
        "fetched_at_utc": fetched_at,
        "feature_count": len(slim),
        "acres_sum": round(sum(acres_vals), 1) if acres_vals else None,
        "filter": f"poly_GISAcres >= {MIN_ACRES}; coords rounded/decimated for page weight",
        "note": (
            "Static snapshot for Outcomes ops context. Not NIFC national YTD acres; "
            "perimeters incomplete and lag the fire front. "
            f"Fires under {MIN_ACRES} GIS acres omitted."
        ),
    }
    out = {
        "type": "FeatureCollection",
        "name": "wfigs-ytd-snapshot",
        "properties": meta,
        "features": slim,
    }
    raw = json.dumps(out, separators=(",", ":"))
    OUT.write_text(raw, encoding="utf-8")
    write_notes(meta)
    print(f"Wrote {OUT} ({len(raw.encode()) / 1e6:.2f} MB, n={len(slim)})")
    print(f"Wrote {NOTES}")


if __name__ == "__main__":
    main()
