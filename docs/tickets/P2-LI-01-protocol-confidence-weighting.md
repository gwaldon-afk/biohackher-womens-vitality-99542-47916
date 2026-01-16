# P2-LI-01 — Protocol Confidence Weighting

## Purpose

Introduce deterministic confidence weighting to reinforce or soften items as more data arrives.

## In Scope

- Rules-first confidence scoring.
- Use confidence to influence ordering or emphasis.

## Out of Scope

- AI scoring.
- Clinical export.

## Dependencies

- P0-LI-02 consolidation engine.

## Acceptance Criteria

- Confidence scores are deterministic and explainable.
- Reinforced items are emphasized without increasing plan overload.

## Manual Verification Steps

- Complete multiple assessments with overlapping items.
- Verify confidence increases and ordering reflects reinforcement.
