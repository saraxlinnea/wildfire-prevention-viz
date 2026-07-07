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
  view: { stroke: 'transparent' }
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

WF.yearAxis = function () {
  return {
    title: null,
    labelAngle: 0,
    labelExpr: "toNumber(datum.label) % 5 == 0 ? datum.label : ''"
  };
};

WF.buildFireSpec = function (data, mode) {
  const { burnWithRolling, bandData, partial2026, forecast2026 } = data;
  const isPct = mode === 'pct';

  let yDomain;
  if (isPct) {
    const pctVals = burnWithRolling.filter(d => d.pct_dev !== null).map(d => d.pct_dev);
    const partialPct = partial2026.map(d => d.pct_dev).filter(v => v !== null);
    const all = [...pctVals, ...partialPct, ...bandData.flatMap(d => [d.pct_min, d.pct_max])];
    const pad = Math.max(10, (Math.max(...all) - Math.min(...all)) * 0.1);
    yDomain = [Math.min(...all) - pad, Math.max(...all) + pad];
  } else {
    const acreVals = burnWithRolling.map(d => d.acres);
    const forecastHigh = forecast2026.length ? forecast2026[0].high : 0;
    yDomain = [0, Math.max(...acreVals, ...partial2026.map(d => d.acres), forecastHigh) * 1.08];
  }

  const yScale = { domain: yDomain };
  const yAxis = isPct
    ? {
        title: '% from 10-yr avg',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
        titleAngle: -90, titleX: -44, format: '+.0f'
      }
    : {
        title: 'Million acres',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
        titleAngle: -90, titleX: -36
      };

  const lineY = isPct ? 'pct_dev' : 'acres';
  const bandY = isPct ? 'pct_min' : 'rolling_min';
  const bandY2 = isPct ? 'pct_max' : 'rolling_max';
  const lineData = isPct ? burnWithRolling.filter(d => d.pct_dev !== null) : burnWithRolling;

  const layers = [
    {
      data: { values: bandData },
      mark: { type: 'area', color: '#c94a1a', opacity: 0.12 },
      encoding: {
        x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
        y: { field: bandY, type: 'quantitative', scale: yScale },
        y2: { field: bandY2 }
      }
    },
    {
      data: { values: lineData },
      mark: {
        type: 'line', color: '#c94a1a', strokeWidth: 2,
        point: { filled: true, fill: 'white', stroke: '#c94a1a', strokeWidth: 1.5, size: 40 }
      },
      encoding: {
        x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
        y: { field: lineY, type: 'quantitative', scale: yScale, axis: yAxis },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'acres', title: 'Acres burned (M)', format: '.1f' },
          { field: 'pct_dev', title: '% from 10-yr avg', format: '+.0f' },
          { field: 'rolling_mean', title: '10-yr avg (M)', format: '.2f' }
        ]
      }
    }
  ];

  if (!isPct) {
    layers.push(
      {
        data: { values: partial2026 },
        mark: { type: 'point', filled: true, color: '#e87c2a', size: 90, stroke: 'white', strokeWidth: 2 },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'acres', type: 'quantitative', scale: yScale },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'acres', title: 'Acres burned YTD Jun 18 (M)', format: '.1f' }
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
  } else if (partial2026.length && partial2026[0].pct_dev !== null) {
    layers.push({
      data: { values: partial2026 },
      mark: { type: 'point', filled: true, color: '#e87c2a', size: 90, stroke: 'white', strokeWidth: 2 },
      encoding: {
        x: { field: 'year', type: 'ordinal' },
        y: { field: 'pct_dev', type: 'quantitative', scale: yScale },
        tooltip: [
          { field: 'year', title: 'Year' },
          { field: 'pct_dev', title: '% from 10-yr avg (YTD)', format: '+.0f' }
        ]
      }
    });
  }

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.mainChartHeight(),
    config: WF.chartConfig,
    layer: layers
  };
};

WF.buildAtmosphericSpec = function (data) {
  const { atmosZScore } = data;
  const yAxis = {
    title: 'Std dev from 2000-2025 mean',
    titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590',
    titleAngle: -90, titleX: -48
  };
  const vpdLine = atmosZScore.map(d => ({ year: d.year, z: d.vpd_z, scope_note: d.scope_note }));
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
        data: { values: vpdLine },
        mark: {
          type: 'line', color: '#9a6b3a', strokeWidth: 2,
          point: { filled: true, fill: 'white', stroke: '#9a6b3a', strokeWidth: 1.5, size: 45 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
          y: { field: 'z', type: 'quantitative', axis: yAxis },
          tooltip: [
            { field: 'year', title: 'Year' },
            { field: 'z', title: 'Western VPD z-score', format: '.2f' },
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
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
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

WF.buildPolicySpec = function (data, mode) {
  const { policyCombined, fsData, interiorData } = data;
  const isBreakdown = mode === 'breakdown';
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
      data: { values: policyCombined },
      layer: [
        {
          mark: {
            type: 'line', color: '#2a6b4a', strokeWidth: 2.5,
            point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 2, size: 55 }
          },
          encoding: {
            x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
            y: { field: 'total', type: 'quantitative', scale: { domain: [0, 6] }, axis: yAxis },
            tooltip: [
              { field: 'year', title: 'Year' },
              { field: 'total', title: 'Combined federal (M acres)', format: '.2f' },
              { field: 'yoy_pct', title: 'YoY change %', format: '+.0f' },
              { field: 'interior_fiscal', title: 'Interior is fiscal year', format: '' }
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
        data: { values: interiorData },
        mark: {
          type: 'line', color: '#1a4a7a', strokeWidth: 2, strokeDash: [6, 2],
          point: { filled: true, fill: 'white', stroke: '#1a4a7a', strokeWidth: 1.5, size: 50 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal', axis: WF.yearAxis() },
          y: { field: 'treatment', type: 'quantitative', scale: { domain: [0, 6] }, axis: yAxis },
          tooltip: [
            { field: 'year', title: 'Year (Interior fiscal)' },
            { field: 'treatment', title: 'Interior (M acres)', format: '.2f' }
          ]
        }
      },
      {
        data: { values: fsData },
        mark: {
          type: 'line', color: '#2a6b4a', strokeWidth: 2.5,
          point: { filled: true, fill: 'white', stroke: '#2a6b4a', strokeWidth: 2, size: 55 }
        },
        encoding: {
          x: { field: 'year', type: 'ordinal' },
          y: { field: 'treatment', type: 'quantitative', scale: { domain: [0, 6] }, axis: null },
          tooltip: [
            { field: 'year', title: 'Year (calendar)' },
            { field: 'treatment', title: 'Forest Service (M acres)', format: '.1f' }
          ]
        }
      }
    ]
  };
};

WF.buildScatterSpec = function (data) {
  const { scatterRows, pearsonVpdAcres } = data;
  const rNote = `Pearson r ≈ ${pearsonVpdAcres.toFixed(2)} (exploratory)`;
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 'container',
    height: WF.secondaryChartHeight(),
    config: WF.chartConfig,
    data: { values: scatterRows },
    layer: [
    {
    mark: { type: 'point', filled: true, size: 80 },
    encoding: {
      x: {
        field: 'vpd', type: 'quantitative',
        title: 'Western fire-season VPD (kPa)',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9a6b3a'
      },
      y: {
        field: 'acres', type: 'quantitative', scale: { type: 'log' },
        title: 'National acres burned (M, log scale)',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#c94a1a'
      },
      color: {
        field: 'year', type: 'ordinal',
        legend: { title: 'Year', orient: 'right' }
      },
      tooltip: [
        { field: 'year', title: 'Year' },
        { field: 'vpd', title: 'Western VPD (kPa)', format: '.3f' },
        { field: 'acres', title: 'Acres burned (M)', format: '.1f' },
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
          x: { field: 'plot_year', type: 'ordinal', title: 'Driver year (VPD)', axis: WF.yearAxis() },
          y: {
            field: 'norm', type: 'quantitative',
            title: 'Normalized 0-1 (separate scales)',
            titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#9b9590'
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
        title: 'FS treatment acres (M, year t)',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#2a6b4a'
      },
      y: {
        field: 'acres', type: 'quantitative',
        title: 'National acres burned (M, year t+1)',
        titleFont: 'DM Sans', titleFontSize: 10, titleColor: '#c94a1a'
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

  window.WF = WF;
})();
