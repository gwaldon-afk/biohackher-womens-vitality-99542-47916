# P0-LI-02 — Protocol Consolidation Engine

## Purpose

Implement deterministic consolidation across multiple assessments using rules (merge, reinforce, suppress, defer) with no AI.

## In Scope

- Rules-based consolidation of protocol recommendations.
- Deterministic conflict resolution.
- Provenance preserved across merged items.

## Out of Scope

- AI-generated recommendations or consolidation.
- Clinical export.

## Dependencies

- P0-LI-01 protocol identity and provenance.

## Acceptance Criteria

- Multiple assessments consolidate into one protocol set without duplicates.
- Conflicts are resolved deterministically and explainably.
- No AI is used or required.

## Manual Verification Steps

- Complete two assessments with overlapping and conflicting recommendations.
- Run consolidation and confirm merge/reinforce/suppress/defer outcomes.
