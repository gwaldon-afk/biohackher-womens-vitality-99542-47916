# DC-P0-04 — Rules-Based Plan Modifiers

Objective:
Derive deterministic plan modifiers from Daily Check-in responses (MVP rules).

In scope:
- Normalization of check-in answers
- Rules-based modifiers output

Out of scope:
- AI-based modifiers
- UI rendering changes

Acceptance criteria:
- Normalized check-in output produced consistently
- Rules applied as specified in requirements
- Modifiers output matches contract shape

Implementation notes:
- Files likely touched: `src/lib/checkin/normalizeCheckin.ts`, `src/lib/checkin/derivePlanModifiers.ts`
- Constraint: No changes to plan scoring logic
- Constraint: Only subjective check-in inputs used

Manual verification checklist:
- Low energy -> time budget reduced
- High stress -> breathwork micro-action added
- Poor sleep -> recovery focus set
- Injury tag -> avoid impact constraint set

Risks / edge cases:
- Missing answers leading to unsafe defaults
- Conflicts between modifiers
