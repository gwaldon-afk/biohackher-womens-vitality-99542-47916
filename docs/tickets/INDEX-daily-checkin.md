# Daily Check-in Tickets Index

Feature summary:
Daily Check-in is a subjective, conversational prompt shown on Today entry to tailor the plan for the day. It should be skippable, disable-able, and never collect biometrics or wearables data.

Implementation order (recommended):
1) DC-P0-01 — Schema and copy
2) DC-P0-02 — Persistence
3) DC-P0-03 — Modal UI
4) DC-P0-07 — "Why this matters" expandable
5) DC-P0-04 — Rules-based modifiers
6) DC-P0-05 — Apply modifiers + badge
7) DC-P0-06 — Settings toggle + skip/disable
8) DC-P1-01 — AI contract stub
9) DC-P1-02 — Customisable questions v2
10) DC-P2-01 — Telemetry and QA script

Tickets:
- `docs/tickets/DC-P0-01-daily-checkin-schema-and-copy.md`
- `docs/tickets/DC-P0-02-daily-checkin-persistence.md`
- `docs/tickets/DC-P0-03-daily-checkin-modal-ui.md`
- `docs/tickets/DC-P0-04-rules-based-plan-modifiers.md`
- `docs/tickets/DC-P0-05-today-plan-application-and-badge.md`
- `docs/tickets/DC-P0-06-settings-toggle-skip-disable.md`
- `docs/tickets/DC-P0-07-why-this-matters-expandable.md`
- `docs/tickets/DC-P1-01-ai-modifiers-contract-stub.md`
- `docs/tickets/DC-P1-02-customisable-checkin-questions-v2.md`
- `docs/tickets/DC-P2-01-telemetry-and-qa-script.md`

Definition of Done:
- Schema and copy locked
- Check-in persists per day and respects skip/disable
- Modal UI uses approved copy
- Modifiers applied safely to Today plan
- Settings toggle visible and functional
- No biometrics or wearables inputs
- QA script documented
