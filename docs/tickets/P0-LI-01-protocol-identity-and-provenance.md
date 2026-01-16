# P0-LI-01 — Protocol Identity and Provenance

## Purpose

Define how protocol items are uniquely identified and preserve assessment → protocol provenance.

## In Scope

- Deterministic identity rules for protocol items.
- Recording provenance for each item (contributing assessment sources).

## Out of Scope

- Protocol consolidation logic (covered in P0-LI-02).
- Clinical export.
- AI augmentation.

## Dependencies

- Existing assessment recommendation data.
- Existing protocol storage model.

## Acceptance Criteria

- No duplicate protocol items are created when the same item is recommended across assessments.
- Each protocol item records contributing assessments (type + date).

## Manual Verification Steps

- Complete two assessments with overlapping recommendations.
- Accept both recommendations.
- Verify only one item exists with two contributing sources.
