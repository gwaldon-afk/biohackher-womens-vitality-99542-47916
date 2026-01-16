# P0-05 — Remove Null Render Paths

Priority: P0
Status: Open

Problem:
Some pages return null when required state is missing, causing blank screens.

Goal:
Never render a blank screen during navigation or missing-state scenarios.

Files:
- src/pages/AssessmentResults.tsx
- Any other pages returning null

Tasks:
- Replace return null with visible fallback UI
- Add clear CTA or redirect with loading state

Acceptance Criteria:
- No blank screens when navigating directly to result pages
- Users always see a next step
