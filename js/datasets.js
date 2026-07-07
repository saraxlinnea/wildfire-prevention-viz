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

WF.buildDatasets = function (rows, vpdRows) {
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

  const westDsciByYear = Object.fromEntries(dsciWestFull.map(d => [d.year, d.dsci]));
  const atmosOverlap = dsciWestFull
    .filter(d => vpdByYear[d.year] !== undefined)
    .map(d => ({ year: d.year, dsci: d.dsci, vpd: vpdByYear[d.year] }));
  const atmosZScoreBase = atmosOverlap.filter(d => parseInt(d.year, 10) <= 2025);
  const vpdZ = WF.zScores(atmosZScoreBase, 'vpd');
  const dsciZ = WF.zScores(atmosZScoreBase, 'dsci');
  const atmosZScore = atmosZScoreBase.map((d, i) => ({
    year: d.year,
    vpd: d.vpd,
    dsci: d.dsci,
    vpd_z: vpdZ[i].z,
    dsci_z: dsciZ[i].z,
    scope_note: 'Western VPD/DSCI; not national fire acres'
  }));

  const burnByYear = Object.fromEntries(burnData.map(d => [d.year, d.acres]));
  const acresByYearAll = Object.fromEntries(
    rows.filter(r => r.acres_burned_millions).map(r => [r.year, parseFloat(r.acres_burned_millions)])
  );
  const partialBurnYears = new Set(
    rows.filter(r => r.acres_burned_partial === 'true').map(r => r.year)
  );
  const scatterRows = [];
  for (let y = 2010; y <= 2025; y++) {
    const year = String(y);
    if (burnByYear[year] !== undefined && vpdByYear[year] !== undefined) {
      scatterRows.push({
        year,
        acres: burnByYear[year],
        vpd: vpdByYear[year],
        geo_note: 'National acres vs western VPD'
      });
    }
  }

  const lagRows = [];
  for (let y = 2010; y <= 2024; y++) {
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
    fsData, interiorData, policyCombined,
    dsciFull, dsciPartial, dsciBridge,
    dsciWestFull, dsciWestPartial, dsciWestBridge,
    vpdData, atmosZScore, scatterRows, lagRows, policyScatter,
    years,
    pearsonVpdAcres: 0.625
  };
};

window.WF = WF;
