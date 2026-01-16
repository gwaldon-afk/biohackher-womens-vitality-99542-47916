# DC-P0-07 — "Why This Matters Today" Expandable

Objective:
Add an expandable "Why this matters today" explanation for users who want context.

In scope:
- Expand/collapse UI near check-in
- Approved copy block (verbatim)

Out of scope:
- New education content
- Medical explanations

Acceptance criteria:
- Expandable element visible in check-in flow
- Copy matches approved text verbatim
- Default collapsed

Implementation notes:
- Files likely touched: `src/components/checkin/*`
- Constraint: Copy must be verbatim

Manual verification checklist:
- Expand and collapse works
- Copy matches exactly

Risks / edge cases:
- Reflow issues on small screens
- Copy localization missing

Approved copy (verbatim):
Title: Why this matters today
Body: Your check-in helps me keep today realistic. If sleep is low or stress is high, we’ll lean into recovery and smaller wins. If energy is strong, we can safely push a little more. You’re always in control — this just helps match the plan to the day you’re actually having.
