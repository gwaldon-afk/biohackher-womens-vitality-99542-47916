# P1-LA-01 — Longitudinal Plan Enrichment

## Objective

As assessment count increases, plans become more specific and tailored without overwhelming the user, while respecting user-selected active protocols.

## In Scope

- Plan enrichment based on multiple assessments.
- Respect active protocol selection and `included_in_plan`.

## Out of Scope

- New assessment types.
- AI-driven personalization.

## Acceptance Criteria

- With multiple assessments completed, plan content reflects additional specificity (more targeted items or ordering).
- Plan does not exceed a defined maximum number of “must-do” items.
- User-selected active protocols are always respected.

## Implementation Notes

- Use existing plan composition logic and protocol selection signals.
- Changes must be incremental, not a redesign.

## Manual Verification Checklist

- Complete one assessment → baseline plan.
- Complete a second assessment → plan becomes more specific (verify added specificity).
- Confirm item count does not exceed the defined maximum.

## Risks / Edge Cases

- Overloading the user with too many plan items.
