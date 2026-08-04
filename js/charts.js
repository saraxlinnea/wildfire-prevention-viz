/* global vegaEmbed */
(function () {
  var WF = window.WF;
  if (!WF || typeof WF.parseWildfireCSV !== 'function') {
    console.error('[wildfire-viz] datasets.js must load before charts.js');
    return;
  }

  WF.chartConfig = {
  font: 'DM Sans',
  axis: {
    labelFont: 'DM Mono, monospace',
    labelFontSize: 9,
    labelColor: '#9b9590',
    tickColor: 'transparent',
    domainColor: '#e8e4de',
    gridColor: '#f0ece6',
    gridDash: [3, 4]
  },
  view: { stroke: 'transparent' },
  padding: { left: 52, top: 8, right: 12, bottom: 36 }
};

WF.embedOpts = {
  actions: { export: true, source: false, compiled: false, editor: false },
  renderer: 'svg'
};

WF.isMobile = function () {
  return window.matchMedia('(max-width: 600px)').matches;
};

WF.mainChartHeight = function () { return WF.isMobile() ? 260 : 340; };
WF.secondaryChartHeight = function () { return WF.isMobile() ? 200 : 260; };
WF.compactChartHeight = function () { return WF.isMobile() ? 180 : 220; };

WF.yearAxis = function (opts) {
  const o = opts || {};
  const every = o.every != null ? o.every : 5;
  const axis = {
    labelAngle: o.angle != null ? o.angle : 0,
    labelExpr: 'toNumber(datum.label) % ' + every + " == 0 ? datum.label : ''"
  };
  if (o.title) {
    axis.title = o.title;
    axis.titleFont = 'DM Sans';
    axis.titleFontSize = 9;
    axis.titleColor = '#9b9590';
    if (o.angle) axis.labelPadding = 6;
  } else {
    axis.title = null;
  }
  return axis;
};

WF.buildFireSpec = function (data, mode) {
  const { burnWithRolling, bandData, fireCountData, partial2026, forecast2026, fireStoryMarks } = data;
  const isFires = mode === 'fires';

  let yDomain;
  let yAxis;
  let lineY;
  let lineData;
  let tooltip;

  if (isFires) {
    const fireVals = (fireCountData || []).map(d => d.fires).filter(Number.isFinite);
    const maxF = fireVals.length ? Math.max(...fireVals) : 100000;
    yDomain = [0, maxF * 1.08];
    yAxis = {
      title: 'Number of fires',
      titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
      titleAngle: -90, titleX: -44, format: ',.0f'
    };
    lineY = 'fires';
    lineData = (burnWithRolling || []).filter(d => Number.isFinite(d.fires));
    tooltip = [
      { field: 'year', title: 'Year' },
      { field: 'fires', title: 'Fires reported', format: ',.0f' },
      { field: 'acres', title: 'Acres burned (M)', format: '.1f' }
    ];
  } else {
    const acreVals = burnWithRolling.map(d => d.acres);
    const forecastHigh = forecast2026.length ? forecast2026[0].high : 0;
    yDomain = [0, Math.max(...acreVals, ...partial2026.map(d => d.acres), forecastHigh) * 1.08];
    yAxis = {
      title: 'Million acres',
      titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
      titleAngle: -90, titleX: -36
    };
    lineY = 'acres';
    lineData = burnWithRolling;
    tooltip = [
      { field: 'year', title: 'Year' },
      { field: 'acres', title: 'Acres burned (M)', format: '.1f' },
      { field: 'fires', title: 'Fires reported', format: ',.0f' },
      { field: 'rolling_mean', title: 'Prior 10-yr avg (M)', format: '.2f' }
    ];
  }

  const yScale = { domain: yDomain };
  const layers = [];

  if (!isFires) {
    layers.push({
      data: { values: bandData },
      mark: { type: 'area', color: '#c94a1a', opacity: 0.12 },
      encoding: {
        x: { field: 'year', type: 'ordinal', axis: WF.yearAxis({ title: 'Calendar year' }) },
        y: { field: 'rolling_min', type: 'quantitative', scale: yScale },
        y2: { field: 'rolling_max' }
      }
    });
  }

  layers.push({
    data: { values: lineData },
    mark: {
      type: 'line', color: '#c94a1a', strokeWidth: 2,
      point: { filled: true, fill: 'white', stroke: '#c94a1a', strokeWidth: 1.5, size: 40 }
    },
    encoding: {
      x: { field: 'year', type: 'ordinal', axis: WF.yearAxis({ title: 'Calendar year' }) },
      y: { field: lineY, type: 'quantitative', scale: yScale, axis: yAxis },
      tooltip: tooltip
    }
  });

  if (!isFires) {
    layers.push(
      {
        data: { values: partial2026 },
        mark: { type: 'point', filled: true, color: '#e87c2a', size: 90, stroke: 'white', strokeWidth: 2 },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'acres', type: 'quantitative', scale: yScale },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'acres', title: 'Acres burned YTD Aug 3 (M)', format: '.1f' }
          ]
        }
      },
      {
        data: { values: forecast2026 },
        mark: {
          type: 'bar', color: 'rgba(232,124,42,0.1)',
          stroke: '#e87c2a', strokeWidth: 1.5, strokeDash: [3, 2],
          cornerRadiusTopLeft: 2, cornerRadiusTopRight: 2
        },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'low', type: 'quantitative', scale: yScale },
          y2: { field: 'high' },
          tooltip: [
            { field: 'year', title: '2026 forecast' },
            { field: 'low', title: 'Low estimate (M)' },
            { field: 'high', title: 'High estimate (M)' }
          ]
        }
      }
    );
  }

  const storyLayer = WF.storyYearTextLayer(
    fireStoryMarks,
    'year',
    lineY,
    isFires ? -2500 : -0.15
  );
  if (storyLayer) layers.push(storyLayer);

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.mainChartHeight(),
    config: WF.chartConfig,
    layer: layers
  };
};

WF.buildAtmosphericSpec = function (data, drynessMode) {
  const mode = drynessMode || 'vpd';
  const { atmosZScore } = data;
  const yAxis = {
    title: 'Std dev from 2000-2025 mean',
    titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
    titleAngle: -90, titleX: -48
  };
  const dryKey = mode === 'erc' ? 'erc_z' : 'vpd_z';
  const dryLabel = mode === 'erc' ? 'Western ERC z-score' : 'Western VPD z-score';
  const dryLine = atmosZScore.map(d => ({ year: d.year, z: d[dryKey], scope_note: d.scope_note }));
  const dsciLine = atmosZScore.map(d => ({ year: d.year, z: d.dsci_z, scope_note: d.scope_note }));

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: [{ z: 0 }] },
        mark: { type: 'rule', color: '#e8e4de', strokeWidth: 1 },
        encoding: { y: { field: 'z', type: 'quantitative' } }
      },
      {
        data: { values: dryLine },
        mark: {
          type: 'line', color: '#9a6b3a', strokeWidth: 2,
          point: { filled: true, fill: 'white', stroke: '#9a6b3a', strokeWidth: 1.5, size: 45 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxis({ title: 'Calendar year' }) },
          y: { field: 'z', type: 'quantitative', axis: yAxis },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'z', title: dryLabel, format: '.2f' },
            { field: 'scope_note', title: 'Scope' }
          ]
        }
      },
      {
        data: { values: dsciLine },
        mark: {
          type: 'line', color: '#9b7ec8', strokeWidth: 1.5, strokeDash: [5, 3],
          point: { filled: true, fill: 'white', stroke: '#9b7ec8', strokeWidth: 1.2, size: 40 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'z', type: 'quantitative', axis: null },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'z', title: 'Western DSCI z-score', format: '.2f' },
            { field: 'scope_note', title: 'Scope' }
          ]
        }
      }
    ]
  };
};

WF.buildAtmosphericNationalSpec = function (data) {
  const { dsciFull, dsciPartial, dsciBridge, dsciWestFull, dsciWestPartial, dsciWestBridge } = data;
  const dsciScale = { domain: [0, 350] };
  const dsciAxis = {
    title: 'DSCI',
    titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#7b5ea7',
    labelColor: '#9b9590', labelFont: 'DM Mono, monospace', labelFontSize: 9
  };

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: dsciWestFull },
        mark: {
          type: 'line', color: '#9b7ec8', strokeWidth: 1.5, strokeDash: [5, 3],
          point: { filled: true, fill: 'white', stroke: '#9b7ec8', strokeWidth: 1.2, size: 35 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxis({ title: 'Calendar year' }) },
          y: { field: 'dsci', type: 'quantitative', scale: dsciScale, axis: dsciAxis },
          tooltip: [{ field: 'year', title: 'Year' }, { field: 'dsci', title: 'Western DSCI', format: '.1f' }]
        }
      },
      { data: { values: dsciWestBridge }, mark: { type: 'line', color: '#9b7ec8', strokeWidth: 1.5, strokeDash: [4, 3], opacity: 0.45 },
        encoding: { x: { field: 'year', type: 'ordinal' }, y: { field: 'dsci', type: 'quantitative', scale: dsciScale } } },
      { data: { values: dsciWestPartial }, mark: { type: 'point', filled: true, fill: 'white', stroke: '#9b7ec8', strokeWidth: 1.2, size: 35, opacity: 0.45 },
        encoding: { x: { field: 'year', type: 'ordinal' }, y: { field: 'dsci', type: 'quantitative', scale: dsciScale },
          tooltip: [{ field: 'year', title: 'Year' }, { field: 'dsci', title: 'Western DSCI (partial)', format: '.1f' }] } },
      {
        data: { values: dsciFull },
        mark: { type: 'line', color: '#7b5ea7', strokeWidth: 2, point: { filled: true, fill: 'white', stroke: '#7b5ea7', strokeWidth: 1.5, size: 40 } },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'dsci', type: 'quantitative', scale: dsciScale, axis: null },
          tooltip: [{ field: 'year', title: 'Year' }, { field: 'dsci', title: 'National DSCI', format: '.1f' }]
        }
      },
      { data: { values: dsciBridge }, mark: { type: 'line', color: '#7b5ea7', strokeWidth: 2, strokeDash: [4, 3], opacity: 0.55 },
        encoding: { x: { field: 'year', type: 'ordinal' }, y: { field: 'dsci', type: 'quantitative', scale: dsciScale } } },
      { data: { values: dsciPartial }, mark: { type: 'point', filled: true, fill: 'white', stroke: '#7b5ea7', strokeWidth: 1.5, size: 40, opacity: 0.55 },
        encoding: { x: { field: 'year', type: 'ordinal' }, y: { field: 'dsci', type: 'quantitative', scale: dsciScale },
          tooltip: [{ field: 'year', title: 'Year' }, { field: 'dsci', title: 'National DSCI (partial)', format: '.1f' }] } }
    ]
  };
};

WF.yearAxisLong = function (yearBasis) {
  const title = !yearBasis || yearBasis === 'default'
    ? 'Year'
    : yearBasis === 'calendar'
      ? 'Calendar year (HFR treatment shifted +1)'
      : 'Federal fiscal year (Oct 1 start)';
  return {
    title,
    titleFont: 'DM Sans',
    titleFontSize: 9,
    titleColor: '#9b9590',
    labelAngle: -45,
    labelExpr: "toNumber(datum.label) % 2 == 0 ? datum.label : ''"
  };
};

WF.buildPolicySpec = function (data, mode, yearBasis) {
  const basis = yearBasis || 'fiscal';
  const {
    policyCombined, policyLongSeries,
    policyInteriorBreakdown, policyFsBreakdown
  } = data;
  const isBreakdown = mode === 'breakdown';
  const rawTotal = (policyLongSeries && policyLongSeries.length)
    ? policyLongSeries
    : policyCombined;
  const totalSeries = WF.withTreatmentYearBasis(rawTotal, basis);
  const interiorSeries = WF.withTreatmentYearBasis(policyInteriorBreakdown || [], basis);
  const fsSeries = WF.withTreatmentYearBasis(policyFsBreakdown || [], basis);
  const totalMax = totalSeries.reduce((m, d) => Math.max(m, d.total || 0), 0);
  const breakdownMax = Math.max(
    ...interiorSeries.map(d => d.treatment || 0),
    ...fsSeries.map(d => d.treatment || 0),
    0
  );
  const yMax = Math.ceil((isBreakdown ? breakdownMax : totalMax) * 1.12) || 6;
  const yAxis = {
    title: 'Million acres treated',
    titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
    titleAngle: -90, titleX: -42
  };

  if (!isBreakdown) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: WF.secondaryChartHeight(),
      config: WF.chartConfig,
      data: { values: totalSeries },
      layer: [
        {
          mark: {
            type: 'line', color: '#2a6b4a', strokeWidth: 2.5,
            point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 2, size: 55 }
          },
          encoding: {
            x: { field: 'year', type: 'ordinal', axis: WF.yearAxisLong(basis) },
            y: { field: 'total', type: 'quantitative', scale: { domain: [0, yMax] }, axis: yAxis },
            tooltip: [
              { field: 'year_label', title: basis === 'calendar' ? 'Calendar year' : 'Year' },
              { field: 'total', title: 'Combined federal (M acres)', format: '.2f' },
              { field: 'source', title: 'Series' },
              { field: 'yoy_pct', title: 'YoY change %', format: '+.0f' },
              { field: 'shifted_from_fiscal', title: 'From fiscal year', format: '' }
            ]
          }
        }
      ]
    };
  }

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: interiorSeries },
        mark: {
          type: 'line', color: '#1a4a7a', strokeWidth: 2, strokeDash: [6, 2],
          point: { filled: true, fill: 'white', stroke: '#1a4a7a', strokeWidth: 1.5, size: 50 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxisLong(basis) },
          y: { field: 'treatment', type: 'quantitative', scale: { domain: [0, yMax] }, axis: yAxis },
          tooltip: [
            { field: 'year_label', title: basis === 'calendar' ? 'Calendar year' : 'Year' },
            { field: 'treatment', title: 'DOI or Interior (M acres)', format: '.2f' },
            { field: 'shifted_from_fiscal', title: 'From fiscal year', format: '' }
          ]
        }
      },
      {
        data: { values: fsSeries },
        mark: {
          type: 'line', color: '#2a6b4a', strokeWidth: 2.5,
          point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 2, size: 55 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'treatment', type: 'quantitative', scale: { domain: [0, yMax] }, axis: null },
          tooltip: [
            { field: 'year_label', title: basis === 'calendar' ? 'Calendar year' : 'Year' },
            { field: 'treatment', title: 'Forest Service (M acres)', format: '.1f' },
            { field: 'shifted_from_fiscal', title: 'From fiscal year', format: '' }
          ]
        }
      }
    ]
  };
};

WF.buildWuiShareSpec = function (data) {
  const rows = (data.wuiShareSeries || []).map(d => ({
    ...d,
    wui_pct: d.wui_share * 100
  }));
  const medPct = rows.length
    ? rows.map(d => d.wui_pct).sort((a, b) => a - b)[Math.floor(rows.length / 2)]
    : 59;
  const yAxis = {
    title: 'WUI share of designation (%)',
    titleFont: 'DM Sans',
    titleFontSize: 10,
    titleColor: '#9b9590',
    titleAngle: -90,
    titleX: -48,
    format: '.0f'
  };
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: [{ y: medPct, label: 'Median ≈ ' + Math.round(medPct) + '%' }] },
        mark: { type: 'rule', color: '#d4cfc8', strokeDash: [5, 4], strokeWidth: 1 },
        encoding: {
          y: { field: 'y', type: 'quantitative', scale: { domain: [45, 75] }, axis: null },
          tooltip: [{ field: 'label', title: 'Median FY 2003-2021' }]
        }
      },
      {
        data: { values: rows },
        mark: {
          type: 'line',
          color: '#1a4a7a',
          strokeWidth: 2.5,
          point: { filled: true, fill: 'white', stroke: '#1a4a7a', strokeWidth: 2, size: 55 }
        },
        encoding: {
          x: {
            field: 'fiscal_year',
            type: 'ordinal',
            axis: {
              title: 'Federal fiscal year (Oct 1 start)',
              titleFont: 'DM Sans',
              titleFontSize: 9,
              titleColor: '#9b9590',
              labelAngle: -45,
              labelExpr: "toNumber(datum.label) % 2 == 0 ? datum.label : ''"
            }
          },
          y: {
            field: 'wui_pct',
            type: 'quantitative',
            scale: { domain: [45, 75] },
            axis: yAxis
          },
          tooltip: [
            { field: 'fiscal_year', title: 'Fiscal year' },
            { field: 'wui_pct', title: 'WUI share of designation', format: '.1f' }
          ]
        }
      }
    ]
  };
};

WF.buildRegionalTopDriverSpec = function (bars) {
  const rows = bars || [];
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.isMobile() ? 120 : 140,
    config: WF.chartConfig,
    data: { values: rows },
    mark: { type: 'bar', cornerRadiusEnd: 2 },
    encoding: {
      y: {
        field: 'label',
        type: 'nominal',
        sort: { field: 'r_abs', order: 'descending' },
        title: null,
        axis: { labelFontSize: 11, labelLimit: 220 }
      },
      x: {
        field: 'r_abs',
        type: 'quantitative',
        scale: { domain: [0, 1], nice: false },
        axis: {
          title: '|Pearson r| (exploratory, 2013-2025)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          format: '.2f'
        }
      },
      color: {
        field: 'tier',
        type: 'nominal',
        scale: {
          domain: ['strong', 'moderate', 'weak'],
          range: ['#9a6b3a', '#7b5ea7', '#b8b2a9']
        },
        legend: {
          title: 'Strength (rule of thumb)',
          orient: 'bottom',
          direction: 'horizontal',
          labelFontSize: 9
        }
      },
      tooltip: [
        { field: 'label', title: 'Driver' },
        { field: 'r_display', title: 'Pearson r' },
        { field: 'geo', title: 'Pairing' }
      ]
    }
  };
};

WF.buildProxyRankBarSpec = function (data) {
  const { proxyRankBars } = data;
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    data: { values: proxyRankBars },
    mark: { type: 'bar', cornerRadiusEnd: 2 },
    encoding: {
      y: {
        field: 'label',
        type: 'nominal',
        sort: { field: 'r', order: 'descending' },
        title: null,
        axis: { labelFontSize: 9, labelLimit: 280 }
      },
      x: {
        field: 'r',
        type: 'quantitative',
        scale: { domain: [0, 1], nice: false },
        axis: {
          title: 'Pearson r (exploratory, 2010-2025)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          format: '.2f'
        }
      },
      color: {
        field: 'tier',
        type: 'nominal',
        scale: {
          domain: ['strong', 'moderate', 'weak'],
          range: ['#9a6b3a', '#7b5ea7', '#b8b2a9']
        },
        legend: {
          title: 'Strength (rule of thumb)',
          orient: 'bottom',
          direction: 'horizontal',
          labelFontSize: 9
        }
      },
      tooltip: [
        { field: 'label', title: 'Pairing' },
        { field: 'r', title: 'Pearson r', format: '.3f' },
        { field: 'geo', title: 'Geography' }
      ]
    }
  };
};

WF.buildTreatmentAcresDualSpec = function (data, yearBasis) {
  const basis = yearBasis || 'fiscal';
  const raw = data.treatmentAcresOverlap || [];
  const treatmentPts = WF.withTreatmentYearBasis(
    raw
      .filter(d => d.treatment_millions !== null && d.treatment_millions !== undefined)
      .map(d => ({
        year: d.year,
        total: d.treatment_millions,
        source: d.treatment_source === 'HFR fiscal' ? 'HFR fiscal' : 'Page series'
      })),
    basis
  );
  const treatmentByYear = Object.fromEntries(
    treatmentPts.map(d => [d.year, { ...d, overlap_note: 'Same timeline, different measures. Not proof one caused the other.' }])
  );
  const acresByYear = Object.fromEntries(
    raw
      .filter(d => d.acres_millions !== null && d.acres_millions !== undefined)
      .map(d => [d.year, d.acres_millions])
  );
  const years = [...new Set([...Object.keys(treatmentByYear), ...Object.keys(acresByYear)])]
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const rows = years.map(year => ({
    year,
    treatment_millions: treatmentByYear[year] ? treatmentByYear[year].total : null,
    treatment_source: treatmentByYear[year] ? treatmentByYear[year].source : null,
    shifted_from_fiscal: treatmentByYear[year] ? treatmentByYear[year].shifted_from_fiscal : null,
    acres_millions: acresByYear[year] ?? null,
    overlap_note: 'Same timeline, different measures. Not proof one caused the other.'
  }));
  if (!rows.length) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: WF.secondaryChartHeight(),
      data: { values: [{ label: 'No overlap data' }] },
      mark: { type: 'text', color: '#9b9590', fontSize: 12 },
      encoding: { text: { field: 'label' } }
    };
  }
  const treatmentRows = rows.filter(d => d.treatment_millions !== null && d.treatment_millions !== undefined);
  const acresRows = rows.filter(d => d.acres_millions !== null && d.acres_millions !== undefined);
  const treatmentMax = treatmentRows.reduce((m, d) => Math.max(m, d.treatment_millions), 0);
  const acresMax = acresRows.reduce((m, d) => Math.max(m, d.acres_millions), 0);

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    resolve: { scale: { y: 'independent' } },
    layer: [
      {
        data: { values: treatmentRows },
        mark: {
          type: 'line',
          color: '#2a6b4a',
          strokeWidth: 2.5,
          point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 2, size: 50 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxisLong(basis) },
          y: {
            field: 'treatment_millions',
            type: 'quantitative',
            scale: { domain: [0, Math.max(6, Math.ceil(treatmentMax * 1.12))] },
            axis: {
              orient: 'left',
              title: basis === 'calendar' ? 'Treatment (M ac, calendar-aligned)' : 'Federal treatment (M acres, fiscal)',
              titleFont: 'DM Sans',
              titleFontSize: 10,
              titleColor: '#2a6b4a',
              titleAngle: -90,
              titleX: -48
            }
          },
          tooltip: [
            { field: 'year', title: basis === 'calendar' ? 'Calendar year' : 'Fiscal year' },
            { field: 'treatment_millions', title: 'Treatment (M acres)', format: '.2f' },
            { field: 'treatment_source', title: 'Series' },
            { field: 'shifted_from_fiscal', title: 'From fiscal year', format: '' }
          ]
        }
      },
      {
        data: { values: acresRows },
        mark: {
          type: 'line',
          color: '#c94a1a',
          strokeWidth: 2,
          point: { filled: true, fill: 'white', stroke: '#c94a1a', strokeWidth: 1.5, size: 45 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: {
            field: 'acres_millions',
            type: 'quantitative',
            scale: { domain: [0, Math.max(10, Math.ceil(acresMax * 1.12))] },
            axis: {
              orient: 'right',
              title: 'Acres burned (M)',
              titleFont: 'DM Sans',
              titleFontSize: 10,
              titleColor: '#c94a1a',
              titleAngle: 90,
              titleX: 48
            }
          },
          tooltip: [
            { field: 'year', title: 'Year (calendar)' },
            { field: 'acres_millions', title: 'National acres burned (M)', format: '.1f' },
            { field: 'overlap_note', title: 'Read as' }
          ]
        }
      }
    ]
  };
};

WF.buildWesternAcresSpec = function (data) {
  const rows = (data.westernAcresSeries || []).map(d => {
    const hasNational = d.national !== null && d.national !== undefined;
    const westShare = (hasNational && d.national > 0)
      ? Math.round((d.western / d.national) * 1000) / 10
      : null;
    return {
      year: d.year,
      national: hasNational ? d.national : null,
      western: d.western,
      west_share_pct: westShare,
      geo_note: d.geo_note
    };
  });
  const withNational = rows.filter(d => d.national !== null);
  const yMax = rows.reduce(
    (m, d) => Math.max(m, d.national || 0, d.western || 0),
    0
  );
  const yAxis = {
    title: 'Million acres burned',
    titleFont: 'DM Sans',
    titleFontSize: 10,
    titleColor: '#9b9590',
    titleAngle: -90,
    titlePadding: 8
  };
  const xAxis = WF.yearAxis({ title: 'Calendar year', every: 2 });

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: withNational },
        mark: { type: 'bar', color: '#e8c4b4', size: 18, cornerRadiusEnd: 1 },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: xAxis },
          y: {
            field: 'national',
            type: 'quantitative',
            scale: { domain: [0, yMax * 1.08] },
            axis: yAxis
          },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'national', title: 'National NIFC (M)', format: '.2f' },
            { field: 'western', title: 'Western GACC (M)', format: '.2f' },
            { field: 'west_share_pct', title: 'West as % of national', format: '.1f' }
          ]
        }
      },
      {
        data: { values: rows },
        mark: { type: 'bar', color: '#e87c2a', size: 10, cornerRadiusEnd: 1 },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: {
            field: 'western',
            type: 'quantitative',
            scale: { domain: [0, yMax * 1.08] },
            axis: null
          },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'western', title: 'Western GACC (M)', format: '.2f' },
            { field: 'national', title: 'National NIFC (M)', format: '.2f' },
            { field: 'west_share_pct', title: 'West as % of national', format: '.1f' },
            { field: 'geo_note', title: 'Scope' }
          ]
        }
      }
    ]
  };
};

WF.buildRegionalShareSpec = function (data) {
  const values = data.regionalShareSeries || [];
  const storyMarks = (data.regionalStoryMarks || []).map(m => ({
    year: m.year,
    share_y: 1,
    label: m.label
  }));
  const layers = [{
    data: { values },
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'year',
        type: 'ordinal',
        axis: WF.yearAxis({ title: 'Calendar year', every: 5 })
      },
      y: {
        field: 'share_pct',
        type: 'quantitative',
        stack: 'normalize',
        axis: {
          title: 'Share of GACC acres burned',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          titleAngle: -90,
          titleX: -52,
          format: '.0%'
        }
      },
      color: {
        field: 'region',
        type: 'nominal',
        scale: {
          domain: ['West', 'South', 'Alaska', 'East'],
          range: ['#e87c2a', '#7b5ea7', '#4a7c59', '#b8b2a9']
        },
        legend: {
          title: 'GACC region',
          orient: 'bottom',
          direction: 'horizontal',
          labelFontSize: 9
        }
      },
      order: {
        field: 'region',
        sort: ['West', 'South', 'Alaska', 'East']
      },
      tooltip: [
        { field: 'year', title: 'Year' },
        { field: 'region', title: 'Region' },
        { field: 'share_pct', title: 'Share (%)', format: '.1f' },
        { field: 'geo_note', title: 'Scope' }
      ]
    }
  }];
  const storyLayer = WF.storyYearTextLayer(storyMarks, 'year', 'share_y', -0.04);
  if (storyLayer) layers.push(storyLayer);

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: layers
  };
};

/** GACC share choropleth for one calendar year (same shares as regional stack). */
WF.buildGaccChoroplethSpec = function (data, geojson) {
  const year = data.gaccChoroplethYear;
  const rows = data.gaccChoroplethRows || [];
  const byRegion = Object.fromEntries(rows.map(r => [r.region, r]));
  const features = ((geojson && geojson.features) || []).map(f => {
    const region = f.properties && f.properties.region;
    const row = byRegion[region] || {};
    return {
      type: 'Feature',
      geometry: f.geometry,
      properties: {
        region,
        state: f.properties && f.properties.state,
        year: year,
        share_pct: row.share_pct,
        acres_millions: row.acres_millions,
        geo_note: row.geo_note || 'NICC GACC acres share'
      }
    };
  }).filter(f => f.properties.region && Number.isFinite(f.properties.share_pct));

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.isMobile() ? 240 : 320,
    config: Object.assign({}, WF.chartConfig, {
      padding: { left: 8, top: 4, right: 8, bottom: 8 }
    }),
    data: { values: features },
    projection: { type: 'albersUsa' },
    mark: {
      type: 'geoshape',
      stroke: '#fbf9f6',
      strokeWidth: 0.6
    },
    encoding: {
      color: {
        field: 'properties.share_pct',
        type: 'quantitative',
        scale: {
          domain: [0, 100],
          range: ['#f3e6dc', '#e8c4b4', '#e87c2a', '#c94a1a']
        },
        legend: {
          title: `Share of GACC acres (${year || ''})`,
          orient: 'bottom',
          direction: 'horizontal',
          gradientLength: WF.isMobile() ? 120 : 180,
          format: '.0f',
          labelFontSize: 9,
          titleFontSize: 10,
          titleColor: '#9b9590'
        }
      },
      tooltip: [
        { field: 'properties.year', title: 'Year' },
        { field: 'properties.region', title: 'Region' },
        { field: 'properties.state', title: 'State' },
        { field: 'properties.share_pct', title: 'Region share (%)', format: '.1f' },
        { field: 'properties.acres_millions', title: 'Region acres (M)', format: '.2f' },
        { field: 'properties.geo_note', title: 'Scope' }
      ]
    }
  };
};

WF.buildScatterSpec = function (data, acreMode, driverMode) {
  const acresKey = acreMode || 'western';
  const driver = driverMode || 'erc';
  if (driver === 'may') {
    const scatterRows = acresKey === 'western'
      ? (data.mayVpdScatterRows || [])
      : (data.mayVpdScatterRowsNational || []);
    const r = acresKey === 'western'
      ? (data.pearsonMayVpdWestern ?? null)
      : (data.pearsonMayVpdNational ?? null);
    const yTitle = acresKey === 'western'
      ? 'Western GACC acres burned (M)'
      : 'National acres burned (M)';
    const xTitle = 'May western VPD (kPa)';
    const rNote = r !== null && r !== undefined
      ? `Pearson r ≈ ${r.toFixed(2)} (exploratory)`
      : 'n too small';
    if (!scatterRows.length) {
      return {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        width: 'container',
        height: WF.secondaryChartHeight(),
        data: { values: [{ label: 'No May VPD data' }] },
        mark: { type: 'text', color: '#9b9590', fontSize: 12 },
        encoding: { text: { field: 'label' } }
      };
    }
    const driverVals = scatterRows.map(d => d.driver ?? d.vpd_may);
    const driverMin = Math.min(...driverVals);
    const driverMax = Math.max(...driverVals);
    const driverPad = Math.max(0.02, (driverMax - driverMin) * 0.08);
    const acreVals = scatterRows.map(d => d.acres);
    const acreMin = Math.min(...acreVals);
    const acreMax = Math.max(...acreVals);
    const acrePad = Math.max(0.3, (acreMax - acreMin) * 0.08);
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: WF.secondaryChartHeight(),
      config: WF.chartConfig,
      layer: [
        {
          data: { values: scatterRows.map(d => ({ ...d, driver: d.driver ?? d.vpd_may })) },
          mark: { type: 'point', filled: true, size: 80 },
          encoding: {
            x: {
              field: 'driver', type: 'quantitative',
              scale: { domain: [driverMin - driverPad, driverMax + driverPad], nice: false, zero: false },
              axis: {
                title: xTitle,
                titleFont: 'DM Sans',
                titleFontSize: 10,
                titleColor: '#9a6b3a'
              }
            },
            y: {
              field: 'acres', type: 'quantitative',
              scale: {
                domain: [Math.max(0, acreMin - acrePad), acreMax + acrePad],
                nice: false,
                zero: false
              },
              axis: {
                title: yTitle,
                titleFont: 'DM Sans',
                titleFontSize: 10,
                titleColor: '#c94a1a'
              }
            },
            color: {
              field: 'year', type: 'ordinal',
              legend: { title: 'Year', orient: 'right' }
            },
            tooltip: [
              { field: 'year', title: 'Year' },
              { field: 'driver', title: 'May western VPD (kPa)', format: '.3f' },
              { field: 'acres', title: 'Acres burned (M)', format: '.2f' },
              { field: 'geo_note', title: 'Scope' }
            ]
          }
        },
        {
          data: { values: [{ label: rNote }] },
          mark: {
            type: 'text', align: 'left', baseline: 'top', dx: 4, dy: 4,
            font: 'DM Mono, monospace', fontSize: 9, color: '#9b9590'
          },
          encoding: { text: { field: 'label', type: 'nominal' } }
        }
      ]
    };
  }
  const rowMap = {
    western: { vpd: 'scatterRowsWesternVpd', erc: 'scatterRowsWesternErc' },
    national: { vpd: 'scatterRowsNationalVpd', erc: 'scatterRowsNationalErc' }
  };
  const scatterRows = data[rowMap[acresKey][driver]] || [];
  const storyMarks = (data.scatterStoryMarks || [])
    .filter(m => scatterRows.some(d => d.year === m.year));
  const r = driver === 'erc'
    ? (acresKey === 'western' ? (data.pearsonErcWesternAcres ?? 0.821) : (data.pearsonErcNationalAcres ?? 0.532))
    : (acresKey === 'western' ? (data.pearsonVpdWesternAcres ?? 0.808) : (data.pearsonVpdAcres ?? 0.625));
  const yTitle = acresKey === 'western'
    ? 'Western GACC acres burned (M)'
    : 'National acres burned (M)';
  const xTitle = driver === 'erc'
    ? 'Western fire-season ERC'
    : 'Western fire-season VPD (kPa)';
  const driverFmt = driver === 'erc' ? '.1f' : '.3f';
  const rNote = `Pearson r ≈ ${r.toFixed(2)} (exploratory)`;
  const driverVals = scatterRows.map(d => d.driver);
  const driverMin = Math.min(...driverVals);
  const driverMax = Math.max(...driverVals);
  const driverPad = Math.max(driver === 'erc' ? 1.5 : 0.02, (driverMax - driverMin) * 0.08);
  const driverDomain = [driverMin - driverPad, driverMax + driverPad];
  const acreVals = scatterRows.map(d => d.acres);
  const acreMin = Math.min(...acreVals);
  const acreMax = Math.max(...acreVals);
  const acrePad = Math.max(0.3, (acreMax - acreMin) * 0.08);
  const acreDomain = [Math.max(0, acreMin - acrePad), acreMax + acrePad];
  const layers = [
    {
      data: { values: scatterRows },
      mark: { type: 'point', filled: true, size: 80 },
      encoding: {
        x: {
          field: 'driver', type: 'quantitative',
          scale: { domain: driverDomain, nice: false, zero: false },
          axis: {
            title: xTitle,
            titleFont: 'DM Sans',
            titleFontSize: 10,
            titleColor: '#9a6b3a'
          }
        },
        y: {
          field: 'acres', type: 'quantitative',
          scale: { domain: acreDomain, nice: false, zero: false },
          axis: {
            title: yTitle,
            titleFont: 'DM Sans',
            titleFontSize: 10,
            titleColor: '#c94a1a'
          }
        },
        color: {
          field: 'year', type: 'ordinal',
          legend: { title: 'Year', orient: 'right' }
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'driver', title: driver === 'erc' ? 'Western ERC' : 'Western VPD (kPa)', format: driverFmt },
          { field: 'acres', title: 'Acres burned (M)', format: '.2f' },
          { field: 'geo_note', title: 'Scope' }
        ]
      }
    },
    {
      data: { values: [{ label: rNote }] },
      mark: {
        type: 'text', align: 'left', baseline: 'top', dx: 4, dy: 4,
        font: 'DM Mono, monospace', fontSize: 9, color: '#9b9590'
      },
      encoding: { text: { field: 'label', type: 'nominal' } }
    }
  ];
  if (acresKey === 'western' && driver === 'erc' && storyMarks.length) {
    const storyLayer = WF.storyYearTextLayer(storyMarks, 'driver', 'acres', -0.12);
    if (storyLayer) {
      storyLayer.encoding.x = { field: 'driver', type: 'quantitative' };
      layers.push(storyLayer);
    }
  }
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: layers
  };
};

WF.buildLagSpec = function (data) {
  const { lagRows } = data;
  const vpdNorm = lagRows.map(d => ({ ...d, series: 'Western VPD (year t)', val: d.vpd, plot_year: d.driver_year }));
  const acresNorm = lagRows.map(d => ({
    ...d, series: 'Acres burned (year t+1)', val: d.acres, plot_year: d.driver_year
  }));
  const combined = [...vpdNorm, ...acresNorm];

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    data: { values: combined },
    transform: [
      { window: [{ op: 'min', field: 'val', as: 'min_val' }], groupby: ['series'] },
      { window: [{ op: 'max', field: 'val', as: 'max_val' }], groupby: ['series'] },
      { calculate: "(datum.val - datum.min_val) / (datum.max_val - datum.min_val)", as: 'norm' }
    ],
    layer: [
      {
        mark: { type: 'line', strokeWidth: 2, point: { filled: true, size: 50 } },
        encoding: {
          x: {
            field: 'plot_year',
            type: 'ordinal',
            axis: WF.yearAxis({ title: 'Driver year (VPD)', every: 5 })
          },
          y: {
            field: 'norm',
            type: 'quantitative',
            axis: {
              title: 'Normalized 0-1 (separate scales)',
              titleFont: 'DM Sans',
              titleFontSize: 10,
              titleColor: '#9b9590',
              titleAngle: -90,
              titleX: -48
            }
          },
          color: {
            field: 'series', type: 'nominal',
            scale: { domain: ['Western VPD (year t)', 'Acres burned (year t+1)'], range: ['#9a6b3a', '#c94a1a'] },
            legend: { title: null, orient: 'top' }
          },
          tooltip: [
            { field: 'label', title: 'Alignment' },
            { field: 'vpd', title: 'VPD (kPa)', format: '.3f' },
            { field: 'acres', title: 'Acres burned next year (M)', format: '.1f' },
            { field: 'geo_note', title: 'Scope' }
          ]
        }
      }
    ]
  };
};

WF.buildMayVpdScatterSpec = function (data) {
  const rows = data.mayVpdScatterRows || [];
  if (!rows.length) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: WF.compactChartHeight(),
      data: { values: [{ label: 'No May VPD data' }] },
      mark: { type: 'text', color: '#9b9590', fontSize: 12 },
      encoding: { text: { field: 'label' } }
    };
  }
  const r = data.pearsonMayVpdWestern;
  const rNote = r !== null && r !== undefined ? `Pearson r ≈ ${r.toFixed(2)} (exploratory)` : 'n too small';
  const vpdVals = rows.map(d => d.vpd_may);
  const acreVals = rows.map(d => d.acres);
  const vpdPad = Math.max(0.02, (Math.max(...vpdVals) - Math.min(...vpdVals)) * 0.08);
  const acrePad = Math.max(0.2, (Math.max(...acreVals) - Math.min(...acreVals)) * 0.08);
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    layer: [
      {
        data: { values: rows },
        mark: { type: 'point', filled: true, size: 70, color: '#9a6b3a' },
        encoding: {
          x: {
            field: 'vpd_may',
            type: 'quantitative',
            scale: {
              domain: [Math.min(...vpdVals) - vpdPad, Math.max(...vpdVals) + vpdPad],
              nice: false,
              zero: false
            },
            axis: {
              title: 'May western VPD (kPa)',
              titleFont: 'DM Sans',
              titleFontSize: 10,
              titleColor: '#9a6b3a'
            }
          },
          y: {
            field: 'acres',
            type: 'quantitative',
            scale: {
              domain: [Math.max(0, Math.min(...acreVals) - acrePad), Math.max(...acreVals) + acrePad],
              nice: false,
              zero: false
            },
            axis: {
              title: 'Western GACC acres (M, calendar year)',
              titleFont: 'DM Sans',
              titleFontSize: 10,
              titleColor: '#c94a1a'
            }
          },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'vpd_may', title: 'May VPD (kPa)', format: '.3f' },
            { field: 'acres', title: 'Western acres (M)', format: '.2f' },
            { field: 'geo_note', title: 'Scope' }
          ]
        }
      },
      {
        data: { values: [{ label: rNote }] },
        mark: {
          type: 'text', align: 'left', baseline: 'top', dx: 4, dy: 4,
          font: 'DM Mono, monospace', fontSize: 9, color: '#9b9590'
        },
        encoding: { text: { field: 'label', type: 'nominal' } }
      }
    ]
  };
};

WF.buildIgnitionCauseSpec = function (data) {
  const rows = (data.ignitionCauseSeries || []).flatMap(d => ([
    { year: d.year, cause: 'Lightning', share: d.lightning_share, acres: d.lightning_acres },
    { year: d.year, cause: 'Human', share: d.human_share, acres: d.human_acres }
  ]));
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    data: { values: rows },
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'year',
        type: 'ordinal',
        axis: WF.yearAxis({ title: 'Calendar year', every: 2 })
      },
      y: {
        field: 'share',
        type: 'quantitative',
        stack: 'normalize',
        axis: {
          title: 'Share of NICC cause acres',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          titleAngle: -90,
          titleX: -48,
          format: '.0%'
        }
      },
      color: {
        field: 'cause',
        type: 'nominal',
        scale: { domain: ['Lightning', 'Human'], range: ['#4a7c9e', '#c94a1a'] },
        legend: { title: 'Initial cause', orient: 'bottom' }
      },
      tooltip: [
        { field: 'year', title: 'Year' },
        { field: 'cause', title: 'Cause' },
        { field: 'share', title: 'Share', format: '.1%' },
        { field: 'acres', title: 'Acres', format: ',' }
      ]
    }
  };
};

WF.buildTreatmentPerAcreSpec = function (data) {
  const rows = data.treatmentPerAcreSeries || [];
  if (!rows.length) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: WF.compactChartHeight(),
      data: { values: [{ label: 'No ratio data' }] },
      mark: { type: 'text', color: '#9b9590', fontSize: 12 },
      encoding: { text: { field: 'label' } }
    };
  }
  const yMax = Math.max(...rows.map(d => d.ratio), 0) * 1.12;
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    data: { values: rows },
    mark: {
      type: 'line',
      color: '#2a6b4a',
      strokeWidth: 2,
      point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 1.5, size: 45 }
    },
    encoding: {
      x: { field: 'year', type: 'ordinal', axis: WF.yearAxisLong('fiscal') },
      y: {
        field: 'ratio',
        type: 'quantitative',
        scale: { domain: [0, yMax || 3] },
        axis: {
          title: 'Treatment acres per acre burned',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          titleAngle: -90,
          titleX: -48
        }
      },
      tooltip: [
        { field: 'year', title: 'Year label' },
        { field: 'ratio', title: 'Ratio', format: '.2f' },
        { field: 'treatment_millions', title: 'Treatment (M)', format: '.2f' },
        { field: 'acres_millions', title: 'Acres burned (M)', format: '.1f' },
        { field: 'note', title: 'Read as' }
      ]
    }
  };
};

WF.buildPolicyScatterSpec = function (data) {
  const { policyScatter } = data;
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.compactChartHeight(),
    config: WF.chartConfig,
    data: { values: policyScatter },
    layer: [
    {
    mark: { type: 'point', filled: true, size: 100, stroke: 'white', strokeWidth: 1.5 },
    encoding: {
      x: {
        field: 'treatment', type: 'quantitative',
        axis: {
          title: 'FS treatment acres (M, year t)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#2a6b4a'
        }
      },
      y: {
        field: 'acres', type: 'quantitative',
        axis: {
          title: 'National acres burned (M, year t+1)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#c94a1a'
        }
      },
      color: { field: 'outcome_year', type: 'ordinal', legend: { title: 'Outcome year' } },
      opacity: { condition: { test: 'datum.partial', value: 0.5 }, value: 1 },
      tooltip: [
        { field: 'treatment_year', title: 'Treatment year' },
        { field: 'outcome_year', title: 'Outcome year' },
        { field: 'treatment', title: 'FS treatment (M)', format: '.1f' },
        { field: 'acres', title: 'Acres burned (M)', format: '.1f' },
        { field: 'partial', title: 'Partial outcome year' },
        { field: 'n_warning', title: 'Sample size note' }
      ]
    }
    },
    {
      data: { values: [{ label: 'n = 3 FS year pairs (2023-2025)' }] },
      mark: {
        type: 'text', align: 'left', baseline: 'top', dx: 4, dy: 4,
        font: 'DM Mono, monospace', fontSize: 9, color: '#9b9590'
      },
      encoding: { text: { field: 'label', type: 'nominal' } }
    }
    ]
  };
};

WF.buildSmokePm25Spec = function (data) {
  const series = (data.smokePm25Series || []).map(d => ({
    year: d.year,
    smoke_pm25: d.smoke_pm25,
    scope_note: d.scope_note
  }));
  const storyMarks = [{ year: '2020', label: 'Record smoke' }]
    .map(m => {
      const pt = series.find(d => d.year === m.year);
      return pt ? { year: m.year, smoke_pm25: pt.smoke_pm25, label: m.label } : null;
    })
    .filter(Boolean);
  const layers = [
    {
      data: { values: series },
      mark: {
        type: 'line',
        color: '#6b5b4f',
        strokeWidth: 2,
        point: { filled: true, fill: 'white', stroke: '#6b5b4f', strokeWidth: 1.5, size: 45 }
      },
      encoding: {
        x: { field: 'year', type: 'ordinal', axis: WF.yearAxis({ title: 'Calendar year' }) },
        y: {
          field: 'smoke_pm25',
          type: 'quantitative',
          axis: {
            title: 'Mean daily smoke PM2.5 (µg/m³)',
            titleFont: 'DM Sans',
            titleFontSize: 10,
            titleColor: '#9b9590',
            titleAngle: -90,
            titleX: -48,
            labelColor: '#9b9590',
            labelFont: 'DM Mono, monospace',
            labelFontSize: 9
          }
        },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'smoke_pm25', title: 'Smoke PM2.5', format: '.3f' },
          { field: 'scope_note', title: 'Scope' }
        ]
      }
    }
  ];
  const storyLayer = WF.storyYearTextLayer(storyMarks, 'year', 'smoke_pm25', -0.08);
  if (storyLayer) layers.push(storyLayer);

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    layer: layers
  };
};

WF.buildWesterlingSnowmeltSpec = function (data) {
  const values = data.westerlingSnowmeltSeries || [];
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    data: { values },
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'snowmelt_timing',
        type: 'nominal',
        sort: ['Early tercile', 'Middle tercile', 'Late tercile'],
        axis: {
          title: 'Snowmelt timing (Westerling et al. 2006)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          labelFont: 'DM Sans',
          labelFontSize: 10,
          labelColor: '#6b6560'
        }
      },
      xOffset: { field: 'metric', type: 'nominal' },
      y: {
        field: 'share_pct',
        type: 'quantitative',
        axis: {
          title: 'Share (%)',
          titleFont: 'DM Sans',
          titleFontSize: 10,
          titleColor: '#9b9590',
          titleAngle: -90,
          titleX: -48,
          labelColor: '#9b9590',
          labelFont: 'DM Mono, monospace',
          labelFontSize: 9
        }
      },
      color: {
        field: 'metric',
        type: 'nominal',
        scale: {
          domain: ['Share of fires', 'Share of area burned'],
          range: ['#4a7c9e', '#c94a1a']
        },
        legend: {
          title: null,
          orient: 'bottom',
          direction: 'horizontal',
          labelFontSize: 10
        }
      },
      tooltip: [
        { field: 'snowmelt_timing', title: 'Snowmelt' },
        { field: 'metric', title: 'Metric' },
        { field: 'share_pct', title: 'Share (%)', format: '.0f' },
        { field: 'notes', title: 'Notes' }
      ]
    }
  };
};

  window.WF = WF;
})();
