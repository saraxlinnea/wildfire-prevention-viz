/* global WF, vegaEmbed */
(function () {
  const views = {};
  let cache = null;
  let lastLayout = null;
  let fireMode = 'acres';
  let policyMode = 'total';
  let policyYearBasis = 'fiscal';
  let scatterMode = 'western';
  let scatterDriverMode = 'erc';
  let atmosDrynessMode = 'erc';
  let activeTab = 'outcomes';
  const renderedTabs = new Set();
  const CHART_TABS = ['outcomes', 'drivers', 'coupling', 'interpret'];

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
    return `${WF.isMobile()}-${WF.mainChartHeight()}-${WF.secondaryChartHeight()}-${fireMode}-${policyMode}-${policyYearBasis}-${scatterMode}-${scatterDriverMode}-${atmosDrynessMode}`;
  }

  function finalizeChart(id) {
    if (views[id]) {
      views[id].finalize();
      views[id] = null;
    }
  }

  function data() {
    return WF.buildDatasets(
      cache.wildfireRows,
      cache.vpdRows,
      cache.ercRows,
      cache.regionalAcresRows,
      cache.hfrRows,
      cache.vpdMonthlyRows,
      cache.ignitionRows,
      cache.sensitivityRows,
      cache.smokeRows,
      cache.partialCorrRows,
      cache.westerlingRows,
      cache.treatmentPartialCorrRows
    );
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
      .then(r => { views[viewKey] = r.view; })
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

  function renderOutcomes(d) {
    const tasks = [
      embedChart('#chart-fire', WF.buildFireSpec(d, fireMode), 'fire'),
      embedChart('#chart-western-acres-outcomes', WF.buildWesternAcresSpec(d), 'westernAcresOutcomes'),
      embedChart('#chart-regional-share-outcomes', WF.buildRegionalShareSpec(d), 'regionalShareOutcomes')
    ];
    return Promise.all(tasks);
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

  function renderDrivers(d) {
    updateAtmosCopy();
    updatePolicyYearCopy();
    const tasks = [
      embedChart('#chart-policy', WF.buildPolicySpec(d, policyMode, policyYearBasis), 'policy'),
      embedChart('#chart-treatment-acres', WF.buildTreatmentAcresDualSpec(d, policyYearBasis), 'treatmentAcres'),
      embedChart('#chart-wui-share', WF.buildWuiShareSpec(d), 'wuiShare'),
      embedChart('#chart-atmosphere', WF.buildAtmosphericSpec(d, atmosDrynessMode), 'atmosphere')
    ];
    fillTreatmentPartialTable(d.treatmentPartialCorrSeries);
    const treatmentResearch = document.querySelector('details.drivers-research-details');
    if (treatmentResearch && treatmentResearch.open) {
      tasks.push(
        embedChart('#chart-treatment-per-acre', WF.buildTreatmentPerAcreSpec(d), 'treatmentPerAcre')
      );
    }
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
    const context = document.getElementById('atmos-dryness-context');
    const source = document.getElementById('atmos-dryness-source');
    if (legend) {
      legend.textContent = erc ? 'Western ERC z-score' : 'Western VPD z-score';
    }
    if (note) {
      note.textContent = erc
        ? 'Solid line: western fire danger (ERC) compared to the 2000 through 2025 average. Dashed line: drought coverage (DSCI) on the same scale. Above zero means drier or more drought-stressed than normal for that index. ERC rises as fuels dry and is widely used in fire preparedness planning.'
        : 'Solid line: atmospheric dryness (VPD) compared to the 2000 through 2025 average. Dashed line: drought coverage (DSCI). Above zero means drier than normal. High VPD dries grasses and fine fuels quickly during the western fire season.';
    }
    if (context) {
      context.innerHTML = erc
        ? '<span class="note-label">What this means for fire season</span>When ERC runs high into late spring and summer, fires that start can grow faster and produce more heat. Agencies add crews, tankers, and engines earlier. Storms that break the pattern can still lower danger for a week or two.'
        : '<span class="note-label">What this means for fire season</span>VPD is the thirsty-air signal meteorologists pair with red-flag warnings. It often moves with ERC but describes physical drying of fuels, not fire behavior directly.';
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
    const erc = scatterDriverMode === 'erc';
    const r = west
      ? (erc ? '0.82' : '0.81')
      : (erc ? '0.53' : '0.63');
    const r2 = west
      ? (erc ? '0.67' : '0.65')
      : (erc ? '0.28' : '0.40');
    const note = document.getElementById('scatter-panel-note');
    const caption = document.getElementById('scatter-caption');
    const context = document.getElementById('scatter-context');
    const source = document.getElementById('scatter-source');
    const driverLabel = erc ? 'ERC' : 'VPD';
    const acresLabel = west ? 'western GACC acres burned' : 'national acres burned';
    const geoDetail = west
      ? 'Seven western GACCs (NW, NR, GB, RM, SW, NO, SO); excludes AK, EA, SA.'
      : 'National NIFC total vs western gridMET driver (geography mismatch).';
    if (note) {
      note.textContent = `Each dot is one calendar year from 2010 through 2025. Horizontal axis: western fire-season ${driverLabel}. Vertical axis: ${acresLabel}. ${geoDetail} Higher ${driverLabel} years tend to sit higher on acres burned when geography aligns.`;
    }
    if (caption) {
      caption.textContent = west
        ? (erc
          ? `Dry western years with high ERC often coincide with more western acres burned the same year (correlation about ${r} here). Extreme seasons like 2012, 2015, and 2020 stand out.`
          : `High western VPD years often coincide with more western acres burned the same year (correlation about ${r} here). VPD and ERC usually move together.`)
        : (erc
          ? `Western ERC vs national acres is a weaker pairing (correlation about ${r}) because national totals include Alaska, the South, and other regions outside the western dryness mask.`
          : `Western VPD vs national acres is a weaker pairing (correlation about ${r}) for the same geography reason.`);
    }
    if (context) {
      context.innerHTML = erc
        ? '<span class="note-label">What this means</span>Fire managers use ERC-style indices to scale staffing before peak season. This scatter is a simple check that the literature ranking shows up in this page’s western acres series. It is not a forecast.'
        : (west
          ? '<span class="note-label">What this means</span>VPD helps describe how fast fuels dry. It supports the same seasonal story as ERC in most years on this page.'
          : '<span class="note-label">What this means</span>Mixing western weather with national acres dilutes the signal. Prefer the western acres toggle for a fair geography match.');
    }
    if (source) {
      source.textContent = erc
        ? `Source: gridMET western ERC (Abatzoglou 2013) · NICC ${west ? 'western GACC' : 'national'} acres · calendar year · r ≈ ${r} · not causal`
        : `Source: gridMET western VPD (Abatzoglou 2013) · NICC ${west ? 'western GACC' : 'national'} acres · calendar year · r ≈ ${r} · not causal`;
    }
    const rValue = document.getElementById('scatter-r-value');
    const rMeta = document.getElementById('scatter-r-meta');
    if (rValue) rValue.textContent = `r = ${r}`;
    if (rMeta) {
      rMeta.textContent = west
        ? `n = 16 · 2010–2025 · ${driverLabel} × western acres · exploratory · not causal`
        : `n = 16 · 2010–2025 · ${driverLabel} × national acres · exploratory · not causal`;
    }
  }

  function renderCoupling(d) {
    updateScatterCopy();
    const tasks = [
      embedChart('#chart-scatter', WF.buildScatterSpec(d, scatterMode, scatterDriverMode), 'scatter'),
      embedChart('#chart-western-acres', WF.buildWesternAcresSpec(d), 'westernAcres'),
      embedChart('#chart-regional-share', WF.buildRegionalShareSpec(d), 'regionalShare'),
      embedChart('#chart-westerling-snowmelt', WF.buildWesterlingSnowmeltSpec(d), 'westerlingSnowmelt')
    ];
    const supplementary = document.querySelector('details.coupling-supplementary-details');
    if (supplementary && supplementary.open) {
      updateLagCopy(d.lagPearsonVpdNational, d.lagRows);
      tasks.push(
        embedChart('#chart-proxy-rank', WF.buildProxyRankBarSpec(d), 'proxyRank'),
        embedChart('#chart-lag', WF.buildLagSpec(d), 'lag'),
        embedChart('#chart-may-vpd', WF.buildMayVpdScatterSpec(d), 'mayVpd')
      );
      fillSensitivityTable(d.sensitivitySeries);
      fillPartialCorrTable(d.partialCorrSeries);
      if (d.ignitionCauseSeries && d.ignitionCauseSeries.length) {
        tasks.push(
          embedChart('#chart-ignition-cause', WF.buildIgnitionCauseSpec(d), 'ignitionCause')
        );
      }
    }
    const policyDetails = document.querySelector('details.coupling-policy-details');
    if (policyDetails && policyDetails.open) {
      tasks.push(
        embedChart('#chart-policy-scatter', WF.buildPolicyScatterSpec(d), 'policyScatter')
      );
    }
    return Promise.all(tasks);
  }

  function fillSmokeProse(d) {
    const el = document.getElementById('smoke-acres-r-text');
    if (!el || d.pearsonSmokeAcres == null) return;
    const r = d.pearsonSmokeAcres.toFixed(2);
    el.textContent = `Exploratory check: national acres burned and this smoke series correlate at r ≈ ${r} (n=15, 2006-2020). That is temporal overlap, not proof that acres caused exposure.`;
  }

  function renderInterpret(d) {
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
    if (tabId === 'outcomes') {
      finalizeChart('westernAcresOutcomes');
      promise = renderOutcomes(d);
    } else if (tabId === 'drivers') {
      finalizeChart('atmosphere');
      finalizeChart('atmosphereNational');
      finalizeChart('policy');
      finalizeChart('treatmentAcres');
      finalizeChart('wuiShare');
      finalizeChart('treatmentPerAcre');
      promise = renderDrivers(d);
    } else if (tabId === 'coupling') {
      finalizeChart('scatter');
      finalizeChart('westernAcres');
      finalizeChart('regionalShare');
      finalizeChart('westerlingSnowmelt');
      finalizeChart('ignitionCause');
      finalizeChart('proxyRank');
      finalizeChart('lag');
      finalizeChart('mayVpd');
      finalizeChart('policyScatter');
      promise = renderCoupling(d);
    } else if (tabId === 'interpret') {
      finalizeChart('smokePm25');
      promise = renderInterpret(d);
    } else {
      return;
    }

    promise.then(() => {
      renderedTabs.add(tabId);
      lastLayout = key;
    }).catch(() => {});
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      const selected = btn.dataset.tab === tabId;
      btn.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach(panel => {
      const isActive = panel.id === `tab-${tabId}`;
      panel.classList.toggle('active', isActive);
      panel.hidden = !isActive;
    });
    if (CHART_TABS.includes(tabId)) {
      requestAnimationFrame(() => renderTabCharts(tabId, false));
    }
  }

  function renderCharts(wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows, vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows, partialCorrRows, westerlingRows, treatmentPartialCorrRows) {
    cache = {
      wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows,
      vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows,
      partialCorrRows, westerlingRows, treatmentPartialCorrRows
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
    } catch (e) { /* table optional until coupling opens */ }
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
      fetchText('data/correlation-treatment-partial.csv')
    ])
      .then(([wildfireText, vpdText, ercText, regionalAcresText, hfrText, vpdMonthlyText, ignitionText, sensitivityText, smokeText, partialText, westerlingText, treatmentPartialText]) => {
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
          treatmentPartialCorrRows.length, 'treatment partial corr rows'
        );
        renderCharts(
          wildfireRows, vpdRows, ercRows, regionalAcresRows, hfrRows,
          vpdMonthlyRows, ignitionRows, sensitivityRows, smokeRows,
          partialCorrRows, westerlingRows, treatmentPartialCorrRows
        );
      })
      .catch(showChartError);
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll('[data-fire-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      fireMode = btn.dataset.fireMode;
      document.querySelectorAll('[data-fire-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.fireMode === fireMode);
      });
      if (cache) {
        renderedTabs.delete('outcomes');
        renderTabCharts('outcomes', true);
      }
    });
  });

  document.querySelectorAll('[data-policy-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      policyMode = btn.dataset.policyMode;
      document.querySelectorAll('[data-policy-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.policyMode === policyMode);
      });
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });

  document.querySelectorAll('[data-policy-year]').forEach(btn => {
    btn.addEventListener('click', () => {
      policyYearBasis = btn.dataset.policyYear;
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });

  document.querySelectorAll('[data-scatter-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      scatterMode = btn.dataset.scatterMode;
      document.querySelectorAll('[data-scatter-mode]').forEach(b => {
        b.classList.toggle('active', b.dataset.scatterMode === scatterMode);
      });
      if (cache) {
        renderedTabs.delete('coupling');
        renderTabCharts('coupling', true);
      }
    });
  });

  document.querySelectorAll('[data-scatter-driver]').forEach(btn => {
    btn.addEventListener('click', () => {
      scatterDriverMode = btn.dataset.scatterDriver;
      document.querySelectorAll('[data-scatter-driver]').forEach(b => {
        b.classList.toggle('active', b.dataset.scatterDriver === scatterDriverMode);
      });
      if (cache) {
        renderedTabs.delete('coupling');
        renderTabCharts('coupling', true);
      }
    });
  });

  document.querySelectorAll('[data-atmos-dryness]').forEach(btn => {
    btn.addEventListener('click', () => {
      atmosDrynessMode = btn.dataset.atmosDryness;
      document.querySelectorAll('[data-atmos-dryness]').forEach(b => {
        b.classList.toggle('active', b.dataset.atmosDryness === atmosDrynessMode);
      });
      if (cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });

  document.querySelectorAll('details.atmosphere-national-details').forEach(el => {
    el.addEventListener('toggle', () => {
      if (el.open && cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });

  document.querySelectorAll('details.drivers-research-details').forEach(el => {
    el.addEventListener('toggle', () => {
      if (el.open && cache) {
        renderedTabs.delete('drivers');
        renderTabCharts('drivers', true);
      }
    });
  });

  document.querySelectorAll('details.coupling-policy-details').forEach(el => {
    el.addEventListener('toggle', () => {
      if (el.open && cache) {
        renderedTabs.delete('coupling');
        renderTabCharts('coupling', true);
      }
    });
  });

  document.querySelectorAll('details.coupling-supplementary-details').forEach(el => {
    el.addEventListener('toggle', () => {
      if (cache) {
        renderedTabs.delete('coupling');
        renderTabCharts('coupling', true);
      }
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
