# DC-P2-01 — Telemetry and QA Script

Objective:
Define telemetry events and QA script for Daily Check-in.

In scope:
- Event list and basic payloads
- Manual QA script steps

Out of scope:
- Analytics vendor implementation
- Automated testing frameworks

Acceptance criteria:
- Events documented with names and key fields
- QA checklist covers enable/disable/skip/complete flows

Implementation notes:
- Files likely touched: analytics event constants, QA docs
- Constraint: No PII in telemetry payloads

Manual verification checklist:
- Ensure all key flows produce expected events
- QA script can be followed by a tester

Risks / edge cases:
- Over-collection of sensitive info
- Missing events for skip/disable
