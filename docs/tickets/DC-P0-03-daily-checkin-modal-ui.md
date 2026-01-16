# DC-P0-03 — Daily Check-in Modal UI

Objective:
Show a friendly, conversational Daily Check-in modal on Today page entry.

In scope:
- Modal/popup entry on Today page
- Required questions and optional notes/tags
- Skip and disable actions

Out of scope:
- Plan modifiers
- Settings page toggle

Acceptance criteria:
- Modal appears on Today entry when enabled and no check-in today
- Required questions enforce completion before submit
- "Skip today" dismisses and does not re-prompt same day
- "Turn off daily check-in" disables future prompts
- No medical/diagnostic language

Implementation notes:
- Files likely touched: `src/components/checkin/*`, Today page container
- Constraint: Use approved copy strings verbatim
- Constraint: Modal must be dismissible without errors

Manual verification checklist:
- Open /today: modal appears
- Submit with missing required question: validation shown
- Skip today: modal does not reappear today
- Disable: modal never appears

Risks / edge cases:
- Modal stacking with other dialogs
- Keyboard interaction on mobile
