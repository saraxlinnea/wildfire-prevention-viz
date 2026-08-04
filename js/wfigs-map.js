/* global L */
(function () {
  var mapInstance = null;
  var layerGroup = null;
  var homeLandLayer = null;
  var gaccMapInstance = null;
  var gaccLayerGroup = null;

  function formatAcres(n) {
    if (n == null || !Number.isFinite(n)) return '-';
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return Math.round(n).toLocaleString('en-US');
    return String(Math.round(n * 10) / 10);
  }

  function formatFetched(iso) {
    if (!iso) return 'unknown date';
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    }) + ' UTC';
  }

  function updateCopy(meta) {
    var asOf = document.getElementById('wfigs-as-of');
    var countEl = document.getElementById('wfigs-feature-count');
    var acresEl = document.getElementById('wfigs-acres-sum');
    if (asOf) asOf.textContent = formatFetched(meta && meta.fetched_at_utc);
    if (countEl) {
      countEl.textContent = meta && meta.feature_count != null
        ? String(meta.feature_count)
        : '-';
    }
    if (acresEl) {
      var sum = meta && meta.acres_sum;
      acresEl.textContent = sum != null ? (sum / 1000000).toFixed(1) + 'M' : '-';
    }
  }

  function styleFeature(feature) {
    var acres = feature.properties && feature.properties.acres;
    var weight = acres >= 50000 ? 1.2 : 0.7;
    var fill = acres >= 100000 ? 0.55 : acres >= 10000 ? 0.4 : 0.28;
    return {
      color: '#8a2f12',
      weight: weight,
      opacity: 0.9,
      fillColor: '#c94a1a',
      fillOpacity: fill
    };
  }

  /** Home poster: dark ink on cream land (no basemap). */
  function styleFeatureHome(feature) {
    var acres = feature.properties && feature.properties.acres;
    var weight = acres >= 50000 ? 1.1 : 0.65;
    var fill = acres >= 100000 ? 0.88 : acres >= 10000 ? 0.72 : 0.55;
    return {
      color: '#1a0c08',
      weight: weight,
      opacity: 0.95,
      fillColor: '#2a100c',
      fillOpacity: fill
    };
  }

  var LAND_STYLE_HOME = {
    color: 'rgba(28, 26, 23, 0.22)',
    weight: 0.8,
    opacity: 1,
    fillColor: '#fffcf8',
    fillOpacity: 0.94
  };

  var GACC_LAND_URL = 'data/gacc-regions.geojson';

  function conusLandFeatures(geojson) {
    if (!geojson || !geojson.features) return [];
    return geojson.features.filter(function (f) {
      var region = f.properties && f.properties.region;
      return region === 'West' || region === 'South' || region === 'East';
    });
  }

  function onEachFeature(feature, layer) {
    var p = feature.properties || {};
    var name = p.name || 'Unnamed';
    var acres = formatAcres(p.acres);
    var state = p.state ? String(p.state).replace(/^US-/, '') : '—';
    var pct = p.pct_contained != null ? p.pct_contained + '%' : '—';
    layer.bindPopup(
      '<strong>' + name + '</strong><br>' +
      'GIS acres: ' + acres + '<br>' +
      'State: ' + state + '<br>' +
      'Contained: ' + pct
    );
  }

  function showFallback(message) {
    var el = document.getElementById('map-wfigs-ytd');
    var section = document.getElementById('wfigs-map-section');
    if (section) section.hidden = false;
    if (!el) return;
    el.innerHTML =
      '<div class="wfigs-fallback">' +
      '<p>' + message + '</p>' +
      '<p><a href="https://data-nifc.opendata.arcgis.com/" target="_blank" rel="noopener noreferrer">' +
      'NIFC Open Data</a></p></div>';
  }

  function destroy() {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
      layerGroup = null;
      homeLandLayer = null;
    }
  }

  function destroyGacc() {
    if (gaccMapInstance) {
      gaccMapInstance.remove();
      gaccMapInstance = null;
      gaccLayerGroup = null;
    }
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Outline colors match Outcomes stacked-share chart (C-R06 / C-R12).
  var REGION_COLORS = {
    West: '#e87c2a',
    South: '#7b5ea7',
    Alaska: '#4a7c59',
    East: '#6b6560'
  };

  var CONUS_BOUNDS = [[24.4, -125.0], [49.5, -66.5]];
  // Tighter CONUS frame for explore WFIGS YTD map.
  var CONUS_BOUNDS_TIGHT = [[25.5, -123.8], [48.8, -68.2]];
  // Home hero: tighter CONUS crop for the shorter side-by-side map.
  var CONUS_BOUNDS_HOME = [[28.0, -121.0], [46.8, -74.5]];
  var BASEMAP_URL = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
  var BASEMAP_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
    '&copy; <a href="https://carto.com/attributions">CARTO</a> (no labels)';

  function regionColor(region) {
    return REGION_COLORS[region] || '#d8d2ca';
  }

  /** Fill: near-white at 0% share → dark red by ~80%+ (whole-region share). */
  function shareFillColor(sharePct) {
    var t = Math.max(0, Math.min(1, (sharePct || 0) / 80));
    t = Math.pow(t, 0.7);
    var r = Math.round(lerp(251, 122, t));
    var g = Math.round(lerp(249, 28, t));
    var b = Math.round(lerp(246, 13, t));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function updateGaccLegend(year, byRegion) {
    var host = document.getElementById('gacc-choropleth-legend');
    if (!host) return;
    var order = ['West', 'South', 'Alaska', 'East'];
    var items = order.map(function (region) {
      var row = byRegion[region] || {};
      var pct = row.share_pct != null ? row.share_pct.toFixed(1) + '%' : '-';
      var stroke = regionColor(region);
      return (
        '<span class="gacc-legend-item">' +
        '<span class="gacc-legend-swatch gacc-legend-swatch--outline" style="border-color:' + stroke + '"></span>' +
        region + ' ' + pct +
        '</span>'
      );
    }).join('');
    host.innerHTML =
      '<div class="gacc-leaflet-legend-title">Fill: share of ' + (year || '') + ' GACC acres (darker = larger share)</div>' +
      '<div class="gacc-legend-ramp" aria-hidden="true">' +
      '<span class="gacc-legend-ramp-bar"></span>' +
      '<span class="gacc-legend-ramp-ticks"><span>0%</span><span>50%</span><span>100%</span></span>' +
      '</div>' +
      '<div class="gacc-leaflet-legend-title">Outline: coordination region (state approx)</div>' +
      '<div class="gacc-legend-row">' + items + '</div>';
  }

  function fitConus(map, opts) {
    opts = opts || {};
    var bounds = CONUS_BOUNDS;
    var maxZoom = 5;
    var padding = [12, 12];
    if (opts.home) {
      bounds = CONUS_BOUNDS_HOME;
      maxZoom = 8;
      padding = [0, 0];
    } else if (opts.tight) {
      bounds = CONUS_BOUNDS_TIGHT;
      maxZoom = 6;
      padding = [4, 4];
    }
    try {
      map.fitBounds(bounds, { padding: padding, maxZoom: maxZoom });
    } catch (e) {
      map.setView([39.5, -97.5], opts.home ? 5 : (opts.tight ? 5 : 4));
    }
  }

  function isHomePage() {
    return !!(document.querySelector && document.querySelector('.home'));
  }

  /**
   * GACC regional share choropleth via Leaflet.
   * Vega albersUsa + custom GeoJSON repeatedly clipped/sparsified the map.
   */
  function renderGaccChoroplethMap(geojson, rows, year) {
    var el = document.getElementById('chart-gacc-choropleth');
    if (!el) return;
    if (!geojson || !geojson.features || !geojson.features.length || !rows || !rows.length) {
      el.innerHTML = '';
      return;
    }
    if (typeof L === 'undefined') {
      el.innerHTML = '<div class="wfigs-fallback"><p>Map library did not load.</p></div>';
      return;
    }

    var byRegion = {};
    rows.forEach(function (r) { byRegion[r.region] = r; });

    var features = geojson.features.map(function (f) {
      var region = f.properties && f.properties.region;
      var row = byRegion[region] || {};
      return {
        type: 'Feature',
        geometry: f.geometry,
        properties: {
          region: region,
          state: f.properties && f.properties.state,
          year: year,
          share_pct: row.share_pct,
          acres_millions: row.acres_millions
        }
      };
    }).filter(function (f) {
      return f.properties.region && Number.isFinite(f.properties.share_pct);
    });

    destroyGacc();
    el.innerHTML = '';
    updateGaccLegend(year, byRegion);

    gaccMapInstance = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: true,
      zoomControl: true,
      maxBounds: [[5, -170], [75, -40]],
      maxBoundsViscosity: 0.8
    });
    L.tileLayer(BASEMAP_URL, {
      attribution: BASEMAP_ATTR,
      maxZoom: 8,
      subdomains: 'abcd'
    }).addTo(gaccMapInstance);

    gaccLayerGroup = L.geoJSON({ type: 'FeatureCollection', features: features }, {
      style: function (feature) {
        var p = feature.properties || {};
        return {
          color: regionColor(p.region),
          weight: 1.6,
          opacity: 1,
          fillColor: shareFillColor(p.share_pct),
          fillOpacity: 0.92
        };
      },
      onEachFeature: function (feature, layer) {
        var p = feature.properties || {};
        layer.bindPopup(
          '<strong>' + (p.state || p.region) + '</strong><br>' +
          'Region: ' + (p.region || '—') + '<br>' +
          'Region share of ' + (p.year || '') + ' GACC acres: ' +
          (p.share_pct != null ? p.share_pct.toFixed(1) + '%' : '—') + '<br>' +
          'Region acres: ' + (p.acres_millions != null ? p.acres_millions.toFixed(2) + 'M' : '—') +
          '<br><em>Fill is the whole region’s share, not this state’s alone.</em>'
        );
      }
    }).addTo(gaccMapInstance);

    fitConus(gaccMapInstance);

    setTimeout(function () {
      if (gaccMapInstance) gaccMapInstance.invalidateSize();
    }, 50);
  }

  function invalidateGaccIfVisible() {
    if (!gaccMapInstance) return;
    var section = document.getElementById('geo-story-section') || document.getElementById('gacc-choropleth-section');
    if (section && !section.hidden) gaccMapInstance.invalidateSize();
  }

  function renderWfigsMap(geojson) {
    var section = document.getElementById('wfigs-map-section');
    var el = document.getElementById('map-wfigs-ytd');
    if (!section || !el) return;

    if (!geojson || !geojson.features || !geojson.features.length) {
      section.hidden = true;
      return;
    }
    if (typeof L === 'undefined') {
      section.hidden = false;
      showFallback('Map library did not load. Open NIFC Open Data for live perimeters.');
      return;
    }

    section.hidden = false;
    var meta = geojson.properties || {};
    updateCopy(meta);

    destroy();
    el.innerHTML = '';
    el.classList.remove('is-ready');

    var home = isHomePage();
    mapInstance = L.map(el, {
      scrollWheelZoom: false,
      attributionControl: !home,
      zoomControl: !home,
      dragging: !home,
      doubleClickZoom: !home,
      boxZoom: false,
      keyboard: !home,
      maxBounds: [[5, -170], [75, -40]],
      maxBoundsViscosity: 0.8
    });

    function addFireLayer() {
      layerGroup = L.geoJSON(geojson, {
        style: home ? styleFeatureHome : styleFeature,
        onEachFeature: onEachFeature
      }).addTo(mapInstance);
    }

    function revealMap() {
      el.classList.add('is-ready');
      var top = document.querySelector('.home-top');
      if (top) {
        setTimeout(function () {
          top.classList.add('is-ready');
        }, 120);
      }
    }

    function fitOnce(boundsSource) {
      mapInstance.invalidateSize();
      if (home && boundsSource && typeof boundsSource.getBounds === 'function') {
        try {
          mapInstance.fitBounds(boundsSource.getBounds(), { padding: [6, 6], maxZoom: 6 });
        } catch (e) {
          fitConus(mapInstance, { home: true });
        }
      } else {
        fitConus(mapInstance, home ? { home: true } : { tight: true });
      }
      if (home) {
        requestAnimationFrame(revealMap);
      } else {
        revealMap();
      }
    }

    function finishFit(boundsSource) {
      // One size settle, then one fit (avoids home map bounce).
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (!mapInstance) return;
          fitOnce(boundsSource);
        });
      });
    }

    if (!home) {
      L.tileLayer(BASEMAP_URL, {
        attribution: BASEMAP_ATTR + ' · Perimeters: NIFC WFIGS',
        maxZoom: 12,
        subdomains: 'abcd'
      }).addTo(mapInstance);
      addFireLayer();
      finishFit(null);
      return;
    }

    // Home: cream CONUS land + dark fires; no ocean tiles (page photo shows through).
    fetch(GACC_LAND_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (landGeo) {
        if (!mapInstance) return;
        homeLandLayer = L.geoJSON(
          { type: 'FeatureCollection', features: conusLandFeatures(landGeo) },
          { style: LAND_STYLE_HOME, interactive: false }
        ).addTo(mapInstance);
        addFireLayer();
        finishFit(homeLandLayer);
      })
      .catch(function () {
        if (!mapInstance) return;
        addFireLayer();
        finishFit(null);
      });
  }

  function invalidateIfVisible() {
    if (!mapInstance) return;
    var section = document.getElementById('wfigs-map-section');
    if (!section || section.hidden) return;
    mapInstance.invalidateSize();
    if (isHomePage() && homeLandLayer) {
      try {
        mapInstance.fitBounds(homeLandLayer.getBounds(), { padding: [6, 6], maxZoom: 6 });
      } catch (e) {
        fitConus(mapInstance, { home: true });
      }
      return;
    }
    fitConus(mapInstance, isHomePage() ? { home: true } : { tight: true });
  }

  window.WF = window.WF || {};
  window.WF.renderWfigsMap = renderWfigsMap;
  window.WF.invalidateWfigsMap = invalidateIfVisible;
  window.WF.destroyWfigsMap = destroy;
  window.WF.renderGaccChoroplethMap = renderGaccChoroplethMap;
  window.WF.invalidateGaccChoroplethMap = invalidateGaccIfVisible;
  window.WF.destroyGaccChoroplethMap = destroyGacc;
})();
