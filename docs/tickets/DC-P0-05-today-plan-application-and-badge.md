# DC-P0-05 — Today Plan Application and Badge

Objective:
Apply plan modifiers to Today Plan rendering and show tailored badge.

In scope:
- Modifier application to Today plan items
- Tailored badge and tooltip

Out of scope:
- Changes to other plan pages
- New plan content creation

Acceptance criteria:
- Today plan reflects modifiers (prioritization, micro-actions, intensity shift)
- "Tailored for today" badge shown when modifiers applied
- No blank screens or blocking errors

Implementation notes:
- Files likely touched: Today plan page/components, plan item rendering utilities
- Constraint: Minimal UI changes, no redesign
- Constraint: Must not break checklist interactions

Manual verification checklist:
- With modifiers: badge visible and plan adjusted
- Without modifiers: badge hidden, plan unchanged
- Checklist items still editable

Risks / edge cases:
- Missing plan items to modify
- Duplicated micro-actions
