# P2-LA-01 — Robust Protocol Deduplication

## Objective

Improve protocol deduplication beyond insert-time checks to handle updates, removals, and reassessments.

## In Scope

- Deduplication across existing protocol items.
- Handling updates and reassessments.
- Consistent behavior when items are removed or reintroduced.

## Out of Scope

- Protocol consolidation engine (covered in P0-LA-02).

## Acceptance Criteria

- Duplicate items are not created when reassessments are added.
- Deduplication remains stable after protocol edits or removals.
- The system can identify duplicates across all active protocols.

## Implementation Notes

- Must operate on existing items, not just new insert flow.

## Manual Verification Checklist

- Add protocol items from two assessments with overlap.
- Remove an item, re-run assessment, and confirm deduplication still holds.

## Risks / Edge Cases

- Same name with different dosage or instructions.
