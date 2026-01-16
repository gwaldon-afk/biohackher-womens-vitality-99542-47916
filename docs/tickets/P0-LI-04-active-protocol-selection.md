# P0-LI-04 — Active Protocol Selection

## Purpose

Ensure users explicitly choose which protocols affect plans.

## In Scope

- Active protocol selection control.
- Only active protocols feed Today Plan.

## Out of Scope

- Protocol consolidation.
- Clinical export.

## Dependencies

- Existing plan composition logic.

## Acceptance Criteria

- Only active protocols feed Today Plan.
- Deactivated protocols do not influence plans.

## Manual Verification Steps

- Activate two protocols; confirm both feed the plan.
- Deactivate one; confirm it no longer affects Today Plan.
