/* global WF, vegaEmbed */
(function () {
  const views = {};
  let cache = null;
  let lastLayout = null;
  let fireMode = 'acres';
  let policyMode = 'total';
  let activeTab = 'outcomes';
  const renderedTabs = new Set();
  const CHART_TABS = ['outcomes', 'drivers', 'coupling'];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chartErrorHtml(details) {
    const lines = Array.isArray(details) ? details : [details];
    const list = lines.map(l => `<li>${escapeHtml(l)}</li>`).join('');
    return (
      '<div class="chart-load-error" style="font-size:12px;color:#6b6560;padding:16px 0;line-height:1.55;">' +
      '<p style="margin-bottom:8px;"><strong>Charts could not load.</strong></p>' +
      `<ul style="margin:0 0 10px 18px;">${list}</ul>` +
      '<p style="margin:0;">From the project root, run <code>python3 -m http.server 8000</code> and open ' +
      '<a href="http://localhost:8000/">http://localhost:8000/</a> (not a <code>file://</code> path). ' +
      'Or view the <a href="https://saraxlinnea.github.io/wildfire-prevention-viz/">live page</a>.</p>' +
      '</div>'
    );
  }

  function showChartError(err) {
    const details = [];
    if (window.location.protocol === 'file:') {
      details.push('Page opened as file:// — browsers block fetch() for local CSV/JS assets.');
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
    return `${WF.isMobile()}-${WF.mainChartHeight()}-${WF.secondaryChartHeight()}-${fireMode}-${policyMode}`;
  }

  function finalizeChart(id) {
    if (views[id]) {
      views[id].finalize();
      views[id] = null;
    }
  }

  function data() {
    return WF.buildDatasets(cache.wildfireRows, cache.vpdRows);
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
        throw e;
      });
  }

  function renderOutcomes(d) {
    return embedChart('#chart-fire', WF.buildFireSpec(d, fireMode), 'fire');
  }

  function renderDrivers(d) {
    const tasks = [
      embedChart('#chart-atmosphere', WF.buildAtmosphericSpec(d), 'atmosphere'),
      embedChart('#chart-policy', WF.buildPolicySpec(d, policyMode), 'policy')
    ];
    const nationalDetails = document.querySelector('details.atmosphere-national-details');
    if (nationalDetails && nationalDetails.open) {
      tasks.push(
        embedChart('#chart-atmosphere-national', WF.buildAtmosphericNationalSpec(d), 'atmosphereNational')
      );
    }
    return Promise.all(tasks);
  }

  function renderCoupling(d) {
    const tasks = [
      embedChart('#chart-scatter', WF.buildScatterSpec(d), 'scatter'),
      embedChart('#chart-lag', WF.buildLagSpec(d), 'lag')
    ];
    const policyDetails = document.querySelector('details.coupling-policy-details');
    if (policyDetails && policyDetails.open) {
      tasks.push(
        embedChart('#chart-policy-scatter', WF.buildPolicyScatterSpec(d), 'policyScatter')
      );
    }
    return Promise.all(tasks);
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
      promise = renderOutcomes(d);
    } else if (tabId === 'drivers') {
      finalizeChart('atmosphere');
      finalizeChart('atmosphereNational');
      finalizeChart('policy');
      promise = renderDrivers(d);
    } else if (tabId === 'coupling') {
      finalizeChart('scatter');
      finalizeChart('lag');
      finalizeChart('policyScatter');
      promise = renderCoupling(d);
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

  function renderCharts(wildfireRows, vpdRows) {
    cache = { wildfireRows, vpdRows };
    renderedTabs.clear();
    lastLayout = null;
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
      fetchText('data/vpd-annual.csv')
    ])
      .then(([wildfireText, vpdText]) => {
        let wildfireRows;
        let vpdRows;
        try {
          wildfireRows = WF.parseWildfireCSV(wildfireText);
          vpdRows = WF.parseSimpleCSV(vpdText);
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
        console.info('[wildfire-viz] loaded', wildfireRows.length, 'wildfire rows,', vpdRows.length, 'VPD rows');
        renderCharts(wildfireRows, vpdRows);
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

  document.querySelectorAll('details.atmosphere-national-details').forEach(el => {
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

  window.addEventListener('resize', () => {
    if (!cache) return;
    const tabs = [...renderedTabs];
    renderedTabs.clear();
    lastLayout = null;
    tabs.forEach(t => renderTabCharts(t, true));
  });

  boot();
})();
