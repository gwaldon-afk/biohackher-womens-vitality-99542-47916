# DC-P1-02 — Customisable Check-in Questions (v2)

Objective:
Allow users to customize which check-in questions appear.

In scope:
- Per-user question configuration
- Defaults and safe fallbacks

Out of scope:
- New question types
- Personalized AI content

Acceptance criteria:
- User can enable/disable optional questions
- Required questions remain enforced
- Settings persist across sessions

Implementation notes:
- Files likely touched: Settings UI, check-in schema parser
- Constraint: No changes to question wording

Manual verification checklist:
- Toggle optional question off: hidden in flow
- Toggle on: appears again

Risks / edge cases:
- Invalid config leading to missing required questions
