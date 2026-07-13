# NICC annual report PDFs (local only)

Download source PDFs used by `scripts/build_western_acres.py`.
These files are gitignored (~100MB+). Re-download when rebuilding.

Base index: https://www.nifc.gov/nicc/predictive-services/intelligence

## Required for the western acres pipeline

| Years covered | Local filename | URL |
|---|---|---|
| 2003 | `annual_report_2003_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2003/annual_report_2003_508.pdf |
| 2004 | `annual_report_2004_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2004/annual_report_2004_508.pdf |
| 2005 | `annual_report_2005_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2005/annual_report_2005_508.pdf |
| 2006 | `Annual_Report_2006.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2006/Annual_Report_2006.pdf |
| 2007 | `annual_report_2007_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2007/annual_report_2007_508.pdf |
| 2008 | `annual_report_2008_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2008/annual_report_2008_508.pdf |
| 2009 | `annual_report_2009_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2009/annual_report_2009_508.pdf |
| 2010 | `annual_report_2010_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2010/annual_report_2010_508.pdf |
| 2011 | `annual_report_2011_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2011/annual_report_2011_508.pdf |
| 2012 | `annual_report_2012_508.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2012/annual_report_2012_508.pdf |
| 2013-2023 | `annual_report_2023.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2023/annual_report_2023.pdf |
| 2014-2024 | `annual_report_2024.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2024/annual_report_2024.pdf |
| 2015-2025 | `annual_report_2025.pdf` | https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2025/annual_report_2025.pdf |

```bash
cd data/nicc-source
curl -LO "https://www.nifc.gov/sites/default/files/NICC/2-Predictive%20Services/Intelligence/Annual%20Reports/2025/annual_report_2025.pdf"
# …repeat for other URLs above…
python ../../scripts/build_western_acres.py
```

Derived products checked into git: `../western-acres-annual.csv`, `../regional-acres-annual.csv`, `../nicc-gacc-acres-source.csv`.

**Pre-2010 notes:** 2003-2006 and 2010-2012 use lightning+human tables; 2007 uses multi-year text totals; **2008-2009 are skipped** (no extractable GACC table). See `../pre2010-acres-notes.md`.

Regenerate regional totals without PDFs:

```bash
python scripts/build_western_acres.py --from-csv
```
