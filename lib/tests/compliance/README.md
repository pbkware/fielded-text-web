# FTStd0.9 Compliance Suite

This suite is a separate, standards-compliance test program for Fielded Text.

Scope for this first implementation pass:

- Isolate compliance tests from the main unit suite.
- Establish requirement ID traceability artifacts.
- Run a baseline compliance test pass.
- Generate a non-compliance markdown report.

FT standard source used in this repository:

- `standard/FTStd0.9.pdf`
- `standard/FTStd0.9.txt` (extracted text for clause mapping)

Current status:

- Initial clause mappings have been applied for declarations, delimited quoting, EOL, field data types, and record error behavior.
- Coverage remains incremental and will continue to expand by requirement ID.

## Run

- `npm run test:compliance`
- `npm run compliance:baseline`

## Artifacts

- Requirement index: `tests/compliance/requirement-index.md`
- Traceability matrix: `tests/compliance/traceability.csv`
- JSON test output: `tests/compliance/artifacts/vitest-compliance.json`
- Non-compliance report: `tests/compliance/FTStd0.9-non-compliance-report.md`
