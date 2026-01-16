# P0-03 — Enforce Guest Assessment Limit

Priority: P0
Status: Open

Problem:
Guest users can complete multiple assessment types and retakes.

Goal:
Enforce “one full assessment total” for guests unless they register.

Files:
- src/hooks/useGuestAssessmentGate.tsx
- Guest assessment pages

Tasks:
- Enforce one assessment total across all types
- Block starting additional assessments after completion
- Show clear CTA to register

Acceptance Criteria:
- Guest completes one assessment and cannot start another
- Blocked state shows explicit messaging
