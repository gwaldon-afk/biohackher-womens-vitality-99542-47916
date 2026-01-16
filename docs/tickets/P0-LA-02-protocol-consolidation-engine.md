# P0-LA-02 — Protocol Consolidation Engine

## Objective

Define and implement a protocol consolidation engine that merges recommendations from multiple assessments into a single protocol set with deduplication and source attribution.

## In Scope

- Consolidate protocols across assessments.
- Deduplicate protocol items.
- Retain source attribution for each item.
- Confidence weighting rules (non-AI).

## Out of Scope

- AI-driven consolidation.
- Clinical export.

## Acceptance Criteria

- Given two assessments with overlapping recommendations, the consolidated protocol contains no duplicate items.
- Each consolidated protocol item includes a list of source assessments that contributed to it.
- Confidence weighting is deterministic and documented (no AI).
- Users can accept the consolidated protocol without losing existing protocol items.

## Implementation Notes

- Use existing `protocol_recommendations` and `protocols` provenance fields.
- Deduplication must be beyond insert-time; it should merge existing items across sources.
- Do not alter assessment result generation.

## Manual Verification Checklist

- Complete two assessments with overlapping items.
- Run consolidation and verify no duplicates exist.
- Verify each item lists one or more source assessments.

## Risks / Edge Cases

- Conflicting item variants (same name, different dosage/details).
