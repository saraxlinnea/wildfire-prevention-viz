#!/usr/bin/env python3
"""Build data/gacc-regions.geojson: per-state polygons tagged with GACC rollup region.

One feature per state (not dissolved MultiPolygons). Vega albersUsa expects
state-like polygons; dissolved regions clipped the West coast.

Regions match regional-acres-annual.csv (West / South / East / Alaska).

Usage:
  python scripts/build_gacc_regions_geojson.py
"""

from __future__ import annotations

import json
import subprocess
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "gacc-regions.geojson"
STATES_URL = (
    "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/"
    "data/geojson/us-states.json"
)

WEST = {
    "Washington", "Oregon", "California", "Idaho", "Nevada", "Utah",
    "Arizona", "New Mexico", "Colorado", "Wyoming", "Montana",
    "North Dakota", "South Dakota", "Nebraska", "Kansas",
}
SOUTH = {
    "Texas", "Oklahoma", "Arkansas", "Louisiana", "Mississippi", "Alabama",
    "Tennessee", "Kentucky", "Georgia", "Florida", "South Carolina",
    "North Carolina", "Virginia",
}
ALASKA = {"Alaska"}
SKIP = {"Hawaii", "Puerto Rico"}


def clamp_lon(lon: float) -> float:
    if lon < -180:
        return -180.0
    if lon > 180:
        return 180.0
    return float(lon)


def ring_ok(ring: list) -> bool:
    lons = [p[0] for p in ring]
    return bool(lons) and (max(lons) - min(lons) <= 180)


def clean_geom(geom: dict) -> dict | None:
    t = geom["type"]
    if t == "Polygon":
        rings = []
        for ring in geom["coordinates"]:
            fixed = [[clamp_lon(p[0]), p[1]] for p in ring]
            if len(fixed) >= 4 and ring_ok(fixed):
                if fixed[0] != fixed[-1]:
                    fixed.append(fixed[0])
                rings.append(fixed)
        if not rings:
            return None
        return {"type": "Polygon", "coordinates": rings}
    if t == "MultiPolygon":
        polys = []
        for poly in geom["coordinates"]:
            rings = []
            for ring in poly:
                fixed = [[clamp_lon(p[0]), p[1]] for p in ring]
                if len(fixed) >= 4 and ring_ok(fixed):
                    if fixed[0] != fixed[-1]:
                        fixed.append(fixed[0])
                    rings.append(fixed)
            if not rings:
                continue
            # Drop dateline scrap rings (clamped Aleutians).
            mean_lon = sum(p[0] for p in rings[0]) / len(rings[0])
            if mean_lon <= -179.2:
                continue
            polys.append(rings)
        if not polys:
            return None
        return {"type": "MultiPolygon", "coordinates": polys}
    return None


def region_for(name: str) -> str | None:
    if name in SKIP or name is None:
        return None
    if name in WEST:
        return "West"
    if name in SOUTH:
        return "South"
    if name in ALASKA:
        return "Alaska"
    return "East"


def load_states() -> dict:
    try:
        import urllib.request
        with urllib.request.urlopen(STATES_URL, timeout=60) as resp:
            return json.load(resp)
    except Exception:
        # Fallback: curl (macOS urllib SSL often fails)
        r = subprocess.run(
            ["curl", "-fsSL", STATES_URL],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )
        if r.returncode != 0:
            raise SystemExit(r.stderr or "failed to fetch states geojson")
        return json.loads(r.stdout)


def main() -> None:
    states = load_states()
    features = []
    counts = {"West": 0, "South": 0, "East": 0, "Alaska": 0}
    for feat in states["features"]:
        name = feat["properties"].get("name")
        region = region_for(name)
        if not region:
            continue
        geom = clean_geom(feat["geometry"])
        if not geom:
            print(f"skip (bad geom): {name}")
            continue
        features.append({
            "type": "Feature",
            "properties": {
                "region": region,
                "state": name,
                "gacc_rollup": region,
                "note": "State polygon in GACC rollup; not official GACC boundary",
            },
            "geometry": geom,
        })
        counts[region] += 1

    out = {
        "type": "FeatureCollection",
        "name": "gacc-regions",
        "properties": {
            "description": (
                "Per-state polygons tagged with NICC GACC rollup region "
                "for albersUsa choropleth (dissolved MultiPolygons clipped West)."
            ),
            "source_states": STATES_URL,
            "page_match": "data/regional-acres-annual.csv regional shares",
            "encoding": "One feature per state; color by region share join",
            "counts": counts,
        },
        "features": features,
    }
    raw = json.dumps(out, separators=(",", ":"))
    OUT.write_text(raw, encoding="utf-8")
    print(f"Wrote {OUT} ({len(raw) / 1e6:.2f} MB, n={len(features)}, {counts})")


if __name__ == "__main__":
    main()
