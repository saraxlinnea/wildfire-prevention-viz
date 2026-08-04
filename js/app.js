/* global WF, vegaEmbed */
(function () {
  const views = {};
  let cache = null;
  let lastLayout = null;
  let fireMode = 'acres';
  let geoMode = 'map';
  let policyMode = 'total';
  let policyYearBasis = 'fiscal';
  let scatterMode = 'western';
  let scatterDriverMode = 'erc';
  let atmosDrynessMode = 'erc';
  let regionalDriverRegion = 'west';
  let regionalDriverView = 'bars';
  let reliabilityMoreOpen = false;
  let reliabilityDiagOpen = false;
  let gaccChoroplethYear = null;
  let activeTab = 'overview';
  let wfigsLoadPromise = null;
  const renderedTabs = new Set();
  const CHART_TABS = ['overview', 'drivers', 'context', 'impacts'];
  const TAB_ORDER = ['overview', 'drivers', 'context', 'impacts', 'methods'];
  const TAB_ALIASES = { season: 'overview', where: 'overview' };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chartErrorFooter() {
    if (window.location.protocol === 'file:') {
      return (
        'From the project root, run <code>python3 -m http.server 8000</code> and open ' +
        '<a href="http://localhost:8000/">http://localhost:8000/</a> (not a <code>file://</code> path).'
      );
    }
    if (/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
      return (
        'If CSV requests failed, start the server from the repo root: ' +
        '<code>python3 -m http.server 8000</code>.'
      );
    }
    return (
      'Try a hard refresh (<kbd>Cmd+Shift+R</kbd> or <kbd>Ctrl+Shift+R</kbd>). ' +
      'If charts still fail, open the browser console (details above) and check the ' +
      '<a href="https://github.com/saraxlinnea/wildfire-prevention-viz/issues">GitHub issues</a> page.'
    );
  }

  function chartErrorHtml(details) {
    const lines = Array.isArray(details) ? details : [details];
    const list = lines.map(l => `<li>${escapeHtml(l)}</li>`).join('');
    return (
      '<div class="chart-load-error" style="font-size:12px;color:#6b6560;padding:16px 0;line-height:1.55;">' +
      '<p style="margin-bottom:8px;"><strong>Charts could not load.</strong></p>' +
      `<ul style="margin:0 0 10px 18px;">${list}</ul>` +
      `<p style="margin:0;">${chartErrorFooter()}</p>` +
      '</div>'
    );
  }

  function showChartError(err) {
    const details = [];
    if (window.location.protocol === 'file:') {
      details.push('Page opened as file://. Browsers block fetch() for local CSV/JS assets.');
    }
    const missing = checkDependencies();
    if (missing.length) {
      details.push(`Missing scripts: ${missing.join(', ')} (check Network tab for 404).`);
    }
    if (err && err.stage) details.push(`Failed at: ${err.stage}`);
    if (err && err.message) details.push(err.message);
    if (!details.length) details.push('Unknown error (see browser console for details).');
    console.error('[wildfire-viz] chart load failed:', err || details);
    const html = chartErrorHtml(details);
    document.querySelectorAll('.chart-slot').forEach(el => {
      if (!el.querySelector('svg')) el.innerHTML = html;
    });
    const fire = document.getElementById('chart-fire');
    if (fire) fire.innerHTML = html;
  }

  function checkDependencies() {
    const missing = [];
    if (typeof vegaEmbed === 'undefined') missing.push('vega-embed (CDN)');
    if (typeof WF === 'undefined') {
      missing.push('js/datasets.js', 'js/charts.js');
      return missing;
    }
    if (typeof WF.parseWildfireCSV !== 'function') missing.push('js/datasets.js');
    if (typeof WF.buildFireSpec !== 'function') missing.push('js/charts.js');
    return missing;
  }

  function fetchText(url) {
    return fetch(url).then(r => {
      if (!r.ok) {
        const e = new Error(`${url} returned HTTP ${r.status}`);
        e.stage = 'fetch';
        e.url = url;
        e.status = r.status;
        throw e;
      }
      return r.text();
    }).catch(e => {
      if (e.stage) throw e;
      const wrapped = new Error(`Could not fetch ${url}: ${e.message}`);
      wrapped.stage = 'fetch';
      wrapped.url = url;
      wrapped.cause = e;
      throw wrapped;
    });
  }

  function layoutKey() {
    return `${WF.isMobile()}-${WF.mainChartHeight()}-${WF.secondaryChartHeight()}-${fireMode}-${geoMode}-${policyMode}-${policyYearBasis}-${scatterMode}-${scatterDriverMode}-${atmosDrynessMode}-${regionalDriverRegion}-${regionalDriverView}-${gaccChoroplethYear || ''}`;
  }

  function resolveGaccYear(built) {
    const years = built.gaccChoroplethYears || [];
    if (gaccChoroplethYear && built.gaccChoroplethByYear && built.gaccChoroplethByYear[gaccChoroplethYear]) {
      return gaccChoroplethYear;
    }
    return built.gaccChoroplethDefaultYear || (years.length ? years[years.length - 1] : null);
  }

  function withGaccYear(built) {
    const year = resolveGaccYear(built);
    if (!year) {
      return Object.assign({}, built, {
        gaccChoroplethYear: null,
        gaccChoroplethRows: []
      });
    }
    if (!gaccChoroplethYear) gaccChoroplethYear = year;
    return Object.assign({}, built, {
      gaccChoroplethYear: year,
      gaccChoroplethRows: (built.gaccChoroplethByYear && built.gaccChoroplethByYear[year]) || []
    });
  }

  function data() {
    if (!cache) return null;
    const built = WF.buildDatasets(
      cache.wildfireRows, cache.vpdRows, cache.ercRows, cache.regionalAcresRows, cache.hfrRows,
      cache.vpdMonthlyRows, cache.ignitionRows, cache.sensitivityRows, cache.smokeRows,
      cache.partialCorrRows, cache.westerlingRows, cache.treatmentPartialCorrRows
    );
    return withGaccYear(built);
  }

  function finalizeChart(id) {
    if (views[id]) {
      views[id].finalize();
      views[id] = null;
    }
  }

  function fillPartialCorrTable(rows) {
    const tbody = document.getElementById('partial-corr-table-body');
    if (!tbody || !rows || !rows.length) return;
    tbody.innerHTML = rows.map(r => {
      const highlight = r.test.indexOf('raw') >= 0 || r.test.indexOf('collinearity') >= 0
        ? ' class="corr-highlight"'
        : '';
      return (
        `<tr${highlight}><td>${escapeHtml(r.test)}</td>` +
        `<td>${escapeHtml(r.control)}</td>` +
        `<td class="num">${Number(r.pearson_r).toFixed(3)}</td>` +
        `<td class="num">${escapeHtml(String(r.n))}</td></tr>`
      );
    }).join('');
  }

  function fillTreatmentPartialTable(rows) {
    const tbody = document.getElementById('treatment-partial-table-body');
    if (!tbody || !rows || !rows.length) return;
    tbody.innerHTML = rows.map(r => {
      const highlight = r.test.indexOf('(raw)') >= 0 || r.test.indexOf('no treatment') >= 0
        ? ' class="corr-highlight"'
        : '';
      return (
        `<tr${highlight}><td>${escapeHtml(r.test)}</td>` +
        `<td>${escapeHtml(r.control)}</td>` +
        `<td class="num">${Number(r.pearson_r).toFixed(3)}</td>` +
        `<td class="num">${escapeHtml(String(r.n))}</td></tr>`
      );
    }).join('');
  }

  function fillSensitivityTable(rows) {
    const tbody = document.getElementById('sensitivity-table-body');
    if (!tbody || !rows || !rows.length) return;
    tbody.innerHTML = rows.map(r => (
      `<tr><td>${escapeHtml(r.pairing)}</td><td class="num">${r.pearson_r.toFixed(3)}</td>` +
      `<td class="num">${r.n}</td><td>${escapeHtml(r.window)}</td></tr>`
    )).join('');
  }

  function embedChart(selector, spec, viewKey) {
    finalizeChart(viewKey);
    return vegaEmbed(selector, spec, WF.embedOpts)
      .then(r => {
        views[viewKey] = r.view;
      })
      .catch(e => {
        const msg = chartErrorHtml([
          `Vega chart failed: ${selector}`,
          e.message || String(e)
        ]);
        const el = document.querySelector(selector);
        if (el) el.innerHTML = msg;
        console.error('[wildfire-viz] vegaEmbed failed:', selector, e);
      });
  }

  function updateGaccChoroplethCopy(d) {
    const year = d.gaccChoroplethYear;
    const rows = d.gaccChoroplethRows || [];
    if (!year || !rows.length) return;
    const byRegion = Object.fromEntries(rows.map(r => [r.region, r.share_pct]));
    const fmt = pct => (pct == null ? '—' : (Math.round(pct) + '%'));
    ['gacc-choropleth-year-label', 'gacc-choropleth-year-plain', 'gacc-choropleth-year-source']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = year;
      });
    if (geoMode === 'map') {
      const caption = document.getElementById('geo-caption');
      if (caption) {
        caption.textContent =
          `In ${year} the West accounted for about ${fmt(byRegion.West)} of reported GACC acres, ` +
          `with Alaska near ${fmt(byRegion.Alaska)} and the South near ${fmt(byRegion.South)}; ` +
          `the East was about ${fmt(byRegion.East)}. Darker red fill means a larger regional share; ` +
          `outline color marks which coordination region each state is grouped into. ` +
          `Geography and calendars differ from western dryness (Drivers) and fiscal treatment (Context).`;
      }
      const source = document.getElementById('geo-source');
      if (source) {
        source.innerHTML =
          'Source: <a href="https://www.nifc.gov/nicc/predictive-services/intelligence" target="_blank" rel="noopener noreferrer">NICC annual GACC reports</a> · ' +
          '<a href="data/regional-acres-annual.csv">regional-acres-annual.csv</a> · state shapes approximate · calendar year ' +
          escapeHtml(year);
      }
    }
    const slot = document.getElementById('chart-gacc-choropleth');
    if (slot) {
      slot.setAttribute(
        'aria-label',
        `Map of ${year} GACC regional share of acres burned; outline by region, fill by share`
      );
    }
  }

  function syncGeoView(d) {
    const canMap = !!(
      cache && cache.gaccRegionGeojson &&
      d && d.gaccChoroplethRows && d.gaccChoroplethRows.length
    );
    const mapBtn = document.querySelector('[data-geo-view="map"]');
    if (mapBtn) {
      mapBtn.disabled = !canMap;
      if (!canMap && geoMode === 'map') geoMode = 'west';
    }
    document.querySelectorAll('[data-geo-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.geoView === geoMode);
    });
    document.querySelectorAll('[data-geo-panel]').forEach(panel => {
      panel.hidden = panel.dataset.geoPanel !== geoMode;
    });

    const caption = document.getElementById('geo-caption');
    const source = document.getElementById('geo-source');
    const clocks =
      ' Geography and calendars differ from western dryness (Drivers) and fiscal treatment (Context).';
    if (geoMode === 'west') {
      if (caption) {
        caption.textContent =
          'Western-led years like 2020 and 2021 show tall bars nearly full of orange. Years like 2004 and 2019 show a tall light bar with a short orange fill when Alaska (and sometimes the South) dominate. Reporting systems differ slightly, so western acres can occasionally sit near or above the NIFC national total.' +
          clocks;
      }
      if (source) {
        source.textContent =
          'Source: NICC annual GACC reports · NIFC national acres · median western share ≈ 60% of GACC sum (2003-2025) · calendar year';
      }
    } else if (geoMode === 'regions') {
      if (caption) {
        caption.textContent =
          'Each stacked bar is 100% of that year’s GACC acres. Western share is usually largest (median ≈ 60%), but Alaska and the South can take half or more in extreme years (2004, 2015, 2019). Eastern share stays small most years.' +
          clocks;
      }
      if (source) {
        source.innerHTML =
          'Source: <a href="https://www.nifc.gov/nicc/predictive-services/intelligence" target="_blank" rel="noopener noreferrer">NICC annual GACC reports</a> · ' +
          '<a href="data/regional-acres-annual.csv">regional-acres-annual.csv</a> · calendar year';
      }
    } else if (d) {
      updateGaccChoroplethCopy(d);
    }
  }

  /** Re-embed Vega charts only after their panel is visible (hidden slots get 0 width). */
  function renderActiveGeoChart(d) {
    if (!d) return Promise.resolve();
    if (geoMode === 'west') {
      return embedChart('#chart-western-acres-outcomes', WF.buildWesternAcresSpec(d), 'westernAcresOutcomes');
    }
    if (geoMode === 'regions') {
      return embedChart('#chart-regional-share-outcomes', WF.buildRegionalShareSpec(d), 'regionalShareOutcomes');
    }
    if (geoMode === 'map' && cache && cache.gaccRegionGeojson && d.gaccChoroplethRows && d.gaccChoroplethRows.length) {
      if (typeof WF.renderGaccChoroplethMap === 'function') {
        WF.renderGaccChoroplethMap(
          cache.gaccRegionGeojson,
          d.gaccChoroplethRows,
          d.gaccChoroplethYear
        );
      }
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          if (typeof WF.invalidateGaccChoroplethMap === 'function') {
            WF.invalidateGaccChoroplethMap();
          }
          resolve();
        });
      });
    }
    return Promise.resolve();
  }

  function syncGaccYearControls(d) {
    const year = d.gaccChoroplethYear;
    const years = d.gaccChoroplethYears || [];
    const select = document.getElementById('gacc-choropleth-year');
    if (select) {
      if (select.options.length !== years.length) {
        select.innerHTML = years.map(y =>
          `<option value="${escapeHtml(y)}">${escapeHtml(y)}</option>`
        ).join('');
      }
      if (year) select.value = year;
    }
    document.querySelectorAll('[data-gacc-year]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.gaccYear === year);
    });
    const storyHost = document.getElementById('gacc-choropleth-story-years');
    if (storyHost && !(storyHost.dataset.built === '1')) {
      const storyYears = d.gaccChoroplethStoryYears || [];
      storyHost.innerHTML = storyYears.map(y => {
        let label = y;
        if (y === '2004' || y === '2009') label = `${y} AK`;
        else if (y === '2020') label = `${y} West`;
        else if (y === d.gaccChoroplethDefaultYear) label = `${y} latest`;
        return `<button type="button" class="toggle-btn" data-gacc-year="${escapeHtml(y)}">${escapeHtml(label)}</button>`;
      }).join('');
      storyHost.dataset.built = '1';
      storyHost.querySelectorAll('[data-gacc-year]').forEach(btn => {
        btn.addEventListener('click', () => setGaccChoroplethYear(btn.dataset.gaccYear));
      });
      storyHost.querySelectorAll('[data-gacc-year]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gaccYear === year);
      });
    } else {
      document.querySelectorAll('[data-gacc-year]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gaccYear === year);
      });
    }
  }

  function setGaccChoroplethYear(year) {
    if (!cache || !year) return;
    const built = WF.buildDatasets(
      cache.wildfireRows, cache.vpdRows, cache.ercRows, cache.regionalAcresRows, cache.hfrRows,
      cache.vpdMonthlyRows, cache.ignitionRows, cache.sensitivityRows, cache.smokeRows,
      cache.partialCorrRows, cache.westerlingRows, cache.treatmentPartialCorrRows
    );
    if (!built.gaccChoroplethByYear || !built.gaccChoroplethByYear[year]) return;
    gaccChoroplethYear = year;
    const d = withGaccYear(built);
    updateGaccChoroplethCopy(d);
    syncGaccYearControls(d);
    syncGeoView(d);
    if (cache.gaccRegionGeojson && d.gaccChoroplethRows.length) {
      if (typeof WF.renderGaccChoroplethMap === 'function') {
        WF.renderGaccChoroplethMap(
          cache.gaccRegionGeojson,
          d.gaccChoroplethRows,
          d.gaccChoroplethYear
        );
        requestAnimationFrame(() => {
          if (typeof WF.invalidateGaccChoroplethMap === 'function') {
            WF.invalidateGaccChoroplethMap();
          }
        });
      }
    }
  }

  function updateFireChartCopy() {
    const fires = fireMode === 'fires';
    const plain = document.getElementById('fire-plain-read');
    const caption = document.getElementById('fire-caption');
    const tenyear = document.getElementById('fire-tenyear-note');
    const series = document.getElementById('fire-legend-series');
    const band = document.getElementById('fire-legend-band');
    const bandItem = document.getElementById('fire-legend-band-item');
    const ytdItem = document.getElementById('fire-legend-ytd-item');
    const forecastItem = document.getElementById('fire-legend-forecast-item');
    const source = document.getElementById('fire-source');
    const slot = document.getElementById('chart-fire');

    if (series) {
      series.textContent = fires ? 'Fires reported (full years)' : 'Acres burned (full years)';
    }
    if (band) band.textContent = 'Prior 10-year range (acres)';
    if (bandItem) bandItem.hidden = fires;
    if (ytdItem) ytdItem.hidden = fires;
    if (forecastItem) forecastItem.hidden = fires;

    if (plain) {
      plain.innerHTML = fires
        ? 'Each point is the <strong>number of wildfires</strong> NIFC reported for that calendar year (not acres). A year can have many small fires or fewer large ones, so this line will not match the acres view. Counts for 1983–1984 (~18k–20k) jump to ~83k in 1985 in the official table: early ICS reporting was still ramping up (parallel Smokey Bear / USFS counts were higher those years), so do not read that jump as starts suddenly quadrupling.'
        : 'Each point is total U.S. <strong>acres burned</strong> in a calendar year (NIFC), not the number of fires. The shaded band is the min-to-max range of the prior ten <em>complete</em> years; it starts in 1993 once ten comparable years exist. The orange 2026 point is year-to-date only (through August 3).';
    }
    if (caption) {
      caption.textContent = fires
        ? 'Fire counts and acres tell different stories: 2020 burned about 10.1M acres with about 59,000 fires, while some years with more fires burned far less land. Switch back to Million acres for season size and the AccuWeather forecast bar.'
        : 'Big national years like 2006, 2015, 2017, 2020, and 2021 often line up with hot, dry western summers, but Alaska, the Southeast, and other regions can move the total too. Early August 2026 is already above the usual same-date pace, but it is not comparable to full years yet.';
    }
    if (tenyear) {
      tenyear.innerHTML = fires
        ? '<span class="note-label">Why no shaded band here</span>The prior-10-year range stays on the acres view. Counts are a separate measure of how many starts were reported, not how large the burn was.'
        : '<span class="note-label">Two different “10-year” ideas</span>Header callouts use NIFC’s same-date YTD average. The chart band uses prior full calendar years. They answer different questions.';
    }
    if (source) {
      source.innerHTML = fires
        ? 'Source: <a href="https://www.nifc.gov/fire-information/statistics/wildfires" target="_blank" rel="noopener noreferrer">NIFC Total Wildfires and Acres</a> · calendar year · fire counts'
        : 'Source: <a href="https://www.nifc.gov/fire-information/statistics/wildfires" target="_blank" rel="noopener noreferrer">NIFC Total Wildfires and Acres</a> · calendar year · national acres burned';
    }
    if (slot) {
      slot.setAttribute(
        'aria-label',
        fires
          ? 'Chart of U.S. wildfire counts, 1983 to 2025'
          : 'Chart of U.S. wildfire acres burned in millions, 1983 to 2026'
      );
    }
  }

  function showFireSkeleton() {
    const el = document.getElementById('chart-fire');
    if (!el || el.querySelector('svg') || el.querySelector('.chart-load-error')) return;
    el.classList.add('chart-slot--loading');
    el.innerHTML =
      '<span class="skel-bar" style="height:42%"></span>' +
      '<span class="skel-bar" style="height:58%"></span>' +
      '<span class="skel-bar" style="height:35%"></span>' +
      '<span class="skel-bar" style="height:72%"></span>' +
      '<span class="skel-bar" style="height:48%"></span>' +
      '<span class="skel-bar" style="height:63%"></span>' +
      '<span class="skel-bar" style="height:40%"></span>';
  }

  function renderOverview(d) {
    updateFireChartCopy();
    const el = document.getElementById('chart-fire');
    if (el) el.classList.remove('chart-slot--loading');
    updateGaccChoroplethCopy(d);
    syncGaccYearControls(d);
    syncGeoView(d);
    return embedChart('#chart-fire', WF.buildFireSpec(d, fireMode), 'fire')
      .then(() => renderActiveGeoChart(d))
      .then(() => {
        syncGeoView(d);
        return renderActiveGeoChart(d);
      })
      .then(() => renderWfigsIfNeeded());
  }

  function ensureWfigsLoaded() {
    if (cache && cache.wfigsYtdGeojson) {
      return Promise.resolve(cache.wfigsYtdGeojson);
    }
    if (wfigsLoadPromise) return wfigsLoadPromise;
    wfigsLoadPromise = fetchText('data/wfigs-ytd-snapshot.geojson')
      .then(text => {
        const geo = JSON.parse(text);
        if (!geo.features || !geo.features.length) return null;
        if (cache) cache.wfigsYtdGeojson = geo;
        return geo;
      })
      .catch(err => {
        console.warn('[wildfire-viz] wfigs-ytd-snapshot.geojson deferred load failed:', err.message || err);
        return null;
      });
    return wfigsLoadPromise;
  }

  function renderWfigsIfNeeded() {
    const details = document.getElementById('wfigs-ops-details');
    if (details && !details.open) return Promise.resolve();
    return ensureWfigsLoaded().then(geo => {
      if (typeof WF.renderWfigsMap === 'function') {
        WF.renderWfigsMap(geo);
        requestAnimationFrame(() => {
          if (typeof WF.invalidateWfigsMap === 'function') WF.invalidateWfigsMap();
        });
      }
    });
  }

  function updatePolicyYearCopy() {
    const cal = policyYearBasis === 'calendar';
    const noteText = cal
      ? 'Calendar view shifts HFR fiscal-year treatment one year forward (FY 2020 work → 2021 on the axis) to line up with the calendar fire year. Acres burned always use calendar year. Approximate alignment only.'
      : 'Fiscal view labels treatment by federal fiscal year (Oct 1 start). Acres burned use calendar year on the same tick. The two measures do not share the same reporting window.';
    document.querySelectorAll('.treatment-year-note').forEach(el => { el.textContent = noteText; });
    document.querySelectorAll('[data-policy-year]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.policyYear === policyYearBasis);
    });
  }

  function renderFederalPart(d) {
    updatePolicyYearCopy();
    const tasks = [
      embedChart('#chart-policy', WF.buildPolicySpec(d, policyMode, policyYearBasis), 'policy'),
      embedChart('#chart-wui-share', WF.buildWuiShareSpec(d), 'wuiShare')
    ];
    fillTreatmentPartialTable(d.treatmentPartialCorrSeries);
    const dualDetails = document.querySelector('details.treatment-dual-details');
    if (dualDetails && dualDetails.open) {
      tasks.push(
        embedChart('#chart-treatment-acres', WF.buildTreatmentAcresDualSpec(d, policyYearBasis), 'treatmentAcres')
      );
    }
    const treatmentResearch = document.querySelector('details.drivers-research-details');
    if (treatmentResearch && treatmentResearch.open) {
      tasks.push(
        embedChart('#chart-treatment-per-acre', WF.buildTreatmentPerAcreSpec(d), 'treatmentPerAcre')
      );
    }
    const policyDetails = document.querySelector('details.coupling-policy-details');
    if (policyDetails && policyDetails.open) {
      tasks.push(
        embedChart('#chart-policy-scatter', WF.buildPolicyScatterSpec(d), 'policyScatter')
      );
    }
    return Promise.all(tasks);
  }

  function renderDrynessPart(d) {
    updateAtmosCopy();
    const tasks = [
      embedChart('#chart-atmosphere', WF.buildAtmosphericSpec(d, atmosDrynessMode), 'atmosphere')
    ];
    const nationalDetails = document.querySelector('details.atmosphere-national-details');
    if (nationalDetails && nationalDetails.open) {
      tasks.push(
        embedChart('#chart-atmosphere-national', WF.buildAtmosphericNationalSpec(d), 'atmosphereNational')
      );
    }
    return Promise.all(tasks);
  }

  function updateAtmosCopy() {
    const erc = atmosDrynessMode === 'erc';
    const legend = document.getElementById('atmos-dryness-legend');
    const note = document.getElementById('atmos-dryness-note');
    const caption = document.getElementById('atmos-dryness-caption');
    const source = document.getElementById('atmos-dryness-source');
    if (legend) {
      legend.textContent = erc ? 'Western ERC z-score' : 'Western VPD z-score';
    }
    if (note) {
      note.textContent = erc
        ? 'Solid line: western fire danger (ERC) compared to the 2000 through 2025 average. Dashed line: drought coverage (DSCI) on the same scale. Above zero means drier or more drought-stressed than normal for that index. ERC rises as fuels dry and is widely used in fire preparedness planning.'
        : 'Solid line: atmospheric dryness (VPD) compared to the 2000 through 2025 average. Dashed line: drought coverage (DSCI). Above zero means drier than normal. High VPD dries grasses and fine fuels quickly during the western fire season.';
    }
    if (caption) {
      caption.textContent = erc
        ? '2020 through 2022 ran drier than the long-term western average on this scale and overlapped several large national fire years. When ERC runs high into late spring and summer, fires that start can grow faster. National DSCI averages often smooth western fire-season extremes; see the note drawer for raw national vs western index.'
        : '2020 through 2022 ran drier than the long-term western average on this scale and overlapped several large national fire years. VPD is the thirsty-air signal often paired with red-flag warnings; it moves with ERC but describes physical drying of fuels. National DSCI averages often smooth western fire-season extremes; see the note drawer for raw national vs western index.';
    }
    if (source) {
      source.textContent = erc
        ? 'Source: gridMET ERC · USDM western DSCI · western U.S. · not national fire acres'
        : 'Source: gridMET VPD · USDM western DSCI · western U.S. · not national fire acres';
    }
  }

  function updateLagCopy(lagR, lagRows) {
    const rText = lagR !== null && lagR !== undefined ? lagR.toFixed(2) : 'n/a';
    const n = lagRows && lagRows.length ? lagRows.length : 0;
    const span = lagRows && lagRows.length
      ? `${lagRows[0].driver_year} to ${lagRows[lagRows.length - 1].driver_year}`
      : '';
    const caption = document.getElementById('lag-caption');
    const context = document.getElementById('lag-context');
    if (caption) {
      caption.textContent = `Western VPD in year t compared to national acres in year t+1 (${span}, ${n} pairs): correlation about ${rText}. Annual data are too coarse to test spring-dry vs summer-burn timing.`;
    }
    if (context) {
      context.innerHTML = '<span class="note-label">In plain terms</span>Western dryness paired with a national acres total next year is a rough experiment. Geography mismatches and noisy years dominate. Monthly data would be needed for a serious lag study. Not causal.';
    }
  }

  function updateScatterCopy() {
    const west = scatterMode === 'western';
    const driver = scatterDriverMode;
    const d = cache ? data() : null;
    let r;
    let n = 16;
    let windowLabel = '2010–2025';
    if (driver === 'may') {
      r = west
        ? (d && d.pearsonMayVpdWestern != null ? d.pearsonMayVpdWestern.toFixed(2) : '0.50')
        : (d && d.pearsonMayVpdNational != null ? d.pearsonMayVpdNational.toFixed(2) : 'n/a');
      n = west
        ? (d && d.mayVpdScatterRows ? d.mayVpdScatterRows.length : 16)
        : (d && d.mayVpdScatterRowsNational ? d.mayVpdScatterRowsNational.length : 16);
    } else if (driver === 'erc') {
      r = west ? '0.82' : '0.53';
    } else {
      r = west ? '0.81' : '0.63';
    }
    const note = document.getElementById('scatter-panel-note');
    const caption = document.getElementById('scatter-caption');
    const context = document.getElementById('scatter-context');
    const source = document.getElementById('scatter-source');
    const driverLabel = driver === 'erc' ? 'ERC' : (driver === 'vpd' ? 'VPD' : 'May VPD');
    const acresLabel = west ? 'western GACC acres burned' : 'national acres burned';
    const geoDetail = west
      ? 'Seven western GACCs (NW, NR, GB, RM, SW, NO, SO); excludes AK, EA, SA.'
      : 'National NIFC total vs western gridMET driver (geography mismatch).';
    if (note) {
      if (driver === 'may') {
        note.textContent = `Each dot is one calendar year from 2010 through 2025. Horizontal: May western VPD (spring timing check). Vertical: ${acresLabel}. ${geoDetail} Weaker than fire-season VPD; outcome is still full-year acres.`;
      } else {
        note.textContent = `Each dot is one calendar year from 2010 through 2025. Horizontal: western fire-season ${driverLabel}. Vertical: ${acresLabel}. ${geoDetail} Higher ${driverLabel} years tend to sit higher on acres burned when geography aligns.`;
      }
    }
    if (caption) {
      if (driver === 'may') {
        caption.textContent = west
          ? `May western VPD vs western acres is a weaker pairing (correlation about ${r} here) than fire-season VPD. Calendar-year acres, not summer-only burn.`
          : `May western VPD vs national acres is a weaker, mismatched pairing (correlation about ${r}). Prefer western acres for a fairer check.`;
      } else if (west) {
        caption.textContent = driver === 'erc'
          ? `Dry western years with high ERC often coincide with more western acres burned the same year (correlation about ${r} here). Extreme seasons like 2012, 2015, and 2020 stand out.`
          : `High western VPD years often coincide with more western acres burned the same year (correlation about ${r} here). VPD and ERC usually move together.`;
      } else {
        caption.textContent = driver === 'erc'
          ? `Western ERC vs national acres is a weaker pairing (correlation about ${r}) because national totals include Alaska, the South, and other regions outside the western dryness mask.`
          : `Western VPD vs national acres is a weaker pairing (correlation about ${r}) for the same geography reason.`;
      }
    }
    if (context) {
      if (driver === 'may') {
        context.innerHTML = '<span class="note-label">What this means</span>May VPD is a timing check, not the main fire-season dryness signal. Prefer ERC or fire-season VPD for the strongest co-movement in this sample.';
      } else if (driver === 'erc') {
        context.innerHTML = '<span class="note-label">What this means</span>Fire managers use ERC-style indices to scale staffing before peak season. This scatter is a simple check that the literature ranking (ERC ≳ VPD ≫ drought) shows up in this page’s western acres series. It is not a forecast.';
      } else {
        context.innerHTML = west
          ? '<span class="note-label">What this means</span>VPD helps describe how fast fuels dry. It supports the same seasonal story as ERC in most years on this page.'
          : '<span class="note-label">What this means</span>Mixing western weather with national acres dilutes the signal. Prefer the western acres toggle for a fair geography match.';
      }
    }
    if (source) {
      if (driver === 'may') {
        source.textContent = `Source: gridMET May western VPD · NICC ${west ? 'western GACC' : 'national'} acres · calendar year · r ≈ ${r}`;
      } else if (driver === 'erc') {
        source.textContent = `Source: gridMET western ERC (Abatzoglou 2013) · NICC ${west ? 'western GACC' : 'national'} acres · calendar year · r ≈ ${r}`;
      } else {
        source.textContent = `Source: gridMET western VPD (Abatzoglou 2013) · NICC ${west ? 'western GACC' : 'national'} acres · calendar year · r ≈ ${r}`;
      }
    }
    const rValue = document.getElementById('scatter-r-value');
    const rMeta = document.getElementById('scatter-r-meta');
    if (rValue) rValue.textContent = `r = ${r}`;
    if (rMeta) {
      rMeta.textContent = west
        ? `n = ${n} · ${windowLabel} · ${driverLabel} × western acres`
        : `n = ${n} · ${windowLabel} · ${driverLabel} × national acres`;
    }
  }

  function regionalTopDriverBars(region) {
    const DRIVER_LABELS = {
      erc: 'ERC (fire danger)',
      vpd: 'VPD (atmosphere)',
      dsci: 'DSCI (drought)',
      fm100: '100-hr fuel moisture',
      kbdi: 'KBDI (SE drought)'
    };
    const rows = (cache && cache.regionalCorrRows) || [];
    return rows
      .filter(r => (r.region || '').toLowerCase() === region)
      .map(r => {
        const key = (r.driver || '').toLowerCase();
        const val = parseFloat(r.pearson_r);
        const rAbs = Math.abs(val);
        let tier = 'weak';
        if (rAbs > 0.6) tier = 'strong';
        else if (rAbs >= 0.3) tier = 'moderate';
        return {
          label: DRIVER_LABELS[key] || (r.driver || key),
          r: val,
          r_abs: rAbs,
          r_display: Number.isFinite(val) ? val.toFixed(2) : 'n/a',
          tier,
          geo: r.acres_geo && r.driver_geo
            ? `${r.acres_geo} · ${r.driver_geo}`
            : (r.driver_geo || '')
        };
      })
      .filter(d => Number.isFinite(d.r))
      .sort((a, b) => b.r_abs - a.r_abs)
      .slice(0, 2);
  }

  function medianShareByRegion() {
    const FALLBACK = { west: '≈ 60%', south: '≈ 19%', east: '≈ 1.5%', alaska: '≈ 9%' };
    let series;
    try {
      series = cache ? data().regionalShareSeries : null;
    } catch (e) {
      return FALLBACK;
    }
    if (!series || !series.length) return FALLBACK;
    const out = { ...FALLBACK };
    ['West', 'South', 'East', 'Alaska'].forEach(label => {
      const vals = series
        .filter(row => row.region === label)
        .map(row => parseFloat(row.share_pct))
        .filter(Number.isFinite)
        .sort((a, b) => a - b);
      if (!vals.length) return;
      const mid = Math.floor(vals.length / 2);
      const med = vals.length % 2 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;
      const key = label.toLowerCase();
      out[key] = med < 10 ? `≈ ${med.toFixed(1)}%` : `≈ ${Math.round(med)}%`;
    });
    return out;
  }

  function fillRegionalSummaryTable() {
    const tbody = document.getElementById('regional-drivers-summary-body');
    if (!tbody) return;
    const rows = (cache && cache.regionalCorrRows) || [];
    const shares = medianShareByRegion();
    const DRIVER_LABELS = {
      erc: 'ERC', vpd: 'VPD', dsci: 'DSCI', fm100: 'fm100', kbdi: 'KBDI'
    };
    const regions = ['west', 'south', 'east', 'alaska'];
    tbody.innerHTML = regions.map(region => {
      const regionRows = rows
        .filter(r => (r.region || '').toLowerCase() === region)
        .map(r => ({
          driver: (r.driver || '').toLowerCase(),
          r: parseFloat(r.pearson_r)
        }))
        .filter(r => Number.isFinite(r.r))
        .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
      const best = regionRows[0];
      const second = regionRows[1];
      const dsci = regionRows.find(r => r.driver === 'dsci');
      const label = region.charAt(0).toUpperCase() + region.slice(1);
      const hl = region === regionalDriverRegion ? ' class="corr-highlight"' : '';
      const bestTxt = best
        ? `${DRIVER_LABELS[best.driver] || best.driver} (${best.r.toFixed(2)})`
        : 'n/a';
      const secondTxt = second
        ? `${DRIVER_LABELS[second.driver] || second.driver} (${second.r.toFixed(2)})`
        : 'n/a';
      const dsciTxt = dsci ? dsci.r.toFixed(2) : 'n/a';
      return (
        `<tr${hl}><td>${escapeHtml(label)}</td>` +
        `<td class="num">${escapeHtml(shares[region] || '—')}</td>` +
        `<td>${escapeHtml(bestTxt)}</td>` +
        `<td class="num">${escapeHtml(secondTxt)}</td>` +
        `<td class="num">${escapeHtml(dsciTxt)}</td></tr>`
      );
    }).join('');
  }

  function fillReliabilityTable(d) {
    const primaryBody = document.getElementById('reliability-primary-body');
    const moreBody = document.getElementById('reliability-more-body');
    if (!primaryBody) return;
    const mayR = d.pearsonMayVpdWestern != null ? d.pearsonMayVpdWestern.toFixed(2) : '0.50';
    const southRows = ((cache && cache.regionalCorrRows) || [])
      .filter(r => (r.region || '').toLowerCase() === 'south');
    const eastRows = ((cache && cache.regionalCorrRows) || [])
      .filter(r => (r.region || '').toLowerCase() === 'east');
    const southVpd = southRows.find(r => (r.driver || '').toLowerCase() === 'vpd');
    const southKbdi = southRows.find(r => (r.driver || '').toLowerCase() === 'kbdi');
    const eastDsci = eastRows.find(r => (r.driver || '').toLowerCase() === 'dsci');
    const primary = [
      {
        pairing: 'Western acres × western ERC',
        r: '0.82', n: '16', window: '2010-2025',
        note: 'Strongest fair match',
        lit: 'Often top short-term predictor'
      },
      {
        pairing: 'Western acres × western VPD',
        r: '0.81', n: '16', window: '2010-2025',
        note: 'Collinear with ERC (r ≈ 0.94)',
        lit: 'Strong warm-season aridity link'
      },
      {
        pairing: 'South acres × south VPD',
        r: southVpd ? parseFloat(southVpd.pearson_r).toFixed(2) : '0.36',
        n: '13', window: '2013-2025',
        note: 'Best South pairing; still moderate',
        lit: '—'
      },
      {
        pairing: 'South acres × KBDI',
        r: southKbdi ? parseFloat(southKbdi.pearson_r).toFixed(2) : '0.20',
        n: '13', window: '2013-2025',
        note: 'Operational SE index; weak vs VPD',
        lit: '—'
      },
      {
        pairing: 'East acres × East DSCI',
        r: eastDsci ? parseFloat(eastDsci.pearson_r).toFixed(2) : '0.81',
        n: '13', window: '2013-2025',
        note: 'High r; East ~1.5% of GACC acres',
        lit: '—'
      },
      {
        pairing: 'Western acres × western DSCI',
        r: '0.08', n: '16', window: '2010-2025',
        note: 'Drought weak here vs ERC/VPD',
        lit: 'Usually weaker than ERC'
      }
    ];
    const more = [
      {
        pairing: 'National acres × western VPD',
        r: '0.63', n: '16', window: '2010-2025',
        note: 'Geography mismatch',
        lit: '—'
      },
      {
        pairing: 'National acres × western ERC',
        r: '0.53', n: '16', window: '2010-2025',
        note: 'Geography mismatch',
        lit: '—'
      },
      {
        pairing: 'Western acres × May western VPD',
        r: mayR, n: '16', window: '2010-2025',
        note: 'Spring timing; weaker than fire-season VPD',
        lit: '—'
      },
      {
        pairing: 'National acres × national DSCI',
        r: '0.10', n: '16', window: '2010-2025',
        note: 'Broad drought vs national acres',
        lit: 'Usually weaker than ERC'
      },
      {
        pairing: 'ERC × VPD (collinearity)',
        r: '0.94', n: '16', window: '2010-2025',
        note: 'Nearly the same signal',
        lit: '—'
      }
    ];
    const showLit = reliabilityMoreOpen;
    document.querySelectorAll('.reliability-lit-col').forEach(el => {
      el.hidden = !showLit;
    });
    function rowHtml(row, highlight) {
      const lit = showLit
        ? `<td class="reliability-lit-col">${escapeHtml(row.lit)}</td>`
        : '';
      return (
        `<tr${highlight ? ' class="corr-highlight"' : ''}>` +
        `<td>${escapeHtml(row.pairing)}</td>` +
        `<td class="num">${escapeHtml(row.r)}</td>` +
        `<td class="num">${escapeHtml(row.n)}</td>` +
        `<td>${escapeHtml(row.window)}</td>` +
        `<td>${escapeHtml(row.note)}</td>${lit}</tr>`
      );
    }
    primaryBody.innerHTML = primary.map((row, i) => rowHtml(row, i < 2)).join('');
    if (moreBody) {
      moreBody.innerHTML = more.map(row => rowHtml(row, false)).join('');
      moreBody.hidden = !reliabilityMoreOpen;
    }
    const moreBtn = document.getElementById('reliability-expand-more');
    if (moreBtn) {
      moreBtn.setAttribute('aria-expanded', reliabilityMoreOpen ? 'true' : 'false');
      moreBtn.textContent = reliabilityMoreOpen ? 'Hide extra pairings' : 'Show more pairings';
    }
    const diag = document.getElementById('reliability-diagnostics');
    const diagBtn = document.getElementById('reliability-expand-diag');
    if (diag) diag.hidden = !reliabilityDiagOpen;
    if (diagBtn) {
      diagBtn.setAttribute('aria-expanded', reliabilityDiagOpen ? 'true' : 'false');
      diagBtn.textContent = reliabilityDiagOpen
        ? 'Hide diagnostics'
        : 'Diagnostics (partials / windows)';
    }
    if (reliabilityDiagOpen) {
      fillPartialCorrTable(d.partialCorrSeries);
      fillSensitivityTable(d.sensitivitySeries);
    }
  }

  function updateRegionalTopDriverCopy() {
    const caption = document.getElementById('regional-top-drivers-caption');
    const note = document.getElementById('regional-top-drivers-note');
    if (regionalDriverView === 'table') {
      if (caption) {
        caption.textContent =
          'Table ranks each region’s best and second dryness pairing (2013-2025, n=13), plus DSCI. Median share is of national GACC acres. East’s high DSCI r sits on a tiny acre share.';
      }
      if (note) {
        note.innerHTML =
          '<span class="note-label">Limits</span>Exploratory Pearson r. Alaska has DSCI only (outside gridMET). Not causal. The West usually holds most national GACC acres (median share ≈ 60%).';
      }
      return;
    }
    if (regionalDriverRegion === 'west') {
      if (caption) {
        caption.textContent =
          'Western ERC and VPD track western GACC acres most closely here. Broad drought (DSCI) does not make the top two.';
      }
      if (note) {
        note.innerHTML =
          '<span class="note-label">Limits</span>Exploratory Pearson r, 2013-2025 (n=13). Fire-season May-Sep west of 100°W. Not causal. The West usually holds most national GACC acres (median share ≈ 60%).';
      }
    } else if (regionalDriverRegion === 'south') {
      if (caption) {
        caption.textContent =
          'Southern Area fire danger usually watches KBDI (soil/duff drought), NFDRS fuel moisture / ERC / BI, and short-term RH or dry spells, not western May-Sep VPD alone. In this annual sample, spring VPD still tops the list; KBDI is weaker (r ≈ 0.20) and does not beat VPD.';
      }
      if (note) {
        note.innerHTML =
          '<span class="note-label">Limits</span>Exploratory Pearson r, 2013-2025 (n=13). Weak climate-acre links are expected: SE fire is also human-ignition and short-weather driven. KBDI here is gridMET-derived Jan-May mean, not a live SACC product. Not causal. Dryness and scatter charts below are a western zoom, where co-movement is strongest in this sample.';
      }
    } else {
      if (caption) {
        caption.textContent =
          'Eastern drought coverage pairs strongly with eastern acres in this sample, but the East is a small share of national GACC acres (about 1.5% median).';
      }
      if (note) {
        note.innerHTML =
          '<span class="note-label">Limits</span>Exploratory Pearson r, 2013-2025 (n=13). Do not read East drought as the national driver. Not causal. Dryness and scatter charts below zoom to the West, where most GACC acres sit in this sample.';
      }
    }
  }

  function renderRegionalTopDrivers() {
    updateRegionalTopDriverCopy();
    const barsWrap = document.getElementById('regional-top-drivers-bars-wrap');
    const tableWrap = document.getElementById('regional-top-drivers-table-wrap');
    const showTable = regionalDriverView === 'table';
    if (barsWrap) barsWrap.hidden = showTable;
    if (tableWrap) tableWrap.hidden = !showTable;
    if (showTable) {
      fillRegionalSummaryTable();
      return Promise.resolve();
    }
    const bars = regionalTopDriverBars(regionalDriverRegion);
    if (!bars.length) return Promise.resolve();
    return embedChart(
      '#chart-regional-top-drivers',
      WF.buildRegionalTopDriverSpec(bars),
      'regionalTopDrivers'
    );
  }

  function renderCouplingPart(d) {
    updateScatterCopy();
    fillReliabilityTable(d);
    return Promise.all([
      embedChart('#chart-scatter', WF.buildScatterSpec(d, scatterMode, scatterDriverMode), 'scatter'),
      embedChart('#chart-westerling-snowmelt', WF.buildWesterlingSnowmeltSpec(d), 'westerlingSnowmelt')
    ]);
  }

  function renderDrivers(d) {
    return Promise.all([
      renderRegionalTopDrivers(),
      renderDrynessPart(d),
      renderCouplingPart(d)
    ]);
  }

  function renderContext(d) {
    return renderFederalPart(d);
  }

  function fillSmokeProse(d) {
    const el = document.getElementById('smoke-acres-r-text');
    if (!el || d.pearsonSmokeAcres == null) return;
    const r = d.pearsonSmokeAcres.toFixed(2);
    el.textContent = `Exploratory check: national acres burned and this smoke series correlate at r ≈ ${r} (n=15, 2006-2020). That is temporal overlap, not proof that acres caused exposure.`;
  }

  function renderImpacts(d) {
    fillSmokeProse(d);
    return embedChart('#chart-smoke-pm25', WF.buildSmokePm25Spec(d), 'smokePm25');
  }

  function renderTabCharts(tabId, force) {
    if (!cache) return;
    const key = layoutKey();
    if (!force && renderedTabs.has(tabId) && lastLayout === key) return;

    let d;
    try {
      d = data();
    } catch (e) {
      e.stage = 'buildDatasets';
      showChartError(e);
      return;
    }

    let promise;
    if (tabId === 'overview') {
      finalizeChart('westernAcresOutcomes');
      finalizeChart('regionalShareOutcomes');
      promise = renderOverview(d);
    } else if (tabId === 'drivers') {
      finalizeChart('regionalTopDrivers');
      finalizeChart('atmosphere');
      finalizeChart('atmosphereNational');
      finalizeChart('scatter');
      finalizeChart('westerlingSnowmelt');
      promise = renderDrivers(d);
    } else if (tabId === 'context') {
      finalizeChart('policy');
      finalizeChart('treatmentAcres');
      finalizeChart('wuiShare');
      finalizeChart('treatmentPerAcre');
      finalizeChart('policyScatter');
      promise = renderContext(d);
    } else if (tabId === 'impacts') {
      finalizeChart('smokePm25');
      promise = renderImpacts(d);
    } else {
      return;
    }

    promise.then(() => {
      renderedTabs.add(tabId);
      lastLayout = key;
    }).catch(() => {});
  }

  function switchTab(tabId) {
    tabId = TAB_ALIASES[tabId] || tabId;
    if (!TAB_ORDER.includes(tabId)) return;
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const selected = btn.dataset.tab === tabId;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
      btn.tabIndex = selected ? 0 : -1;
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      const isActive = panel.id === `tab-${tabId}`;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
    if (CHART_TABS.includes(tabId)) {
      requestAnimationFrame(() => {
        renderTabCharts(tabId, false);
        if (tabId === 'overview') {
          if (typeof WF.invalidateGaccChoroplethMap === 'function') {
            WF.invalidateGaccChoroplethMap();
          }
          if (typeof WF.invalidateWfigsMap === 'function') {
            WF.invalidateWfigsMap();
          }
        }
      });
    }
  }

  if (window.WF) {
    window.WF.switchTab = switchTab;
    window.WF.getActiveTab = function () { return activeTab; };
  }

  function renderCharts(wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows, vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows, partialCorrRows, westerlingRows, treatmentPartialCorrRows, gaccRegionGeojson, regionalCorrRows) {
    cache = {
      wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows,
      vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows,
      partialCorrRows, westerlingRows, treatmentPartialCorrRows,
      gaccRegionGeojson: gaccRegionGeojson || null,
      regionalCorrRows: regionalCorrRows || [],
      wfigsYtdGeojson: null
    };
    renderedTabs.clear();
    lastLayout = null;
    try {
      const built = WF.buildDatasets(
        wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows,
        vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows,
        partialCorrRows, westerlingRows, treatmentPartialCorrRows
      );
      fillSensitivityTable(built.sensitivitySeries);
      fillPartialCorrTable(built.partialCorrSeries);
      fillTreatmentPartialTable(built.treatmentPartialCorrSeries);
    } catch (e) { /* table optional until context opens */ }
    renderTabCharts(activeTab, true);
  }

  function boot() {
    const depMissing = checkDependencies();
    if (depMissing.length) {
      showChartError({ message: `Script load incomplete before boot (${depMissing.join(', ')})` });
      return;
    }
    if (window.location.protocol === 'file:') {
      showChartError({ message: 'Use a local HTTP server; file:// URLs cannot load data/wildfire-data.csv.' });
      return;
    }

    showFireSkeleton();

    Promise.all([
      fetchText('data/wildfire-data.csv'),
      fetchText('data/vpd-annual.csv'),
      fetchText('data/erc-annual.csv'),
      fetchText('data/regional-acres-annual.csv'),
      fetchText('data/hfr-prevention-annual.csv'),
      fetchText('data/vpd-monthly-annual.csv'),
      fetchText('data/ignition-cause-annual.csv'),
      fetchText('data/correlation-sensitivity.csv'),
      fetchText('data/smoke-pm25-annual.csv'),
      fetchText('data/correlation-partial.csv'),
      fetchText('data/westerling-snowmelt-tercile.csv'),
      fetchText('data/correlation-treatment-partial.csv'),
      fetchText('data/regional-correlation-rank.csv'),
      fetchText('data/gacc-regions.geojson').catch(err => {
        console.warn('[wildfire-viz] gacc-regions.geojson optional load failed:', err.message || err);
        return null;
      })
    ])
      .then(([wildfireText, vpdText, ercText, regionalAcresText, hfrText, vpdMonthlyText, ignitionText, sensitivityText, smokeText, partialText, westerlingText, treatmentPartialText, regionalCorrText, gaccGeoText]) => {
        let wildfireRows;
        let vpdRows;
        let ercRows;
        let regionalAcresRows;
        let hfrRows;
        let vpdMonthlyRows;
        let ignitionRows;
        let sensitivityRows;
        let smokeRows;
        let partialCorrRows;
        let westerlingRows;
        let treatmentPartialCorrRows;
        let regionalCorrRows;
        let gaccRegionGeojson = null;
        try {
          wildfireRows = WF.parseWildfireCSV(wildfireText);
          vpdRows = WF.parseSimpleCSV(vpdText);
          ercRows = WF.parseSimpleCSV(ercText);
          regionalAcresRows = WF.parseSimpleCSV(regionalAcresText);
          hfrRows = WF.parseHfrCSV(hfrText);
          vpdMonthlyRows = WF.parseSimpleCSV(vpdMonthlyText);
          ignitionRows = WF.parseSimpleCSV(ignitionText);
          sensitivityRows = WF.parseTableCSV(sensitivityText);
          smokeRows = WF.parseSimpleCSV(smokeText);
          partialCorrRows = WF.parseTableCSV(partialText);
          westerlingRows = WF.parseTableCSV(westerlingText);
          treatmentPartialCorrRows = WF.parseTableCSV(treatmentPartialText);
          regionalCorrRows = WF.parseTableCSV(regionalCorrText);
          if (gaccGeoText) {
            gaccRegionGeojson = JSON.parse(gaccGeoText);
            if (!gaccRegionGeojson.features || !gaccRegionGeojson.features.length) {
              gaccRegionGeojson = null;
            }
          }
        } catch (e) {
          e.stage = 'parse CSV';
          throw e;
        }
        if (!wildfireRows.length) {
          throw Object.assign(new Error('wildfire-data.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!vpdRows.length) {
          throw Object.assign(new Error('vpd-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!ercRows.length) {
          throw Object.assign(new Error('erc-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!regionalAcresRows.length) {
          throw Object.assign(new Error('regional-acres-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!hfrRows.length) {
          throw Object.assign(new Error('hfr-prevention-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!vpdMonthlyRows.length) {
          throw Object.assign(new Error('vpd-monthly-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!smokeRows.length) {
          throw Object.assign(new Error('smoke-pm25-annual.csv parsed to zero year rows'), { stage: 'parse CSV' });
        }
        if (!partialCorrRows.length) {
          throw Object.assign(new Error('correlation-partial.csv parsed to zero rows'), { stage: 'parse CSV' });
        }
        if (!westerlingRows.length) {
          throw Object.assign(new Error('westerling-snowmelt-tercile.csv parsed to zero rows'), { stage: 'parse CSV' });
        }
        if (!treatmentPartialCorrRows.length) {
          throw Object.assign(new Error('correlation-treatment-partial.csv parsed to zero rows'), { stage: 'parse CSV' });
        }
        if (!regionalCorrRows.length) {
          console.warn('[wildfire-viz] regional-correlation-rank.csv parsed to zero rows');
        }
        console.info(
          '[wildfire-viz] loaded',
          wildfireRows.length, 'wildfire rows,',
          vpdRows.length, 'VPD rows,',
          ercRows.length, 'ERC rows,',
          regionalAcresRows.length, 'regional GACC rows,',
          hfrRows.length, 'HFR prevention rows,',
          vpdMonthlyRows.length, 'monthly VPD rows,',
          ignitionRows.length, 'ignition cause rows,',
          sensitivityRows.length, 'sensitivity rows,',
          smokeRows.length, 'smoke PM2.5 rows,',
          partialCorrRows.length, 'partial corr rows,',
          westerlingRows.length, 'Westerling snowmelt rows,',
          treatmentPartialCorrRows.length, 'treatment partial corr rows,',
          regionalCorrRows.length, 'regional correlation rows,',
          gaccRegionGeojson ? gaccRegionGeojson.features.length + ' GACC region polygons' : 'no GACC choropleth geojson',
          '(WFIGS deferred)'
        );
        renderCharts(
          wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows,
          vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows,
          partialCorrRows, westerlingRows, treatmentPartialCorrRows,
          gaccRegionGeojson, regionalCorrRows
        );
        try {
          const tabParam = new URLSearchParams(window.location.search).get('tab');
          const resolved = TAB_ALIASES[tabParam] || tabParam;
          if (resolved && document.getElementById('tab-' + resolved)) {
            switchTab(resolved);
          }
        } catch (e) { /* ignore */ }
      })
      .catch(showChartError);
  }

  function syncTogglePressed(selector, isActiveFn) {
    document.querySelectorAll(selector).forEach(b => {
      const on = isActiveFn(b);
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelector('.tab-bar')?.addEventListener('keydown', e => {
    const tabs = TAB_ORDER;
    const idx = tabs.indexOf(activeTab);
    if (idx < 0) return;
    let next = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    switchTab(next);
    document.getElementById(`tab-btn-${next}`)?.focus();
  });

  document.querySelectorAll('[data-goto-tab]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      switchTab(el.dataset.gotoTab);
    });
  });

  document.querySelectorAll('[data-fire-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      fireMode = btn.dataset.fireMode;
      syncTogglePressed('[data-fire-mode]', b => b.dataset.fireMode === fireMode);
      updateFireChartCopy();
      if (cache) {
        renderedTabs.delete('overview');
        renderTabCharts('overview', true);
      }
    });
  });
  syncTogglePressed('[data-fire-mode]', b => b.dataset.fireMode === fireMode);

  document.querySelectorAll('[data-geo-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      geoMode = btn.dataset.geoView;
      syncTogglePressed('[data-geo-view]', b => b.dataset.geoView === geoMode);
      if (cache) {
        const built = WF.buildDatasets(
          cache.wildfireRows, cache.vpdRows, cache.ercRows, cache.regionalAcresRows, cache.hfrRows,
          cache.vpdMonthlyRows, cache.ignitionRows, cache.sensitivityRows, cache.smokeRows,
          cache.partialCorrRows, cache.westerlingRows, cache.treatmentPartialCorrRows
        );
        const d = withGaccYear(built);
        syncGeoView(d);
        requestAnimationFrame(() => {
          renderActiveGeoChart(d);
        });
      } else {
        syncGeoView(null);
      }
    });
  });
  syncTogglePressed('[data-geo-view]', b => b.dataset.geoView === geoMode);

  const gaccYearSelect = document.getElementById('gacc-choropleth-year');
  if (gaccYearSelect) {
    gaccYearSelect.addEventListener('change', () => {
      setGaccChoroplethYear(gaccYearSelect.value);
    });
  }

  document.querySelectorAll('[data-policy-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      policyMode = btn.dataset.policyMode;
      syncTogglePressed('[data-policy-mode]', b => b.dataset.policyMode === policyMode);
      if (cache) {
        renderedTabs.delete('context');
        renderTabCharts('context', true);
      }
    });
  });
  syncTogglePressed('[data-policy-mode]', b => b.dataset.policyMode === policyMode);

  document.querySelectorAll('[data-policy-year]').forEach(btn => {
    btn.addEventListener('click', () => {
      policyYearBasis = btn.dataset.policyYear;
      syncTogglePressed('[data-policy-year]', b => b.dataset.policyYear === policyYearBasis);
      if (cache) {
        renderedTabs.delete('context');
        renderTabCharts('context', true);
      }
    });
  });
  syncTogglePressed('[data-policy-year]', b => b.dataset.policyYear === policyYearBasis);

  document.querySelectorAll('[data-scatter-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      scatterMode = btn.dataset.scatterMode;
      syncTogglePressed('[data-scatter-mode]', b => b.dataset.scatterMode === scatterMode);
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });
  syncTogglePressed('[data-scatter-mode]', b => b.dataset.scatterMode === scatterMode);

  document.querySelectorAll('[data-scatter-driver]').forEach(btn => {
    btn.addEventListener('click', () => {
      scatterDriverMode = btn.dataset.scatterDriver;
      syncTogglePressed('[data-scatter-driver]', b => b.dataset.scatterDriver === scatterDriverMode);
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });
  syncTogglePressed('[data-scatter-driver]', b => b.dataset.scatterDriver === scatterDriverMode);

  document.querySelectorAll('[data-atmos-dryness]').forEach(btn => {
    btn.addEventListener('click', () => {
      atmosDrynessMode = btn.dataset.atmosDryness;
      syncTogglePressed('[data-atmos-dryness]', b => b.dataset.atmosDryness === atmosDrynessMode);
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });
  syncTogglePressed('[data-atmos-dryness]', b => b.dataset.atmosDryness === atmosDrynessMode);

  document.querySelectorAll('[data-regional-driver-region]').forEach(btn => {
    btn.addEventListener('click', () => {
      regionalDriverRegion = btn.dataset.regionalDriverRegion;
      syncTogglePressed('[data-regional-driver-region]', b => b.dataset.regionalDriverRegion === regionalDriverRegion);
      if (cache) {
        renderedTabs.delete('drivers');
        finalizeChart('regionalTopDrivers');
        renderRegionalTopDrivers().then(() => {
          renderedTabs.add('drivers');
        });
      }
    });
  });
  syncTogglePressed('[data-regional-driver-region]', b => b.dataset.regionalDriverRegion === regionalDriverRegion);

  document.querySelectorAll('[data-regional-driver-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      regionalDriverView = btn.dataset.regionalDriverView;
      syncTogglePressed('[data-regional-driver-view]', b => b.dataset.regionalDriverView === regionalDriverView);
      if (cache) {
        renderedTabs.delete('drivers');
        finalizeChart('regionalTopDrivers');
        renderRegionalTopDrivers().then(() => {
          renderedTabs.add('drivers');
        });
      }
    });
  });
  syncTogglePressed('[data-regional-driver-view]', b => b.dataset.regionalDriverView === regionalDriverView);

  document.getElementById('reliability-expand-more')?.addEventListener('click', () => {
    reliabilityMoreOpen = !reliabilityMoreOpen;
    if (cache) fillReliabilityTable(data());
  });
  document.getElementById('reliability-expand-diag')?.addEventListener('click', () => {
    reliabilityDiagOpen = !reliabilityDiagOpen;
    if (cache) fillReliabilityTable(data());
  });

  function rerenderDrivers() {
    if (!cache) return;
    renderedTabs.delete('drivers');
    renderTabCharts('drivers', true);
  }

  function rerenderContext() {
    if (!cache) return;
    renderedTabs.delete('context');
    renderTabCharts('context', true);
  }

  document.querySelectorAll('details.atmosphere-national-details').forEach(el => {
    el.addEventListener('toggle', () => { if (el.open) rerenderDrivers(); });
  });
  document.querySelectorAll('details.drivers-research-details').forEach(el => {
    el.addEventListener('toggle', () => { if (el.open) rerenderContext(); });
  });
  document.querySelectorAll('details.treatment-dual-details').forEach(el => {
    el.addEventListener('toggle', () => { if (el.open) rerenderContext(); });
  });
  document.querySelectorAll('details.coupling-policy-details').forEach(el => {
    el.addEventListener('toggle', () => { if (el.open) rerenderContext(); });
  });
  document.querySelectorAll('details.wfigs-ops-details').forEach(el => {
    el.addEventListener('toggle', () => {
      if (el.open && cache) renderWfigsIfNeeded();
    });
  });

  window.addEventListener('resize', () => {
    if (!cache) return;
    const tabs = [...renderedTabs];
    renderedTabs.clear();
    lastLayout = null;
    tabs.forEach(t => renderTabCharts(t, true));
  });

  boot();
})();
