# P0-02 — Protect 7-Day Plan Routes

Priority: P0
Status: Open

Problem:
The /7-day-plan/:pillar route appears accessible without authentication.

Goal:
Guests can see results and analysis only. Protocols and plans require registration.

Files:
- src/App.tsx
- Plan-related pages/components

Tasks:
- Wrap /7-day-plan/:pillar with ProtectedRoute
- Apply RequireHealthProfile if required
- Verify all plan routes are gated consistently

Acceptance Criteria:
- Guests are redirected to /auth
- Redirect shows visible “Redirecting…” state
- Signed-in users can access normally
