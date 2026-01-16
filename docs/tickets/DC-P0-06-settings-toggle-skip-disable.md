# DC-P0-06 — Settings Toggle, Skip, Disable

Objective:
Provide user controls to skip today and disable Daily Check-in.

In scope:
- Settings toggle (on/off)
- Skip today behavior
- Toast feedback

Out of scope:
- Advanced scheduling
- Reminders/notifications

Acceptance criteria:
- Toggle visible in Settings/Profile area
- Skip today persists and suppresses prompt for the day
- Disable prevents any prompt until re-enabled
- Toasts use approved copy strings

Implementation notes:
- Files likely touched: `src/pages/Settings.tsx` (or equivalent), check-in storage
- Constraint: Must not affect non-check-in settings
- Constraint: Use approved copy strings verbatim

Manual verification checklist:
- Toggle off: no prompt
- Toggle on: prompt appears if no check-in today
- Skip today: prompt suppressed same day

Risks / edge cases:
- Settings stored but not respected in UI
- Toggle states diverge between devices
