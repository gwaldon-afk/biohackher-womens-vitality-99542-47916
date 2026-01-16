# Index — Longitudinal Assessment → Protocol → Plan

## Current State Summary

- Individual assessment result views exist (LIS, symptom, nutrition, hormone).
- Protocol items can be included in plans via `included_in_plan`.
- Consolidation is partial (cross-assessment insights exist but no protocol consolidation).
- Clinical export and assessment-scoped protocol views are not implemented.

## Tickets

### P0

- `P0-LA-01-assessment-scoped-protocol-views.md`
- `P0-LA-02-protocol-consolidation-engine.md`

### P1

- `P1-LA-01-longitudinal-plan-enrichment.md`
- `P1-LA-02-clinical-export-summary.md`

### P2

- `P2-LA-01-robust-protocol-deduplication.md`
- `P2-LA-02-protocol-provenance-visibility.md`

## Definition of Done (Longitudinal Intelligence)

- Users can view protocols scoped to a single assessment with no leakage.
- Protocols can consolidate across assessments with deduplication and attribution.
- Plans are enriched by multiple assessments without overwhelming the user.
- A clinician-ready export summarizes assessments, protocols, and adherence.
