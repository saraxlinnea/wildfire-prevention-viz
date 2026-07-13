# Federal treatment acres per national acre burned (exploratory)

Repository research only. **Not treatment effectiveness.**

## Definition

Combined federal hazardous-fuels treatment (million acres) divided by national acres burned (million acres) for the same year label. Fiscal/calendar mismatch applies for HFR era.

## Interpretation

- High ratio: more reported treatment relative to that year's burn total (not necessarily causal).
- Low ratio: less treatment or more acres burned.
- WUI designation share can rise while total treatment falls.

## Limitations

- Treatment ≠ risk reduced; acres burned ≠ preventable fraction.
- Fiscal vs calendar year mismatch.
- Not causal.

## Reproduce

Derived in page `buildDatasets` as `treatmentPerAcreSeries` from HFR + page treatment and NIFC acres.
