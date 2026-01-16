# P2-LI-03 — Export Customisation Options

## Purpose

Allow users to tailor which sections appear in the clinical export, while keeping the report non-diagnostic.

## In Scope

- Section-level include/exclude controls.
- Preserve plain-language and disclaimer requirements.

## Out of Scope

- New export data types.
- Clinical diagnostics.

## Dependencies

- P1-LI-02 clinical export summary.

## Acceptance Criteria

- User can include/exclude sections (assessments, protocols, adherence).
- Export remains printable and compliant with disclaimers.

## Manual Verification Steps

- Generate export with a subset of sections.
- Verify formatting and disclaimers remain intact.
