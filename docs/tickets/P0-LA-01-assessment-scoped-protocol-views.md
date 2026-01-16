# P0-LA-01 — Assessment-Scoped Protocol Views

## Objective

Allow users to view protocols derived from a single assessment, with clear provenance and no leakage from other assessments.

## In Scope

- Protocol views filtered by assessment source.
- Provenance preserved (assessment → recommendation → protocol).

## Out of Scope

- Protocol consolidation across assessments.
- Export features.

## Acceptance Criteria

- From an individual assessment result view, users can open a protocol view that shows only items derived from that assessment.
- No protocol items from other assessments appear in the scoped view.
- The source assessment type and date are visible for the scoped protocol view.

## Implementation Notes

- Likely touches assessment result pages and protocol list views.
- Must use existing provenance fields (`source_recommendation_id`, `source_type`).
- Do not change assessment scoring or recommendation generation.

## Manual Verification Checklist

- Complete two different assessments.
- Open Assessment A’s protocol view → only items from A appear.
- Open Assessment B’s protocol view → only items from B appear.
- Confirm source labels match the assessment type and date.

## Risks / Edge Cases

- Protocol items created without provenance should be excluded or labeled as “Unknown source”.
