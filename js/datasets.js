/* global WF */
const WF = window.WF || {};

WF.parseCSVLine = function (line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else current += ch;
  }
  values.push(current.trim());
  return values;
};

WF.parseWildfireCSV = function (text) {
  const lines = text.trim().split('\n');
  const headers = WF.parseCSVLine(lines[0]).map(h => h.trim());
  return lines.slice(1)
    .map(line => {
      const values = WF.parseCSVLine(line);
      const row = {};
      headers.forEach((header, i) => { row[header] = (values[i] || '').trim(); });
      return row;
    })
    .filter(row => /^\d{4}$/.test(row.year));
};

WF.parseSimpleCSV = function (text) {
  const lines = text.trim().split('\n');
  const headers = WF.parseCSVLine(lines[0]);
  return lines.slice(1)
    .map(line => {
      const values = WF.parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
      return row;
    })
    .filter(row => /^\d{4}$/.test(row.year));
};

WF.computeRollingBaseline = function (burnData) {
  const byYear = Object.fromEntries(burnData.map(d => [d.year, d.acres]));
  return burnData.map(d => {
    const y = parseInt(d.year, 10);
    const window = [];
    for (let i = y - 10; i < y; i++) {
      const key = String(i);
      if (byYear[key] !== undefined) window.push(byYear[key]);
    }
    if (window.length < 10) {
      return {
        year: d.year, acres: d.acres,
        rolling_min: null, rolling_max: null, rolling_mean: null,
        pct_dev: null, pct_min: null, pct_max: null
      };
    }
    const rolling_min = Math.min(...window);
    const rolling_max = Math.max(...window);
    const rolling_mean = window.reduce((a, b) => a + b, 0) / 10;
    const pct_dev = ((d.acres - rolling_mean) / rolling_mean) * 100;
    return {
      year: d.year, acres: d.acres,
      rolling_min, rolling_max, rolling_mean,
      pct_dev,
      pct_min: ((rolling_min - rolling_mean) / rolling_mean) * 100,
      pct_max: ((rolling_max - rolling_mean) / rolling_mean) * 100
    };
  });
};

WF.rollingForYear = function (burnData, targetYear) {
  const byYear = Object.fromEntries(burnData.map(d => [d.year, d.acres]));
  const window = [];
  for (let i = targetYear - 10; i < targetYear; i++) {
    const key = String(i);
    if (byYear[key] !== undefined) window.push(byYear[key]);
  }
  if (window.length < 10) return null;
  const rolling_mean = window.reduce((a, b) => a + b, 0) / 10;
  return { rolling_min: Math.min(...window), rolling_max: Math.max(...window), rolling_mean };
};

WF.zScores = function (rows, key) {
  const vals = rows.map(r => r[key]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length);
  if (sd === 0) return rows.map(r => ({ ...r, z: 0 }));
  return rows.map(r => ({ ...r, z: (r[key] - mean) / sd }));
};

WF.pearson = function (xs, ys) {
  const n = xs.length;
  if (n < 2 || n !== ys.length) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const xv = xs[i] - mx;
    const yv = ys[i] - my;
    num += xv * yv;
    dx += xv * xv;
    dy += yv * yv;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? null : num / denom;
};

WF.buildDatasets = function (rows, vpdRows, ercRows, regionalAcresRows, hfrRows) {
  const years = rows.map(r => r.year);
  const burnData = rows
    .filter(r => r.acres_burned_millions && r.acres_burned_partial !== 'true')
    .map(r => ({ year: r.year, acres: parseFloat(r.acres_burned_millions) }));
  const burnWithRolling = WF.computeRollingBaseline(burnData);
  const bandData = burnWithRolling.filter(d => d.rolling_min !== null);
  const partial2026 = rows
    .filter(r => r.acres_burned_partial === 'true')
    .map(r => {
      const acres = parseFloat(r.acres_burned_millions);
      const rolling = WF.rollingForYear(burnData, 2026);
      const pct_dev = rolling ? ((acres - rolling.rolling_mean) / rolling.rolling_mean) * 100 : null;
      return { year: r.year, acres, pct_dev, partial: true };
    });
  const forecastRow = rows.find(r => r.forecast_low);
  const forecast2026 = forecastRow
    ? [{ year: forecastRow.year, low: parseFloat(forecastRow.forecast_low), high: parseFloat(forecastRow.forecast_high) }]
    : [];

  const fsByYear = Object.fromEntries(
    rows.filter(r => r.fs_treatment_millions).map(r => [r.year, parseFloat(r.fs_treatment_millions)])
  );
  const interiorByYear = Object.fromEntries(
    rows.filter(r => r.interior_treatment_millions).map(r => [r.year, parseFloat(r.interior_treatment_millions)])
  );
  const fsData = Object.entries(fsByYear).map(([year, treatment]) => ({ year, treatment }));
  const interiorData = Object.entries(interiorByYear).map(([year, treatment]) => ({ year, treatment }));

  const treatmentYears = [...new Set([...Object.keys(fsByYear), ...Object.keys(interiorByYear)])].sort();
  const policyCombined = treatmentYears.map((year, i, arr) => {
    const fs = fsByYear[year] || 0;
    const interior = interiorByYear[year] || 0;
    const total = (fsByYear[year] !== undefined ? fs : 0) + (interiorByYear[year] !== undefined ? interior : 0);
    const prev = i > 0 ? arr[i - 1] : null;
    let yoy_pct = null;
    if (prev) {
      const prevTotal = (fsByYear[prev] || 0) + (interiorByYear[prev] || 0);
      if (prevTotal > 0) yoy_pct = ((total - prevTotal) / prevTotal) * 100;
    }
    return {
      year,
      total,
      fs: fsByYear[year] ?? null,
      interior: interiorByYear[year] ?? null,
      yoy_pct,
      fs_fiscal_note: interiorByYear[year] !== undefined,
      interior_fiscal: interiorByYear[year] !== undefined
    };
  }).filter(d => d.total > 0);

  const dsciFull = rows
    .filter(r => r.dsci_avg && r.dsci_partial !== 'true')
    .map(r => ({ year: r.year, dsci: parseFloat(r.dsci_avg) }));
  const dsciPartial = rows
    .filter(r => r.dsci_avg && r.dsci_partial === 'true')
    .map(r => ({ year: r.year, dsci: parseFloat(r.dsci_avg), partial: true }));
  const dsciBridge = dsciFull.length && dsciPartial.length
    ? [
        { year: dsciFull[dsciFull.length - 1].year, dsci: dsciFull[dsciFull.length - 1].dsci },
        { year: dsciPartial[0].year, dsci: dsciPartial[0].dsci }
      ]
    : [];
  const dsciWestFull = rows
    .filter(r => r.dsci_west_avg && r.dsci_west_partial !== 'true')
    .map(r => ({ year: r.year, dsci: parseFloat(r.dsci_west_avg) }));
  const dsciWestPartial = rows
    .filter(r => r.dsci_west_avg && r.dsci_west_partial === 'true')
    .map(r => ({ year: r.year, dsci: parseFloat(r.dsci_west_avg), partial: true }));
  const dsciWestBridge = dsciWestFull.length && dsciWestPartial.length
    ? [
        { year: dsciWestFull[dsciWestFull.length - 1].year, dsci: dsciWestFull[dsciWestFull.length - 1].dsci },
        { year: dsciWestPartial[0].year, dsci: dsciWestPartial[0].dsci }
      ]
    : [];

  const vpdByYear = Object.fromEntries(vpdRows.map(r => [r.year, parseFloat(r.vpd_kpa)]));
  const vpdData = vpdRows.map(r => ({ year: r.year, vpd: parseFloat(r.vpd_kpa) }));
  const ercByYear = Object.fromEntries(ercRows.map(r => [r.year, parseFloat(r.erc)]));
  const ercData = ercRows.map(r => ({ year: r.year, erc: parseFloat(r.erc) }));

  const westDsciByYear = Object.fromEntries(dsciWestFull.map(d => [d.year, d.dsci]));
  const atmosOverlap = dsciWestFull
    .filter(d => vpdByYear[d.year] !== undefined && ercByYear[d.year] !== undefined)
    .map(d => ({
      year: d.year,
      dsci: d.dsci,
      vpd: vpdByYear[d.year],
      erc: ercByYear[d.year]
    }));
  const atmosZScoreBase = atmosOverlap.filter(d => parseInt(d.year, 10) <= 2025);
  const vpdZ = WF.zScores(atmosZScoreBase, 'vpd');
  const ercZ = WF.zScores(atmosZScoreBase, 'erc');
  const dsciZ = WF.zScores(atmosZScoreBase, 'dsci');
  const atmosZScore = atmosZScoreBase.map((d, i) => ({
    year: d.year,
    vpd: d.vpd,
    erc: d.erc,
    dsci: d.dsci,
    vpd_z: vpdZ[i].z,
    erc_z: ercZ[i].z,
    dsci_z: dsciZ[i].z,
    scope_note: 'Western VPD/ERC/DSCI; not national fire acres'
  }));

  const burnByYear = Object.fromEntries(burnData.map(d => [d.year, d.acres]));
  const westernBurnByYear = Object.fromEntries(
    rows
      .filter(r => r.western_acres_burned_millions && r.acres_burned_partial !== 'true')
      .map(r => [r.year, parseFloat(r.western_acres_burned_millions)])
  );
  const acresByYearAll = Object.fromEntries(
    rows.filter(r => r.acres_burned_millions).map(r => [r.year, parseFloat(r.acres_burned_millions)])
  );
  const partialBurnYears = new Set(
    rows.filter(r => r.acres_burned_partial === 'true').map(r => r.year)
  );
  const scatterRowsNationalVpd = [];
  const scatterRowsWesternVpd = [];
  const scatterRowsNationalErc = [];
  const scatterRowsWesternErc = [];
  for (let y = 2010; y <= 2025; y++) {
    const year = String(y);
    if (burnByYear[year] !== undefined && vpdByYear[year] !== undefined) {
      scatterRowsNationalVpd.push({
        year,
        acres: burnByYear[year],
        driver: vpdByYear[year],
        geo_note: 'National acres vs western VPD'
      });
    }
    if (westernBurnByYear[year] !== undefined && vpdByYear[year] !== undefined) {
      scatterRowsWesternVpd.push({
        year,
        acres: westernBurnByYear[year],
        driver: vpdByYear[year],
        geo_note: 'Western GACC acres vs western VPD'
      });
    }
    if (burnByYear[year] !== undefined && ercByYear[year] !== undefined) {
      scatterRowsNationalErc.push({
        year,
        acres: burnByYear[year],
        driver: ercByYear[year],
        geo_note: 'National acres vs western ERC'
      });
    }
    if (westernBurnByYear[year] !== undefined && ercByYear[year] !== undefined) {
      scatterRowsWesternErc.push({
        year,
        acres: westernBurnByYear[year],
        driver: ercByYear[year],
        geo_note: 'Western GACC acres vs western ERC'
      });
    }
  }
  const scatterRows = scatterRowsNationalVpd;

  const westernFromRegional = Object.fromEntries(
    (regionalAcresRows || [])
      .filter(r => r.western_acres_millions)
      .map(r => [r.year, parseFloat(r.western_acres_millions)])
  );

  const lagRows = [];
  const vpdYearNums = Object.keys(vpdByYear).map(y => parseInt(y, 10)).filter(Number.isFinite);
  const burnYearNums = Object.keys(burnByYear).map(y => parseInt(y, 10)).filter(Number.isFinite);
  const lagStart = vpdYearNums.length ? Math.min(...vpdYearNums) : 1979;
  const lagEnd = burnYearNums.length ? Math.max(...burnYearNums) - 1 : 2024;
  for (let y = lagStart; y <= lagEnd; y++) {
    const year = String(y);
    const nextYear = String(y + 1);
    if (vpdByYear[year] !== undefined && burnByYear[nextYear] !== undefined) {
      lagRows.push({
        driver_year: year,
        outcome_year: nextYear,
        vpd: vpdByYear[year],
        acres: burnByYear[nextYear],
        label: `${year} VPD → ${nextYear} acres`,
        geo_note: 'Western VPD vs national acres'
      });
    }
  }

  const westernAcresSeries = [];
  for (let y = 2003; y <= 2025; y++) {
    const year = String(y);
    const western = westernBurnByYear[year] ?? westernFromRegional[year];
    if (western !== undefined) {
      westernAcresSeries.push({
        year,
        western,
        national: burnByYear[year] ?? null,
        geo_note: 'Seven western GACCs (NICC); excludes AK, EA, SA'
      });
    }
  }

  const hfrByYear = Object.fromEntries(
    (hfrRows || []).map(r => {
      const year = r.fiscal_year;
      return [year, {
        total: parseFloat(r.combined_treatment_acres) / 1e6,
        fs: parseFloat(r.fs_treatment_acres) / 1e6,
        doi: parseFloat(r.doi_treatment_acres) / 1e6
      }];
    })
  );
  const hfrFsData = Object.entries(hfrByYear)
    .map(([year, v]) => ({ year, treatment: v.fs }))
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  const hfrInteriorData = Object.entries(hfrByYear)
    .map(([year, v]) => ({ year, treatment: v.doi }))
    .sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  const policyLongSeries = [];
  for (let y = 2003; y <= 2025; y++) {
    const year = String(y);
    const hfr = hfrByYear[year];
    const page = policyCombined.find(d => d.year === year);
    if (y <= 2021 && hfr) {
      policyLongSeries.push({
        year,
        total: hfr.total,
        fs: hfr.fs,
        interior: hfr.doi,
        source: 'HFR fiscal',
        interior_fiscal: true
      });
    } else if (page && page.total > 0) {
      policyLongSeries.push({
        ...page,
        source: 'Page series'
      });
    }
  }
  const policyInteriorBreakdown = [
    ...hfrInteriorData,
    ...interiorData.filter(d => parseInt(d.year, 10) > 2021)
  ];
  const policyFsBreakdown = [
    ...hfrFsData,
    ...fsData.filter(d => parseInt(d.year, 10) > 2021)
  ];

  const treatmentAcresOverlap = [];
  const policyLongByYear = Object.fromEntries(policyLongSeries.map(d => [d.year, d]));
  for (let y = 2003; y <= 2025; y++) {
    const year = String(y);
    const policyPt = policyLongByYear[year];
    const acres = burnByYear[year];
    if (!policyPt && acres === undefined) continue;
    treatmentAcresOverlap.push({
      year,
      treatment_millions: policyPt ? policyPt.total : null,
      treatment_source: policyPt ? policyPt.source : null,
      acres_millions: acres ?? null,
      overlap_note: 'Same timeline, different measures. Not proof one caused the other.'
    });
  }

  const regionalShareSeries = [];
  (regionalAcresRows || [])
    .filter(r => r.gacc_coverage === 'all_gaccs')
    .forEach(r => {
      const year = r.year;
      const regions = [
        { region: 'West', share: parseFloat(r.western_share_of_gacc) },
        { region: 'South', share: parseFloat(r.southern_share_of_gacc) },
        { region: 'Alaska', share: parseFloat(r.alaska_share_of_gacc) },
        { region: 'East', share: parseFloat(r.eastern_share_of_gacc) }
      ];
      regions.forEach(({ region, share }) => {
        if (!Number.isFinite(share)) return;
        regionalShareSeries.push({
          year,
          region,
          share_pct: Math.round(share * 1000) / 10,
          geo_note: 'NICC GACC acres share of national GACC sum'
        });
      });
    });
  regionalShareSeries.sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));

  const proxyRankBars = [
    {
      label: 'Western ERC → western acres',
      r: 0.821,
      tier: 'strong',
      geo: 'Western GACC acres · gridMET west of 100°W'
    },
    {
      label: 'Western VPD → western acres',
      r: 0.808,
      tier: 'strong',
      geo: 'Western GACC acres · gridMET west of 100°W'
    },
    {
      label: 'Western VPD → national acres',
      r: 0.625,
      tier: 'moderate',
      geo: 'National NIFC acres · western VPD (geo mismatch)'
    },
    {
      label: 'National DSCI → national acres',
      r: 0.097,
      tier: 'weak',
      geo: 'Contiguous U.S. DSCI · national acres'
    },
    {
      label: 'Western DSCI → western acres',
      r: 0.075,
      tier: 'weak',
      geo: 'NWS Western Region DSCI · western GACC acres'
    }
  ].sort((a, b) => b.r - a.r);

  const lagPearsonVpdNational = lagRows.length >= 2
    ? WF.pearson(lagRows.map(d => d.vpd), lagRows.map(d => d.acres))
    : null;

  const policyScatter = [];
  ['2023', '2024', '2025'].forEach(y => {
    if (fsByYear[y] === undefined) return;
    const nextY = String(parseInt(y, 10) + 1);
    if (acresByYearAll[nextY] !== undefined) {
      policyScatter.push({
        treatment_year: y,
        outcome_year: nextY,
        treatment: fsByYear[y],
        acres: acresByYearAll[nextY],
        partial: partialBurnYears.has(nextY),
        n_warning: 'FS treatment comparable 2023-2025 only (3 pairs max)'
      });
    }
  });

  return {
    burnData, burnWithRolling, bandData, partial2026, forecast2026,
    fsData, interiorData, policyCombined, policyLongSeries,
    hfrFsData, hfrInteriorData, policyInteriorBreakdown, policyFsBreakdown,
    dsciFull, dsciPartial, dsciBridge,
    dsciWestFull, dsciWestPartial, dsciWestBridge,
    vpdData, ercData, atmosZScore,
    scatterRows,
    scatterRowsNationalVpd, scatterRowsWesternVpd,
    scatterRowsNationalErc, scatterRowsWesternErc,
    lagRows, policyScatter,
    westernAcresSeries, regionalShareSeries, proxyRankBars, treatmentAcresOverlap,
    years,
    pearsonVpdAcres: 0.625,
    pearsonVpdWesternAcres: 0.808,
    pearsonErcWesternAcres: 0.821,
    pearsonErcNationalAcres: 0.532,
    pearsonDsciNationalAcres: 0.097,
    pearsonDsciWesternAcres: 0.075,
    lagPearsonVpdNational
  };
};

window.WF = WF;
