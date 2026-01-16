# P1-LI-02 — Clinical Export Summary

## Purpose

Implement a clinician-ready export that is printable, plain-language, and non-diagnostic.

## In Scope

- Assessment summary with time context.
- Key findings in plain language.
- Active protocols and adherence signals.
- Non-diagnostic disclaimers.

## Out of Scope

- Raw answer data dumps.
- AI narrative generation.
- Wearables or biometrics integration.

## Dependencies

- P0-LI-01 provenance (for source attribution).

## Acceptance Criteria

- Export is printable / PDF-friendly.
- Plain language, no raw data dump.
- Includes clear disclaimers.

## Manual Verification Steps

- Generate an export for a user with multiple assessments.
- Confirm all required sections and disclaimers appear.
