# P2-LA-02 — Protocol Provenance Visibility

## Objective

Make protocol provenance visible so users can see which assessments contributed to each protocol and item.

## In Scope

- Display provenance in protocol lists and protocol items.
- Show assessment type and date for each contribution.

## Out of Scope

- Protocol consolidation logic.
- Clinical export.

## Acceptance Criteria

- Each protocol shows its originating assessment type and date.
- Each protocol item shows one or more contributing assessments.
- Items with no provenance are labeled clearly (e.g., “Manual”).

## Implementation Notes

- Must use existing provenance fields where present.

## Manual Verification Checklist

- Create protocols from two different assessments.
- Verify each protocol and item displays provenance.

## Risks / Edge Cases

- Legacy items without provenance data.
