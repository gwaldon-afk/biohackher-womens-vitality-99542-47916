# P1-LA-02 — Clinical Export Summary

## Objective

Provide a printable, clinician-ready export that summarizes symptoms, assessments, protocols, and plan adherence.

## In Scope

- Export symptom summaries.
- Export assessment history.
- Export protocol lists.
- Export plan adherence/completions.
- Printable / PDF-ready output.

## Out of Scope

- AI-generated narrative summaries.
- Patient-provider messaging.

## Acceptance Criteria

- Users can export a single summary that includes:
  - Assessment history with dates and scores.
  - Active protocols and items.
  - Plan adherence/completions for the last 30 days.
  - Symptom summaries where available.
- Export is printable and renders cleanly as a PDF.

## Implementation Notes

- Avoid medical claims; keep data factual.
- Use existing data tables and completion logs.

## Manual Verification Checklist

- Complete at least one assessment and add protocol items.
- Mark several plan items as completed.
- Export summary and verify all sections appear correctly.

## Risks / Edge Cases

- Missing data for new users (must handle empty sections gracefully).
